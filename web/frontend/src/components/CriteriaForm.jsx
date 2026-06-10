import { useState, useEffect } from 'react'
import { getFilters } from '../api/api'
import './CriteriaForm.css'

export default function CriteriaForm({ onGenerate, loading }) {
  const [duration, setDuration] = useState('')
  const [artists, setArtists] = useState([])
  const [genres, setGenres] = useState([])
  const [selectedArtists, setSelectedArtists] = useState([])
  const [selectedGenres, setSelectedGenres] = useState([])

  useEffect(() => {
    getFilters()
      .then(data => {
        setArtists(data.artists)
        setGenres(data.genres)
      })
      .catch(() => {})
  }, [])

  function toggleItem(value, selected, setSelected) {
    setSelected(selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value])
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!duration || parseInt(duration) <= 0) return
    onGenerate({ durationMinutes: parseInt(duration), artists: selectedArtists, genres: selectedGenres })
  }

  return (
    <form className="criteria-form" onSubmit={handleSubmit}>
      <div className="field">
        <label>Duration (minutes)</label>
        <input
          type="number"
          min="1"
          value={duration}
          onChange={e => setDuration(e.target.value)}
          placeholder="e.g. 12"
          required
        />
      </div>

      <div className="field">
        <label>Artists {selectedArtists.length > 0 && <span className="count">({selectedArtists.length} selected)</span>}</label>
        {artists.length === 0
          ? <p className="empty-filter">No artists in library</p>
          : <div className="checkbox-list">
              {artists.map(a => (
                <label key={a} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedArtists.includes(a)}
                    onChange={() => toggleItem(a, selectedArtists, setSelectedArtists)}
                  />
                  {a}
                </label>
              ))}
            </div>
        }
      </div>

      <div className="field">
        <label>Genres {selectedGenres.length > 0 && <span className="count">({selectedGenres.length} selected)</span>}</label>
        {genres.length === 0
          ? <p className="empty-filter">No genres in library</p>
          : <div className="checkbox-list">
              {genres.map(g => (
                <label key={g} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(g)}
                    onChange={() => toggleItem(g, selectedGenres, setSelectedGenres)}
                  />
                  {g}
                </label>
              ))}
            </div>
        }
      </div>

      <button type="submit" className="btn-generate" disabled={loading}>
        {loading ? 'Generating...' : 'Generate Playlist'}
      </button>
    </form>
  )
}
