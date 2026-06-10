import { useEffect, useRef, useState } from 'react'
import { streamUrl } from '../api/api'
import './AudioPlayer.css'

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function AudioPlayer({ playlist, currentIndex, onIndexChange }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const song = playlist[currentIndex] ?? null

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.pause()
    audioRef.current.load()
    if (playing) audioRef.current.play().catch(() => {})
  }, [currentIndex])

  function togglePlay() {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play().catch(() => {})
      setPlaying(true)
    }
  }

  function handlePrev() {
    if (currentIndex > 0) onIndexChange(currentIndex - 1)
  }

  function handleNext() {
    if (currentIndex < playlist.length - 1) onIndexChange(currentIndex + 1)
  }

  function handleEnded() {
    if (currentIndex < playlist.length - 1) {
      onIndexChange(currentIndex + 1)
    } else {
      setPlaying(false)
    }
  }

  function handleSeek(e) {
    const val = parseFloat(e.target.value)
    audioRef.current.currentTime = val
    setCurrentTime(val)
  }

  if (!song) return null

  return (
    <div className="player">
      <audio
        ref={audioRef}
        src={streamUrl(song.id)}
        onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => setDuration(audioRef.current.duration)}
        onEnded={handleEnded}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      <div className="player-info">
        <span className="player-title">{song.title}</span>
        {song.artist && <span className="player-artist">{song.artist}</span>}
      </div>

      <div className="player-controls">
        <button onClick={handlePrev} disabled={currentIndex === 0}>&#9664;&#9664;</button>
        <button className="play-btn" onClick={togglePlay}>
          {playing ? '⏸' : '▶'}
        </button>
        <button onClick={handleNext} disabled={currentIndex === playlist.length - 1}>&#9654;&#9654;</button>
      </div>

      <div className="player-progress">
        <span>{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.5"
          value={currentTime}
          onChange={handleSeek}
        />
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  )
}
