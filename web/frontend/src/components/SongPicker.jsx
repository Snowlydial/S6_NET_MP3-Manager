import { useState, useEffect } from 'react'
import { getSongs } from '../api/api'
import './SongPicker.css'

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function SongPicker({ excludeIds, onPick, onClose }) {
  const [songs, setSongs] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    getSongs().then(all => setSongs(all.filter(s => !excludeIds.includes(s.id))))
  }, [])

  const filtered = songs.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    (s.artist && s.artist.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="picker-overlay" onClick={onClose}>
      <div className="picker-modal" onClick={e => e.stopPropagation()}>
        <div className="picker-header">
          <h3>Pick a song</h3>
          <button className="picker-close" onClick={onClose}>×</button>
        </div>
        <input
          className="picker-search"
          type="text"
          placeholder="Search title or artist..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />
        <ul className="picker-list">
          {filtered.length === 0 && <li className="picker-empty">No songs available</li>}
          {filtered.map(song => (
            <li key={song.id} className="picker-row" onClick={() => { onPick(song); onClose() }}>
              <div className="picker-info">
                <span className="picker-title">{song.title}</span>
                <span className="picker-sub">{[song.artist, song.genre].filter(Boolean).join(' · ')}</span>
              </div>
              <span className="picker-duration">{formatDuration(song.duration)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
