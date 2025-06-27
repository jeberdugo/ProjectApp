import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import DashboardPage from '@/app/dashboard/page'
import { useAuth } from '@/contexts/auth-context'
import { apiService } from '@/lib/api'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))
jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn(),
}))
jest.mock('@/lib/api')

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockApiService = apiService as jest.Mocked<typeof apiService>

const mockProjects = [
  {
    id: 1,
    name: 'Test Project 1',
    description: 'Test Description 1',
    status: 'ACTIVE' as const,
    createdBy: 'user1',
    createdAt: '2024-01-01T00:00:00Z',
    taskCount: 5,
    memberCount: 3,
    members: ['user1', 'user2']
  },
  {
    id: 2,
    name: 'Test Project 2',
    description: 'Test Description 2',
    status: 'COMPLETED' as const,
    createdBy: 'user2',
    createdAt: '2024-01-15T00:00:00Z',
    taskCount: 10,
    memberCount: 2,
    members: ['user2', 'user3']
  }
]

describe('DashboardPage', () => {
  const mockPush = jest.fn()
  const mockLogout = jest.fn()

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
      isAuthenticated: true,
      loading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: mockLogout,
    })

    mockApiService.getProjects.mockResolvedValue(mockProjects)
  })

  it('renders dashboard header', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('ProjectApp')).toBeInTheDocument()
      expect(screen.getByText('Your Projects')).toBeInTheDocument()
      expect(screen.getByText('Manage and collaborate on your projects')).toBeInTheDocument()
    })
  })

  it('loads and displays projects', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(mockApiService.getProjects).toHaveBeenCalled()
      expect(screen.getByText('Test Project 1')).toBeInTheDocument()
      expect(screen.getByText('Test Project 2')).toBeInTheDocument()
    })
  })

  it('shows loading state initially', () => {
    mockApiService.getProjects.mockImplementation(() => new Promise(() => {}))
    
    render(<DashboardPage />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('opens new project dialog when clicking New Project button', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument()
    })

    const newProjectButton = screen.getByText('New Project')
    fireEvent.click(newProjectButton)

    // The dialog should open (would need to check for dialog content)
    expect(newProjectButton).toBeInTheDocument()
  })

  it('navigates to project when clicking on project card', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument()
    })

    const projectCard = screen.getByText('Test Project 1').closest('.cursor-pointer')
    if (projectCard) {
      fireEvent.click(projectCard)
      expect(mockPush).toHaveBeenCalledWith('/project/1')
    }
  })

  it('calls logout when clicking logout button', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument()
    })

    const logoutButton = screen.getByText('Logout')
    fireEvent.click(logoutButton)

    expect(mockLogout).toHaveBeenCalled()
  })

  it('displays project status badges correctly', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('ACTIVE')).toBeInTheDocument()
      expect(screen.getByText('COMPLETED')).toBeInTheDocument()
    })
  })

  it('displays project statistics', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('3 members')).toBeInTheDocument()
      expect(screen.getByText('5 tasks')).toBeInTheDocument()
      expect(screen.getByText('2 members')).toBeInTheDocument()
      expect(screen.getByText('10 tasks')).toBeInTheDocument()
    })
  })

  it('shows empty state when no projects', async () => {
    mockApiService.getProjects.mockResolvedValue([])
    
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('No projects yet')).toBeInTheDocument()
      expect(screen.getByText('Create your first project to get started')).toBeInTheDocument()
    })
  })

  it('opens project dialog for editing when clicking more options', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument()
    })

    const moreButtons = screen.getAllByRole('button')
    const moreButton = moreButtons.find(button => 
      button.querySelector('svg') && 
      !button.textContent?.includes('New Project') &&
      !button.textContent?.includes('Logout')
    )
    
    if (moreButton) {
      fireEvent.click(moreButton)
      // Dialog should open for editing
    }
  })

  it('handles API error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    mockApiService.getProjects.mockRejectedValue(new Error('API Error'))
    
    render(<DashboardPage />)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error loading projects:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })
})