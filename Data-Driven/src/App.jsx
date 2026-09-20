import { useEffect, useMemo, useState } from 'react'
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useParams,
} from 'react-router-dom'
import './App.css'

const filterOptions = ['all', 'active', 'completed']

const initialTodos = [
  { id: 1, text: 'Plan the sprint', completed: false },
  { id: 2, text: 'Review the route map', completed: true },
  { id: 3, text: 'Ship the user directory', completed: false },
]

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/todos" className="nav-link">
            Todos
          </NavLink>
          <NavLink to="/users" className="nav-link">
            Users
          </NavLink>
        </nav>

        <Routes>
          <Route path="/" element={<Navigate to="/todos" replace />} />
          <Route path="/todos" element={<TodoApp />} />
          <Route path="/users" element={<UserDirectory />} />
          <Route path="/users/:id" element={<UserDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

function TodoApp() {
  const [todos, setTodos] = useState(initialTodos)
  const [activeFilter, setActiveFilter] = useState('all')
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth)

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const filteredTodos = useMemo(() => {
    if (activeFilter === 'active') {
      return todos.filter((todo) => !todo.completed)
    }

    if (activeFilter === 'completed') {
      return todos.filter((todo) => todo.completed)
    }

    return todos
  }, [activeFilter, todos])

  const completedCount = todos.filter((todo) => todo.completed).length

  const addTodo = (text) => {
    const trimmed = text.trim()
    if (!trimmed) {
      return
    }

    setTodos((current) => [
      {
        id: Date.now(),
        text: trimmed,
        completed: false,
      },
      ...current,
    ])
  }

  const toggleTodo = (id) => {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    )
  }

  const clearCompleted = () => {
    setTodos((current) => current.filter((todo) => !todo.completed))
  }

  return (
    <main className="todo-page">
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Data-driven app</p>
            <h1>Todo manager</h1>
          </div>
          <div className="viewport-pill">Viewport: {viewportWidth}px</div>
        </div>

        <AddTodo onAdd={addTodo} />
        <FilterBar
          filterOptions={filterOptions}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />
        <TodoList todos={filteredTodos} onToggle={toggleTodo} />
        <div className="todo-footer">
          <span>{todos.length - completedCount} active tasks</span>
          <button type="button" className="clear-button" onClick={clearCompleted}>
            Clear completed
          </button>
        </div>
      </section>
    </main>
  )
}

function AddTodo({ onAdd }) {
  const [input, setInput] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    onAdd(input)
    setInput('')
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={input}
        placeholder="Add a task"
        onChange={(event) => setInput(event.target.value)}
      />
      <button type="submit">Add</button>
    </form>
  )
}

function FilterBar({ filterOptions, activeFilter, setActiveFilter }) {
  return (
    <div className="filter-bar" aria-label="Todo filters">
      {filterOptions.map((filter) => (
        <button
          key={filter}
          type="button"
          className={filter === activeFilter ? 'filter-button active' : 'filter-button'}
          onClick={() => setActiveFilter(filter)}
        >
          {filter}
        </button>
      ))}
    </div>
  )
}

function TodoList({ todos, onToggle }) {
  if (todos.length === 0) {
    return <p className="empty-state">Nothing to show in this view.</p>
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <li key={todo.id} className={todo.completed ? 'todo-item completed' : 'todo-item'}>
          <label className="todo-label">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => onToggle(todo.id)}
            />
            <span>{todo.text}</span>
          </label>
        </li>
      ))}
    </ul>
  )
}

function UserDirectory() {
  const [users, setUsers] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const fetchUsers = async () => {
      setStatus('loading')
      setError('')

      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users')
        if (!response.ok) {
          throw new Error('Could not load users.')
        }

        const data = await response.json()

        if (!cancelled) {
          setUsers(data)
          setStatus(data.length === 0 ? 'empty' : 'success')
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message)
          setStatus('error')
        }
      }
    }

    fetchUsers()

    return () => {
      cancelled = true
    }
  }, [])

  if (status === 'loading') {
    return (
      <div className="directory-shell">
        <h2>Users</h2>
        <div className="skeleton-list" aria-label="Loading users">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="skeleton-row" />
          ))}
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="directory-shell">
        <h2>Users</h2>
        <p className="error-message">{error}</p>
      </div>
    )
  }

  if (status === 'empty') {
    return (
      <div className="directory-shell">
        <h2>Users</h2>
        <p className="empty-state">No users found.</p>
      </div>
    )
  }

  return (
    <div className="directory-shell">
      <h2>Users</h2>
      <ul className="directory-list">
        {users.map((user) => (
          <li key={user.id} className="directory-item">
            <Link to={`/users/${user.id}`} className="user-link">
              <span>{user.name}</span>
              <small>{user.email}</small>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function UserDetailPage() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const fetchUser = async () => {
      setStatus('loading')
      setError('')

      try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
        if (!response.ok) {
          throw new Error('User not found.')
        }

        const data = await response.json()

        if (!cancelled) {
          setUser(data)
          setStatus('success')
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message)
          setStatus('error')
        }
      }
    }

    fetchUser()

    return () => {
      cancelled = true
    }
  }, [id])

  if (status === 'loading') {
    return <p className="empty-state">Loading profile...</p>
  }

  if (status === 'error') {
    return <p className="error-message">{error}</p>
  }

  if (!user) {
    return <p className="empty-state">No user found.</p>
  }

  return (
    <article className="user-card">
      <Link to="/users" className="back-link">
        ← Back to users
      </Link>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <p>{user.phone}</p>
      <p>{user.company?.name}</p>
      <p>{user.website}</p>
    </article>
  )
}

function NotFoundPage() {
  return (
    <main className="panel not-found-panel">
      <h1>404</h1>
      <p>That page does not exist.</p>
      <Link to="/todos" className="nav-link inline-nav">
        Return home
      </Link>
    </main>
  )
}

export default App
