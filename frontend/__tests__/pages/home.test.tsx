import { render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import HomePage from '@/app/page'
import { useAuth } from '@/contexts/auth-context'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))
jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn(),
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('HomePage', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    })
  })

  it('shows loading spinner initially', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    })

    render(<HomePage />)

    const spinner = screen.getAllByRole('generic').find(el => el.classList.contains('animate-spin'))
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('animate-spin')
  })

  it('redirects to dashboard when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    })

    render(<HomePage />)

    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('redirects to login when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    })

    render(<HomePage />)

    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('does not redirect while loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    })

    render(<HomePage />)

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('renders loading spinner with correct styling', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    })

    render(<HomePage />)

    const spinner = screen.getAllByRole('generic').find(el => el.classList.contains('animate-spin'))
    const container = spinner?.parentElement
    expect(container).toHaveClass('flex', 'justify-center', 'items-center', 'min-h-screen')
    
    expect(spinner).toHaveClass('animate-spin', 'rounded-full', 'h-32', 'w-32', 'border-b-2', 'border-gray-900')
  })
})