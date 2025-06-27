import { render, screen } from '@testing-library/react'
import { AuthGuard } from '@/components/auth-guard'
import { useAuth } from '@/contexts/auth-context'

jest.mock('@/contexts/auth-context')
jest.mock('next/navigation')

const mockUseAuth = jest.mocked(useAuth)

describe('AuthGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading spinner when loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('renders children when not authenticated on public routes', () => {
    // Mock pathname to be a public route
    const mockUsePathname = jest.mocked(require('next/navigation').usePathname)
    mockUsePathname.mockReturnValue('/login')
    
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('does not render children when not authenticated on protected routes', () => {
    // Mock pathname to be a protected route
    const mockUsePathname = jest.mocked(require('next/navigation').usePathname)
    mockUsePathname.mockReturnValue('/dashboard')
    
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})