import { NavLink, useNavigate } from 'react-router-dom'
import './Sidebar.css'

export default function Sidebar() {
  const navigate = useNavigate()
  const username = localStorage.getItem('username')

  function handleLogout() {
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    navigate('/login')
  }

  return (
    <nav className="sidebar">
      <div className="sidebar-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Generate</NavLink>
        <NavLink to="/my-playlists" className={({ isActive }) => isActive ? 'active' : ''}>My Playlists</NavLink>
      </div>
      <div className="sidebar-footer">
        <span className="sidebar-user">{username}</span>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  )
}
