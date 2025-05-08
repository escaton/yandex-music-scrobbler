import { LastFMAuth } from 'lastfm-ts-api'
import { z } from 'zod'

const envSchema = z.object({
    LASTFM_API_KEY: z.string(),
    LASTFM_API_SECRET: z.string(),
    TOKEN: z.string(),
})

const env = envSchema.parse(process.env)

const getLastFMSession = async () => {
    const auth = new LastFMAuth(
        env.LASTFM_API_KEY,
        env.LASTFM_API_SECRET
    )
    const session = await auth.getSession({
        token: env.TOKEN
    })
    console.log('Session:', session)
}

getLastFMSession()