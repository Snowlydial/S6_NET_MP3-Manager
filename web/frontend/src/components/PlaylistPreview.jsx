import { useState } from 'react'
import AudioPlayer from './AudioPlayer'
import SongPicker from './SongPicker'
import { downloadPlaylist } from '../api/api'
import './PlaylistPreview.css'

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function totalDuration(songs) {
  return songs.reduce((acc, s) => acc + s.duration, 0)
}

export default function PlaylistPreview({ playlist, onPlaylistChange }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [downloading, setDownloading] = useState(false)
  const [picker, setPicker] = useState(null) // { mode: 'replace', index } | { mode: 'add' } | null

  const playlistIds = playlist.map(s => s.id)

  function removeSong(id) {
    const updated = playlist.filter(s => s.id !== id)
    onPlaylistChange(updated)
    if (currentIndex >= updated.length) setCurrentIndex(Math.max(0, updated.length - 1))
  }

  function handlePick(song) {
    if (picker.mode === 'replace') {
      const updated = [...playlist]
      updated[picker.index] = song
      onPlaylistChange(updated)
    } else {
      onPlaylistChange([...playlist, song])
    }
  }

  async function handleDownload() {
    setDownloading(true)
    try {
      const blob = await downloadPlaylist(playlist.map(s => s.id))
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'playlist.zip'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Download failed: ' + err.message)
    } finally {
      setDownloading(false)
    }
  }

  if (playlist.length === 0) {
    return <p className="empty-playlist">No songs matched your criteria.</p>
  }

  return (
    <div className="playlist-preview">
      {picker && (
        <SongPicker
          excludeIds={playlistIds}
          onPick={handlePick}
          onClose={() => setPicker(null)}
        />
      )}

      <div className="playlist-header">
        <h2>Playlist</h2>
        <span className="playlist-meta">
          {playlist.length} song{playlist.length !== 1 ? 's' : ''} — {formatDuration(totalDuration(playlist))}
        </span>
      </div>

      <ul className="song-list">
        {playlist.map((song, i) => (
          <li
            key={song.id}
            className={`song-row ${i === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(i)}
          >
            <span className="song-index">{i + 1}</span>
            <div className="song-info">
              <span className="song-title">{song.title}</span>
              <span className="song-sub">
                {[song.artist, song.genre].filter(Boolean).join(' · ')}
              </span>
            </div>
            <span className="song-duration">{formatDuration(song.duration)}</span>
            <button
              className="btn-replace"
              title="Replace"
              onClick={e => { e.stopPropagation(); setPicker({ mode: 'replace', index: i }) }}
            >
              ⇄
            </button>
            <button
              className="btn-remove"
              title="Remove"
              onClick={e => { e.stopPropagation(); removeSong(song.id) }}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <button className="btn-add-song" onClick={() => setPicker({ mode: 'add' })}>
        + Add song
      </button>

      <AudioPlayer
        playlist={playlist}
        currentIndex={currentIndex}
        onIndexChange={setCurrentIndex}
      />

      <button className="btn-download" onClick={handleDownload} disabled={downloading}>
        {downloading ? 'Preparing...' : 'Download as ZIP'}
      </button>
    </div>
  )
}
