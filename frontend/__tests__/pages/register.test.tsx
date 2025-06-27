import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import RegisterPage from '@/app/register/page'
import { useAuth } from '@/contexts/auth-context'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))
jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn(),
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('RegisterPage', () => {
  const mockPush = jest.fn()
  const mockRegister = jest.fn()

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

    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      login: jest.fn(),
      register: mockRegister,
      logout: jest.fn(),
    })
  })

  it('renders register form', () => {
    render(<RegisterPage />)

    expect(screen.getAllByText('Create Account')[0]).toBeInTheDocument()
    expect(screen.getByText('Sign up to get started with ProjectApp')).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument()
  })

  it('shows link to login page', () => {
    render(<RegisterPage />)

    expect(screen.getByText('Already have an account?')).toBeInTheDocument()
    expect(screen.getByText('Sign in')).toBeInTheDocument()
  })

  it('handles form submission successfully', async () => {
    mockRegister.mockResolvedValue(undefined)
    
    render(<RegisterPage />)

    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'testuser' }
    })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    })
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'password123' }
    })

    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      })
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows error when passwords do not match', async () => {
    render(<RegisterPage />)

    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'testuser' }
    })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    })
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'differentpassword' }
    })

    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      expect(mockRegister).not.toHaveBeenCalled()
    })
  })

  it('shows error when registration fails', async () => {
    mockRegister.mockRejectedValue(new Error('Registration failed'))
    
    render(<RegisterPage />)

    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'testuser' }
    })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    })
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'password123' }
    })

    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

    await waitFor(() => {
      expect(screen.getByText('Registration failed. Please try again.')).toBeInTheDocument()
    })
  })

  it('shows loading state during registration', async () => {
    mockRegister.mockImplementation(() => new Promise(() => {}))
    
    render(<RegisterPage />)

    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'testuser' }
    })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    })
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'password123' }
    })

    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

    expect(screen.getByRole('button', { name: 'Create Account' })).toBeDisabled()
  })

  it('requires all fields to be filled', () => {
    render(<RegisterPage />)

    const submitButton = screen.getByRole('button', { name: 'Create Account' })
    
    // Try to submit empty form
    fireEvent.click(submitButton)

    // Form should not submit due to HTML5 validation
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('updates form state when typing', () => {
    render(<RegisterPage />)

    const usernameInput = screen.getByLabelText('Username') as HTMLInputElement
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement
    const confirmPasswordInput = screen.getByLabelText('Confirm Password') as HTMLInputElement

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })

    expect(usernameInput.value).toBe('testuser')
    expect(emailInput.value).toBe('test@example.com')
    expect(passwordInput.value).toBe('password123')
    expect(confirmPasswordInput.value).toBe('password123')
  })
})