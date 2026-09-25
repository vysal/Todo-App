import { type FormEvent, useEffect, useState } from 'react'
import './App.css'
import { useDebounce } from './hooks/useDebounce'
import { useLocalStorage } from './hooks/useLocalStorage'

function App() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)

  const [theme, setTheme] = useLocalStorage('theme', 'light')
  const [cart, setCart] = useLocalStorage('cart', ['apples'])
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    document.body.dataset.theme = theme
  }, [theme])

  const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validateEmail(email)) {
      setError('Please enter a valid email')
      setSubmitted(false)
      return
    }

    setError('')
    setSubmitted(true)
  }

  const handleLoadUser = async () => {
    setIsLoading(true)
    setUser(null)

    await new Promise((resolve) => setTimeout(resolve, 600))

    setUser({ name: 'Alice Example' })
    setIsLoading(false)
  }

  return (
    <main className="app-shell">
      <section className="panel">
        <h2>Local storage</h2>
        <div className="row">
          <button type="button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            Toggle theme
          </button>
          <span>Theme: {theme}</span>
        </div>
        <div className="row">
          <button type="button" onClick={() => setCart((current) => [...current, `item-${current.length + 1}`])}>
            Add cart item
          </button>
          <span>Cart count: {cart.length}</span>
        </div>
      </section>

      <section className="panel">
        <h2>Debounced search</h2>
        <label htmlFor="searchInput">Search</label>
        <input
          id="searchInput"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Type to search"
        />
        <div className="values-grid">
          <div>
            <h3>Raw value</h3>
            <p>{search}</p>
          </div>
          <div>
            <h3>Debounced value</h3>
            <p>{debouncedSearch}</p>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>Form validation</h2>
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="emailInput">Email</label>
          <input
            id="emailInput"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {error ? <p className="error-message">{error}</p> : null}
          {submitted ? <p className="success-message">Success!</p> : null}
          <button type="submit">Submit</button>
        </form>
      </section>

      <section className="panel">
        <h2>Async fetch</h2>
        <button type="button" onClick={handleLoadUser}>Load user</button>
        {isLoading ? <p>Loading...</p> : null}
        {user ? <h3>{user.name}</h3> : null}
      </section>

      <section className="panel">
        <h2>Conditional element</h2>
        <button type="button" onClick={() => setShowDetail((value) => !value)}>
          Toggle detail
        </button>
        {showDetail ? <p>Detail is visible</p> : null}
      </section>
    </main>
  )
}

export default App
