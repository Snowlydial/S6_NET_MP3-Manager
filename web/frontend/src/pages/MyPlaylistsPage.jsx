import { useState, useEffect } from 'react'
import { getPlaylists, fusePlaylists } from '../api/api'
import PlaylistPreview from '../components/PlaylistPreview'
import './MyPlaylistsPage.css'

export default function MyPlaylistsPage() {
  const [playlists, setPlaylists] = useState([])
  const [selected, setSelected] = useState(null)
  const [checkedIds, setCheckedIds] = useState([])

  useEffect(() => {
    getPlaylists().then(data => setPlaylists(data)).catch(() => {})
  }, [])

  function getSongs(playlist) {
    return playlist.songs.map(ps => ps.song)
  }

  function toggleCheck(id) {
    setCheckedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  async function handleFuse() {
    const name = prompt('Name for the fused playlist:', 'Fused Playlist')
    if (!name) return
    try {
      await fusePlaylists(name, checkedIds)
      const updated = await getPlaylists()
      setPlaylists(updated)
      setCheckedIds([])
    } catch (err) {
      alert('Fuse failed: ' + err.message)
    }
  }

  if (playlists.length === 0)
    return <p className="empty-state">No saved playlists yet.</p>

  return (
    <div className="my-playlists-page">
      <div className="playlists-list">
        <h2>My Playlists</h2>

        {checkedIds.length >= 2 && (
          <button className="btn-fuse" onClick={handleFuse}>
            Fuse {checkedIds.length} playlists
          </button>
        )}

        <ul>
          {playlists.map(p => (
            <li key={p.id} className="playlist-item">
              <input
                type="checkbox"
                checked={checkedIds.includes(p.id)}
                onChange={() => toggleCheck(p.id)}
              />
              <button
                className={selected?.id === p.id ? 'active' : ''}
                onClick={() => setSelected(p)}
              >
                {p.name || `Playlist #${p.id}`}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="playlist-detail">
        {selected ? (
          <PlaylistPreview
            playlist={getSongs(selected)}
            onPlaylistChange={() => {}}
          />
        ) : (
          <p className="empty-state">Select a playlist to view it.</p>
        )}
      </div>
    </div>
  )
}
