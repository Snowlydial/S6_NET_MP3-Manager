const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

//?=== User stuff
function getUserId() {
  return localStorage.getItem('userId')
}

function userHeader() {
  return { 'X-User-Id': getUserId() }
}

export async function register(username, password) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function login(username, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

//?=== Playlist and Song
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

export async function downloadSong(songId) {
  const res = await fetch(`${BASE}/songs/${songId}/download`)
  if (!res.ok) throw new Error(await res.text())
  return res.blob()
}

export async function getSongs() {
  const res = await fetch(`${BASE}/songs`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getFilters() {
  const res = await fetch(`${BASE}/songs/filters`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export function streamUrl(songId) {
  return `${BASE}/songs/${songId}/stream`
}

export async function savePlaylist(name, songIds) {
  const res = await fetch(`${BASE}/playlists/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...userHeader() },
    body: JSON.stringify({ name, songIds }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getPlaylists() {
  const res = await fetch(`${BASE}/playlists`, {
    headers: userHeader(),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function fusePlaylists(name, playlistIds) {
  const res = await fetch(`${BASE}/playlists/fuse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...userHeader() },
    body: JSON.stringify({ name, playlistIds }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
