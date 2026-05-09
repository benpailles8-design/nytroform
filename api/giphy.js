export const config = { runtime: 'edge' }

export default async function handler(req) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const offset = searchParams.get('offset') || '0'

  if (!q) return new Response('Missing query', { status: 400 })

  const GIPHY_KEY = process.env.GIPHY_KEY
  if (!GIPHY_KEY) return new Response('Missing API key', { status: 500 })

  const url = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(q)}&limit=1&offset=${offset}&rating=g&lang=en`

  try {
    const res = await fetch(url)
    const data = await res.json()
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400', // Cache 24h
      }
    })
  } catch (e) {
    return new Response('Error', { status: 500 })
  }
}
