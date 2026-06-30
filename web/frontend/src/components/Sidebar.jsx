import { NavLink } from 'react-router-dom'
import './Sidebar.css'

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Generate</NavLink>
      <NavLink to="/my-playlists" className={({ isActive }) => isActive ? 'active' : ''}>My Playlists</NavLink>
    </nav>
  )
}
