import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App form behavior', () => {
  it('renders the form, submits valid input, and shows validation error for invalid input', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()

    const input = screen.getByLabelText(/email/i)
    await user.type(input, 'invalid-email')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()

    await user.clear(input)
    await user.type(input, 'test@example.com')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(screen.getByText(/success!/i)).toBeInTheDocument()
  })

  it('waits for async data and then removes the loading state', async () => {
    const user = userEvent.setup()
    render(<App />)

    const loadButton = screen.getByRole('button', { name: /load user/i })
    await user.click(loadButton)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    const loadedUser = await screen.findByRole('heading', { name: /alice example/i })
    expect(loadedUser).toBeInTheDocument()
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })

  it('removes a conditional element after it disappears', async () => {
    const user = userEvent.setup()
    render(<App />)

    const toggleButton = screen.getByRole('button', { name: /toggle detail/i })
    await user.click(toggleButton)

    expect(screen.getByText(/detail is visible/i)).toBeInTheDocument()

    await user.click(toggleButton)

    await waitFor(() => {
      expect(screen.queryByText(/detail is visible/i)).toBeNull()
    })
  })
})
