import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../api/api'
import './LoginPage.css'

export default function LoginPage() {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const user = mode === 'login'
        ? await login(username, password)
        : await register(username, password)

      localStorage.setItem('userId', user.id)
      localStorage.setItem('username', user.username)
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>MP3 Manager</h1>
        <div className="login-tabs">
          <button
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="btn-submit">
            {mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  )
}
