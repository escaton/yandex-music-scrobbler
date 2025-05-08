### Yandex Music scrobbler

Scrobbles tracks from Yandex Music every 24 hours via GitHub actions.

1. collect all secrets and tokens
    1. [create a LastFM app](https://www.last.fm/api/account/create)
    2. get yandex music token https://yandex-music.readthedocs.io/en/main/token.html
    3. get yandex UID — the easiest way is to open the [Yandex.Mail](https://mail.yandex.ru/), there UID will be in the url like this: `/?uid=XXXXXXX#inbox`
2. fork, clone the repo, create `.env` from `.env.sample` and fill everything except `LASTFM_SESSION`
3. get a `token` from this [doc](https://www.last.fm/api/authspec#_3-1-request-authorization-from-the-user)
4. run `TOKEN=xxx npm run session` locally, where `xxx` is a token from the previous step
5. [debug] store session key in `LASTFM_SESSION` in `.env` file
6. [debug] run `npm run dev` to try and scrobble your yesterday's tracks
7. add all the secrets to the github, to make it run on schedule