### Yandex Music Scrobbler

Automatically scrobbles tracks from Yandex Music every 24 hours using GitHub Actions.

> [!IMPORTANT] Important Note on Tokens:
> `LASTFM_SESSION` and `YM_TOKEN` are valid for 1 year. After expiration, the workflow will fail.

**Setup Instructions:**

1. **Gather Required Tokens:**
   - [Create a LastFM app](https://www.last.fm/api/account/create).
   - Obtain a Yandex Music token from [here](https://yandex-music.readthedocs.io/en/main/token.html).

2. **Repository Setup:**
   - Fork and clone the repository.
   - Create a `.env` file from `.env.sample` and fill in all fields except `LASTFM_SESSION`.

3. **Session Generation:**
   - Obtain a token from [this documentation](https://www.last.fm/api/authspec#_3-1-request-authorization-from-the-user).
   - Run `TOKEN=xxx npm run session` locally, replacing `xxx` with the token from the previous step.
   - Store the session key in `LASTFM_SESSION` within the `.env` file.

4. **Optional Debugging:**
   - Run `npm run dev` to scrobble your tracks from the previous day.

5. **GitHub Secrets:**
   - Add all necessary secrets to GitHub to enable scheduled runs.
