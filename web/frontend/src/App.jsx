import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import PlaylistPage from './pages/PlaylistPage'
import MyPlaylistsPage from './pages/MyPlaylistsPage'
import LoginPage from './pages/LoginPage'
import './App.css'

function PrivateRoute({ children }) {
  const userId = localStorage.getItem('userId')
  return userId ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <div className="app-layout">
                <Sidebar />
                <div className="app-content">
                  <Routes>
                    <Route path="/" element={<PlaylistPage />} />
                    <Route path="/my-playlists" element={<MyPlaylistsPage />} />
                  </Routes>
                </div>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
