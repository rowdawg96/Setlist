// api/spotify-token.js  — Vercel Serverless Function
// Holds your Spotify Client Secret safely server-side.
// Deploy to Vercel: https://vercel.com/new
// Set environment variables in Vercel dashboard:
//   SPOTIFY_CLIENT_ID     — from developer.spotify.com/dashboard
//   SPOTIFY_CLIENT_SECRET — from developer.spotify.com/dashboard

export default async function handler(req, res) {
  // Allow requests from your own domain only
  const origin = req.headers.origin || '';
  const allowed = req.headers.origin?.includes('rowdawg') ? req.headers.origin : process.env.ALLOWED_ORIGIN || '*';  res.setHeader('Access-Control-Allow-Origin', allowed);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const clientId     = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Spotify credentials not configured on server' });
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error_description || 'Spotify auth failed' });
    }

    // Return token + expiry — never expose the secret
    return res.status(200).json({
      access_token: data.access_token,
      expires_in: data.expires_in,       // seconds (typically 3600)
    });

  } catch (err) {
    return res.status(500).json({ error: 'Token fetch failed', detail: err.message });
  }
}
