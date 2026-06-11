import { useState, useEffect } from 'react'
import { getFilters } from '../api/api'
import './CriteriaForm.css'

function FilterField({ label, options, included, excluded, onInclude, onExclude, onRemoveIncluded, onRemoveExcluded }) {
  const [selected, setSelected] = useState('')

  const available = options.filter(o => !included.includes(o) && !excluded.includes(o))

  return (
    <div className="field">
      <label>{label}</label>
      <div className="filter-row">
        <select value={selected} onChange={e => setSelected(e.target.value)} disabled={available.length === 0}>
          <option value="">— select —</option>
          {available.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <button type="button" className="btn-include" disabled={!selected}
          onClick={() => { onInclude(selected); setSelected('') }}>
          + Include
        </button>
        <button type="button" className="btn-exclude" disabled={!selected}
          onClick={() => { onExclude(selected); setSelected('') }}>
          − Exclude
        </button>
      </div>

      {included.length > 0 && (
        <div className="tag-group">
          <span className="tag-group-label">Include</span>
          <div className="tags">
            {included.map(v => (
              <span key={v} className="tag tag-include">
                {v}
                <button type="button" onClick={() => onRemoveIncluded(v)}>×</button>
              </span>
            ))}
          </div>
        </div>
      )}

      {excluded.length > 0 && (
        <div className="tag-group">
          <span className="tag-group-label">Exclude</span>
          <div className="tags">
            {excluded.map(v => (
              <span key={v} className="tag tag-exclude">
                {v}
                <button type="button" onClick={() => onRemoveExcluded(v)}>×</button>
              </span>
            ))}
          </div>
        </div>
      )}

      {options.length === 0 && <p className="empty-filter">No {label.toLowerCase()} in library</p>}
    </div>
  )
}

export default function CriteriaForm({ onGenerate, loading }) {
  const [duration, setDuration] = useState('')
  const [artists, setArtists] = useState([])
  const [genres, setGenres] = useState([])

  const [includedArtists, setIncludedArtists] = useState([])
  const [excludedArtists, setExcludedArtists] = useState([])
  const [includedGenres, setIncludedGenres] = useState([])
  const [excludedGenres, setExcludedGenres] = useState([])

  useEffect(() => {
    getFilters().then(data => {
      setArtists(data.artists)
      setGenres(data.genres)
    }).catch(() => {})
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (!duration || parseInt(duration) <= 0) return
    onGenerate({
      durationMinutes: parseInt(duration),
      artists: includedArtists,
      excludedArtists,
      genres: includedGenres,
      excludedGenres,
    })
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
          required
        />
      </div>

      <FilterField
        label="Artists"
        options={artists}
        included={includedArtists}
        excluded={excludedArtists}
        onInclude={v => setIncludedArtists([...includedArtists, v])}
        onExclude={v => setExcludedArtists([...excludedArtists, v])}
        onRemoveIncluded={v => setIncludedArtists(includedArtists.filter(a => a !== v))}
        onRemoveExcluded={v => setExcludedArtists(excludedArtists.filter(a => a !== v))}
      />

      <FilterField
        label="Genres"
        options={genres}
        included={includedGenres}
        excluded={excludedGenres}
        onInclude={v => setIncludedGenres([...includedGenres, v])}
        onExclude={v => setExcludedGenres([...excludedGenres, v])}
        onRemoveIncluded={v => setIncludedGenres(includedGenres.filter(g => g !== v))}
        onRemoveExcluded={v => setExcludedGenres(excludedGenres.filter(g => g !== v))}
      />

      <button type="submit" className="btn-generate" disabled={loading}>
        {loading ? 'Generating...' : 'Generate Playlist'}
      </button>
    </form>
  )
}
