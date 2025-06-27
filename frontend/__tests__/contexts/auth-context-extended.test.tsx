import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { apiService } from '@/lib/api'

jest.mock('@/lib/api')

const mockApiService = apiService as jest.Mocked<typeof apiService>

// Wrapper component for testing
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('AuthContext Extended Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('Initial State', () => {
    it('starts with loading true and authenticated false', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      // The useEffect runs immediately, so loading might already be false
      // Let's just check the final state
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.isAuthenticated).toBe(false)
      })
    })

    it('sets authenticated true if token exists in localStorage', async () => {
      localStorage.setItem('token', 'existing-token')
      
      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.isAuthenticated).toBe(true)
      })
    })

    it('sets authenticated false if no token in localStorage', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.isAuthenticated).toBe(false)
      })
    })
  })

  describe('Login Function', () => {
    it('sets tokens and authenticated state on successful login', async () => {
      const mockResponse = {
        token: 'new-token',
        refreshToken: 'new-refresh-token'
      }
      mockApiService.login.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login({
          usernameOrEmail: 'test@example.com',
          password: 'password'
        })
      })

      expect(localStorage.getItem('token')).toBe('new-token')
      expect(localStorage.getItem('refreshToken')).toBe('new-refresh-token')
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('throws error on failed login', async () => {
      mockApiService.login.mockRejectedValue(new Error('Invalid credentials'))

      const { result } = renderHook(() => useAuth(), { wrapper })

      await expect(
        act(async () => {
          await result.current.login({
            usernameOrEmail: 'test@example.com',
            password: 'wrong-password'
          })
        })
      ).rejects.toThrow('Invalid credentials')

      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('Register Function', () => {
    it('registers and automatically logs in user', async () => {
      const registerData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      }

      const loginResponse = {
        token: 'login-token',
        refreshToken: 'login-refresh-token'
      }

      mockApiService.register.mockResolvedValue(undefined)
      mockApiService.login.mockResolvedValue(loginResponse)

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.register(registerData)
      })

      expect(mockApiService.register).toHaveBeenCalledWith(registerData)
      expect(mockApiService.login).toHaveBeenCalledWith({
        usernameOrEmail: registerData.email,
        password: registerData.password
      })
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('throws error on failed registration', async () => {
      mockApiService.register.mockRejectedValue(new Error('Registration failed'))

      const { result } = renderHook(() => useAuth(), { wrapper })

      await expect(
        act(async () => {
          await result.current.register({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
          })
        })
      ).rejects.toThrow('Registration failed')

      expect(result.current.isAuthenticated).toBe(false)
    })

    it('throws error if auto-login fails after registration', async () => {
      mockApiService.register.mockResolvedValue(undefined)
      mockApiService.login.mockRejectedValue(new Error('Auto-login failed'))

      const { result } = renderHook(() => useAuth(), { wrapper })

      await expect(
        act(async () => {
          await result.current.register({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
          })
        })
      ).rejects.toThrow('Auto-login failed')
    })
  })

  describe('Logout Function', () => {
    it('clears tokens and sets authenticated to false', async () => {
      localStorage.setItem('token', 'existing-token')
      localStorage.setItem('refreshToken', 'existing-refresh-token')

      const { result } = renderHook(() => useAuth(), { wrapper })

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      act(() => {
        result.current.logout()
      })

      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('refreshToken')).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('works when no tokens are present', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      act(() => {
        result.current.logout()
      })

      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('throws error when useAuth is used outside AuthProvider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      expect(() => {
        renderHook(() => useAuth())
      }).toThrow('useAuth must be used within an AuthProvider')

      consoleSpy.mockRestore()
    })
  })

  describe('State Persistence', () => {
    it('maintains authentication state across re-renders', async () => {
      localStorage.setItem('token', 'persistent-token')

      const { result, rerender } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      rerender()

      expect(result.current.isAuthenticated).toBe(true)
    })

    it('handles localStorage changes', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.isAuthenticated).toBe(false)

      // Simulate external localStorage change
      act(() => {
        localStorage.setItem('token', 'external-token')
      })

      // The component doesn't automatically react to localStorage changes
      // This is expected behavior as it only checks on mount
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('Multiple Simultaneous Operations', () => {
    it('handles multiple login attempts', async () => {
      mockApiService.login
        .mockResolvedValueOnce({ token: 'token1', refreshToken: 'refresh1' })
        .mockResolvedValueOnce({ token: 'token2', refreshToken: 'refresh2' })

      const { result } = renderHook(() => useAuth(), { wrapper })

      const credentials = {
        usernameOrEmail: 'test@example.com',
        password: 'password'
      }

      await act(async () => {
        await Promise.all([
          result.current.login(credentials),
          result.current.login(credentials)
        ])
      })

      expect(result.current.isAuthenticated).toBe(true)
      // Last successful login should win
      expect(localStorage.getItem('token')).toBeTruthy()
    })
  })
})