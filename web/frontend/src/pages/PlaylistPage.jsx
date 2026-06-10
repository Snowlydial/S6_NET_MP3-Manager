import { useState } from 'react'
import CriteriaForm from '../components/CriteriaForm'
import PlaylistPreview from '../components/PlaylistPreview'
import { generatePlaylist } from '../api/api'
import './PlaylistPage.css'

export default function PlaylistPage() {
  const [playlist, setPlaylist] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleGenerate(criteria) {
    setLoading(true)
    setError(null)
    try {
      const result = await generatePlaylist(criteria)
      setPlaylist(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
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
            <PlaylistPreview playlist={playlist} onPlaylistChange={setPlaylist} />
          </section>
        )}
      </div>
    </div>
  )
}
