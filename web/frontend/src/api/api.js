const BASE = 'http://localhost:5000/api'

export async function generatePlaylist(criteria) {
  const res = await fetch(`${BASE}/playlists/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(criteria),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function downloadPlaylist(songIds) {
  const res = await fetch(`${BASE}/playlists/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ songIds }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.blob()
}

export function streamUrl(songId) {
  return `${BASE}/songs/${songId}/stream`
}
