import { useState } from 'react'
import CriteriaForm from '../components/CriteriaForm'
import PlaylistPreview from '../components/PlaylistPreview'
import { generatePlaylist, savePlaylist } from '../api/api'
import './PlaylistPage.css'

export default function PlaylistPage() {
  const [playlist, setPlaylist] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  async function handleGenerate(criteria) {
    setLoading(true)
    setError(null)
    setSaved(false)
    try {
      const result = await generatePlaylist(criteria)
      setPlaylist(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister() {
    if (!playlist) return
    const name = prompt('Name your playlist:', 'My Playlist')
    if (!name) return
    try {
      await savePlaylist(name, playlist.map(s => s.id))
      setSaved(true)
    } catch (err) {
      alert('Failed to save: ' + err.message)
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>MP3 Manager</h1>
        <p>Generate a playlist by criteria</p>
      </header>

      <div className="page-body">
        <section className="panel">
          <h2>Criteria</h2>
          <CriteriaForm onGenerate={handleGenerate} loading={loading} />
          {error && <p className="error">{error}</p>}
        </section>

        {playlist !== null && (
          <section className="panel">
            <PlaylistPreview
              playlist={playlist}
              onPlaylistChange={setPlaylist}
              onRegister={saved ? null : handleRegister}
            />
            {saved && <p style={{ color: 'green' }}>Playlist saved!</p>}
          </section>
        )}
      </div>
    </div>
  )
}
