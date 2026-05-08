# Setlist — shows from your music

Discover live shows from any Spotify playlist near you. Paste a URL, connect your account, or browse editorial playlists — shows load automatically.

---

## How it works

- **Public playlists** (Spotify editorial, any shareable link) → token server handles auth, no user login needed
- **Personal playlists** → Spotify PKCE OAuth, no backend required
- **Event data** → Ticketmaster Discovery API (free, 5K req/day)
- **Similar artists** → Last.fm API (free), with audio-feature matching planned once Spotify Extended Access is approved

---

## Setup in 3 steps

### Step 1 — Get free API keys

| Service | Where | Cost |
|---|---|---|
| Ticketmaster | [developer.ticketmaster.com](https://developer.ticketmaster.com) | Free, instant |
| Last.fm | [last.fm/api/account/create](https://www.last.fm/api/account/create) | Free, instant |
| Spotify | [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) | Free |

For Spotify: create an app, set the redirect URI to your deployed URL.

---

### Step 2 — Deploy the token server to Vercel

This is what unlocks **public playlist loading** without requiring users to log in.

```bash
# Install Vercel CLI
npm i -g vercel

# From the setlist-project folder:
vercel

# Set environment variables in Vercel dashboard (or via CLI):
vercel env add SPOTIFY_CLIENT_ID
vercel env add SPOTIFY_CLIENT_SECRET
vercel env add ALLOWED_ORIGIN   # your frontend domain, e.g. https://setlist.vercel.app
```

Your token server URL will be: `https://your-project.vercel.app/api/spotify-token`

That's the URL you paste into the app's ⚙ Setup panel.

---

### Step 3 — Deploy the frontend

The `public/index.html` is a single file — deploy it anywhere:

**Vercel** (simplest — same project):
```bash
vercel --prod
```

**GitHub Pages / Netlify / Cloudflare Pages**: just upload `public/index.html`.

---

## Security notes

- The Spotify Client Secret **only** lives in Vercel environment variables — never in frontend code
- The token server returns only a short-lived access token (1 hour), never the secret
- User OAuth uses PKCE — no secret needed, safe for the browser
- API keys entered in the ⚙ Setup panel are stored in `localStorage` — your own browser only

---

## Folder structure

```
setlist-project/
├── api/
│   └── spotify-token.js   ← Vercel serverless function (token exchange)
├── public/
│   └── index.html         ← The entire frontend app
├── vercel.json
├── package.json
└── README.md
```

---

## Roadmap

- [ ] `.ics` calendar export
- [ ] Spotify Extended Access → audio feature matching (BPM, energy, acousticness)
- [ ] Share a show → deep link that works without login
- [ ] Group wishlist / friends feature
