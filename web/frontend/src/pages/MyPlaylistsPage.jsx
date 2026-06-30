import { useState, useEffect } from 'react'
import { getPlaylists } from '../api/api'
import PlaylistPreview from '../components/PlaylistPreview'
import './MyPlaylistsPage.css'

export default function MyPlaylistsPage() {
  const [playlists, setPlaylists] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    getPlaylists().then(data => setPlaylists(data)).catch(() => {})
  }, [])

  function getSongs(playlist) {
    return playlist.songs.map(ps => ps.song)
  }

  if (playlists.length === 0)
    return <p className="empty-state">No saved playlists yet.</p>

  return (
    <div className="my-playlists-page">
      <div className="playlists-list">
        <h2>My Playlists</h2>
        <ul>
          {playlists.map(p => (
            <li key={p.id}>
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
