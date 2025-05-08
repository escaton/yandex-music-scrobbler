// @ts-check
import { YMApi } from 'ym-api'
import { z } from 'zod'
import { LastFMTrack } from 'lastfm-ts-api'

const envSchema = z.object({
    YM_TOKEN: z.string(),
    YM_UID: z.string().transform((val) => parseInt(val, 10)),
    LASTFM_API_KEY: z.string(),
    LASTFM_API_SECRET: z.string(),
    LASTFM_SESSION: z.string(),
})

const env = envSchema.parse(process.env)

const ymApi = new YMApi()
const lastFMtrack = new LastFMTrack(
    env.LASTFM_API_KEY,
    env.LASTFM_API_SECRET,
    env.LASTFM_SESSION
)

const HistoryReponseSchema = z.object({
    historyTabs: z.array(
        z.object({
            date: z.string(),
            items: z.array(
                z.object({
                    context: z.object({ type: z.string() }),
                    tracks: z.array(
                        z.object({
                            type: z.string(),
                            data: z.object({
                                fullModel: z.object({
                                    id: z.string(),
                                    title: z.string(),
                                    artists: z.array(
                                        z.object({ name: z.string() })
                                    ),
                                    durationMs: z.number(),
                                    albums: z.array(
                                        z.object({ title: z.string() })
                                    ),
                                }),
                            }),
                        })
                    ),
                })
            ),
        })
    ),
})

const getDateInfo = ({ daysShift }) => {
    const today = new Date()
    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() + daysShift)

    const year = targetDate.getFullYear()
    const month = String(targetDate.getMonth() + 1).padStart(2, '0')
    const day = String(targetDate.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`
    const timestamp =
        new Date(
            targetDate.getFullYear(),
            targetDate.getMonth(),
            targetDate.getDate(),
            1,
            0,
            0
        ).getTime() / 1000 // 1 AM

    return { dateString, timestamp }
}

const run = async () => {
    await ymApi.init({ access_token: env.YM_TOKEN, uid: env.YM_UID })
    // @ts-ignore
    const history = HistoryReponseSchema.parse(await ymApi.getHistory())

    let {
        dateString: yesterdayDateString,
        timestamp: currentScrobbleTimestamp,
    } = getDateInfo({ daysShift: -1 }) // -1 means yesterday

    const yesterdayHistory = history.historyTabs.find(
        (tab) => tab.date === yesterdayDateString
    )

    if (!yesterdayHistory) {
        console.log(`No tracks found for ${yesterdayDateString}`)
        return
    }

    const totalTracks = yesterdayHistory.items.reduce(
        (acc, item) => acc + item.tracks.length,
        0
    )
    console.log(`Found ${totalTracks} tracks for ${yesterdayDateString}`)

    /** @type import('lastfm-ts-api').LastFMTrackScrobbleParams[] */
    const tracksToScrobble = []

    for (const item of yesterdayHistory.items) {
        if (!item.tracks || item.tracks.length === 0) {
            continue
        }

        const chosenByUser = item.context.type === 'wave' ? 0 : 1

        for (const track of item.tracks) {
            const fullModel = track.data.fullModel
            const artist = fullModel.artists[0].name
            const title = fullModel.title
            const durationSec = fullModel.durationMs / 1000
            const album =
                fullModel.albums && fullModel.albums.length > 0
                    ? fullModel.albums[0].title
                    : undefined

            if (
                currentScrobbleTimestamp + durationSec >
                new Date().getTime() / 1000
            ) {
                console.log('Skipping scrobble due to time overflow')
                return
            }

            tracksToScrobble.push({
                artist,
                track: title,
                chosenByUser,
                timestamp: Math.round(currentScrobbleTimestamp),
                duration: durationSec,
                album,
            })
            currentScrobbleTimestamp += durationSec
        }
    }

    // Scrobble tracks in batches of 50
    for (let i = 0; i < tracksToScrobble.length; i += 50) {
        const batch = tracksToScrobble.slice(i, i + 50)
        const result = await lastFMtrack.scrobbleMany(batch)
        console.log('Successfully scrobbled tracks:')
        console.dir(result, { depth: null })
    }
}

run()
