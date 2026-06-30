import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import PlaylistPage from './pages/PlaylistPage'

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<PlaylistPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
