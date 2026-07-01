import { useState, useEffect } from 'react'
import { getSongs, uploadSong, updateSong, deleteSong } from '../api/api'
import './SongsPage.css'

const EMPTY_FORM = { title: '', artist: '', albumArtist: '', genre: '', language: '', year: '' }

export default function SongsPage() {
  const [songs, setSongs] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(EMPTY_FORM)
  const [uploadForm, setUploadForm] = useState(EMPTY_FORM)
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSongs()
  }, [])

  async function fetchSongs() {
    const data = await getSongs()
    setSongs(data)
  }

  function startEdit(song) {
    setEditingId(song.id)
    setEditForm({
      title: song.title || '',
      artist: song.artist || '',
      albumArtist: song.albumArtist || '',
      genre: song.genre || '',
      language: song.language || '',
      year: song.year || '',
    })
  }

  async function handleUpdate(id) {
    try {
      await updateSong(id, editForm)
      setEditingId(null)
      fetchSongs()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this song?')) return
    try {
      await deleteSong(id)
      fetchSongs()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleUpload(e) {
    e.preventDefault()
    if (!file) return
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', uploadForm.title || file.name.replace('.mp3', ''))
    formData.append('artist', uploadForm.artist)
    formData.append('albumArtist', uploadForm.albumArtist)
    formData.append('genre', uploadForm.genre)
    formData.append('language', uploadForm.language)
    formData.append('year', uploadForm.year)
    formData.append('duration', 0)

    try {
      await uploadSong(formData)
      setUploadForm(EMPTY_FORM)
      setFile(null)
      e.target.reset()
      fetchSongs()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="songs-page">
      <h2>Songs</h2>

      {error && <p className="songs-error">{error}</p>}

      <section className="upload-section">
        <h3>Upload a song</h3>
        <form onSubmit={handleUpload} className="upload-form">
          <input type="file" accept=".mp3" required onChange={e => setFile(e.target.files[0])} />
          <div className="upload-fields">
            <input placeholder="Title" value={uploadForm.title} onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })} />
            <input placeholder="Artist" value={uploadForm.artist} onChange={e => setUploadForm({ ...uploadForm, artist: e.target.value })} />
            <input placeholder="Album Artist" value={uploadForm.albumArtist} onChange={e => setUploadForm({ ...uploadForm, albumArtist: e.target.value })} />
            <input placeholder="Genre" value={uploadForm.genre} onChange={e => setUploadForm({ ...uploadForm, genre: e.target.value })} />
            <input placeholder="Language" value={uploadForm.language} onChange={e => setUploadForm({ ...uploadForm, language: e.target.value })} />
            <input placeholder="Year" value={uploadForm.year} onChange={e => setUploadForm({ ...uploadForm, year: e.target.value })} />
          </div>
          <button type="submit" className="btn-upload">Upload</button>
        </form>
      </section>

      <section className="songs-table-section">
        <table className="songs-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Artist</th>
              <th>Album Artist</th>
              <th>Genre</th>
              <th>Language</th>
              <th>Year</th>
              <th>Duration</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {songs.map(song => (
              <tr key={song.id}>
                {editingId === song.id ? (
                  <>
                    <td><input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} /></td>
                    <td><input value={editForm.artist} onChange={e => setEditForm({ ...editForm, artist: e.target.value })} /></td>
                    <td><input value={editForm.albumArtist} onChange={e => setEditForm({ ...editForm, albumArtist: e.target.value })} /></td>
                    <td><input value={editForm.genre} onChange={e => setEditForm({ ...editForm, genre: e.target.value })} /></td>
                    <td><input value={editForm.language} onChange={e => setEditForm({ ...editForm, language: e.target.value })} /></td>
                    <td><input value={editForm.year} onChange={e => setEditForm({ ...editForm, year: e.target.value })} /></td>
                    <td>{Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}</td>
                    <td className="row-actions">
                      <button className="btn-save" onClick={() => handleUpdate(song.id)}>Save</button>
                      <button className="btn-cancel" onClick={() => setEditingId(null)}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{song.title}</td>
                    <td>{song.artist || '—'}</td>
                    <td>{song.albumArtist || '—'}</td>
                    <td>{song.genre || '—'}</td>
                    <td>{song.language || '—'}</td>
                    <td>{song.year || '—'}</td>
                    <td>{Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}</td>
                    <td className="row-actions">
                      <button className="btn-edit" onClick={() => startEdit(song)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(song.id)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
