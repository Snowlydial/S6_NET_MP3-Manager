import { useState } from 'react'
import './CriteriaForm.css'

export default function CriteriaForm({ onGenerate, loading }) {
  const [duration, setDuration] = useState('')
  const [artistInput, setArtistInput] = useState('')
  const [genreInput, setGenreInput] = useState('')
  const [artists, setArtists] = useState([])
  const [genres, setGenres] = useState([])

  function addTag(input, setInput, list, setList) {
    const val = input.trim()
    if (val && !list.includes(val)) setList([...list, val])
    setInput('')
  }

  function removeTag(val, list, setList) {
    setList(list.filter(v => v !== val))
  }

  function handleKeyDown(e, input, setInput, list, setList) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(input, setInput, list, setList)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!duration || parseInt(duration) <= 0) return
    onGenerate({ durationMinutes: parseInt(duration), artists, genres })
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
        <label>Artists</label>
        <div className="tag-input">
          <div className="tags">
            {artists.map(a => (
              <span key={a} className="tag">
                {a}
                <button type="button" onClick={() => removeTag(a, artists, setArtists)}>×</button>
              </span>
            ))}
          </div>
          <div className="tag-row">
            <input
              type="text"
              value={artistInput}
              onChange={e => setArtistInput(e.target.value)}
              onKeyDown={e => handleKeyDown(e, artistInput, setArtistInput, artists, setArtists)}
              placeholder="Type and press Enter"
            />
            <button type="button" onClick={() => addTag(artistInput, setArtistInput, artists, setArtists)}>
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="field">
        <label>Genres</label>
        <div className="tag-input">
          <div className="tags">
            {genres.map(g => (
              <span key={g} className="tag">
                {g}
                <button type="button" onClick={() => removeTag(g, genres, setGenres)}>×</button>
              </span>
            ))}
          </div>
          <div className="tag-row">
            <input
              type="text"
              value={genreInput}
              onChange={e => setGenreInput(e.target.value)}
              onKeyDown={e => handleKeyDown(e, genreInput, setGenreInput, genres, setGenres)}
              placeholder="Type and press Enter"
            />
            <button type="button" onClick={() => addTag(genreInput, setGenreInput, genres, setGenres)}>
              Add
            </button>
          </div>
        </div>
      </div>

      <button type="submit" className="btn-generate" disabled={loading}>
        {loading ? 'Generating...' : 'Generate Playlist'}
      </button>
    </form>
  )
}
