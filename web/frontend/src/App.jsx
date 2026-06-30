import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import PlaylistPage from './pages/PlaylistPage'
import MyPlaylistsPage from './pages/MyPlaylistsPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<PlaylistPage />} />
            <Route path="/my-playlists" element={<MyPlaylistsPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
