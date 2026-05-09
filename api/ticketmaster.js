// api/ticketmaster.js — Vercel Serverless Function
// Proxies Ticketmaster Discovery API requests server-side
// so the API key is never exposed in the browser.
//
// Set in Vercel environment variables:
//   TICKETMASTER_API_KEY — your Consumer Key from developer.ticketmaster.com
//   ALLOWED_ORIGIN       — your frontend URL

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowed);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Ticketmaster API key not configured' });
  }

  // Forward all query params from the frontend, inject the key server-side
  // Strip `source` — it's a frontend routing hint, not a TM param
  const params = new URLSearchParams(req.query);
  params.delete('source');
  params.set('apikey', apiKey);

  try {
    const url = `https://app.ticketmaster.com/discovery/v2/events.json?${params}`;
    const r = await fetch(url);
    const data = await r.json();

    // Cache responses for 10 minutes to save on API quota
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: 'Ticketmaster request failed', detail: err.message });
  }
}
