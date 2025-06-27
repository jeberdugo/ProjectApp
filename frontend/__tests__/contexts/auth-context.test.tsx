import { render, screen, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { apiService } from '@/lib/api'

jest.mock('@/lib/api')

const mockApiService = apiService as jest.Mocked<typeof apiService>

// Test component to access auth context
function TestComponent() {
  const { isAuthenticated, loading, login, register, logout } = useAuth()
  
  return (
    <div>
      <div data-testid="auth-status">
        {loading ? 'loading' : isAuthenticated ? 'authenticated' : 'not-authenticated'}
      </div>
      <button onClick={() => login({ usernameOrEmail: 'test', password: 'test' })}>
        Login
      </button>
      <button onClick={() => register({ username: 'test', email: 'test@test.com', password: 'test' })}>
        Register
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('provides initial unauthenticated state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
  })

  it('sets authenticated state when token exists in localStorage', () => {
    localStorage.setItem('token', 'test-token')

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
  })

  it('handles successful login', async () => {
    mockApiService.login.mockResolvedValue({
      token: 'new-token',
      refreshToken: 'new-refresh-token'
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await act(async () => {
      screen.getByText('Login').click()
    })

    expect(mockApiService.login).toHaveBeenCalledWith({
      usernameOrEmail: 'test',
      password: 'test'
    })
    expect(localStorage.getItem('token')).toBe('new-token')
    expect(localStorage.getItem('refreshToken')).toBe('new-refresh-token')
    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
  })

  it('handles successful registration and auto-login', async () => {
    mockApiService.register.mockResolvedValue(undefined)
    mockApiService.login.mockResolvedValue({
      token: 'new-token',
      refreshToken: 'new-refresh-token'
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await act(async () => {
      screen.getByText('Register').click()
    })

    expect(mockApiService.register).toHaveBeenCalledWith({
      username: 'test',
      email: 'test@test.com',
      password: 'test'
    })
    expect(mockApiService.login).toHaveBeenCalledWith({
      usernameOrEmail: 'test@test.com',
      password: 'test'
    })
    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
  })

  it('handles logout', async () => {
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('refreshToken', 'test-refresh-token')

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')

    await act(async () => {
      screen.getByText('Logout').click()
    })

    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
  })

  it('throws error when useAuth is used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')

    consoleSpy.mockRestore()
  })
})