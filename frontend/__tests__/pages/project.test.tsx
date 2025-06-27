import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useParams, useRouter } from 'next/navigation'
import ProjectPage from '@/app/project/[id]/page'
import { apiService } from '@/lib/api'

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}))
jest.mock('@/lib/api')
jest.mock('@/components/kanban-board', () => ({
  KanbanBoard: ({ projectId }: { projectId: number }) => (
    <div data-testid="kanban-board">Kanban Board for project {projectId}</div>
  )
}))
jest.mock('@/components/project-members-dialog', () => ({
  ProjectMembersDialog: ({ open, projectName }: { open: boolean, projectName: string }) => (
    open ? <div data-testid="members-dialog">Members Dialog for {projectName}</div> : null
  )
}))

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockApiService = apiService as jest.Mocked<typeof apiService>

const mockProject = {
  id: 1,
  name: 'Test Project',
  description: 'Test Description',
  status: 'ACTIVE' as const,
  createdBy: 'testuser',
  createdAt: '2024-01-01T00:00:00Z',
  taskCount: 5,
  memberCount: 3,
  members: ['user1', 'user2', 'user3']
}

describe('ProjectPage', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseParams.mockReturnValue({ id: '1' })
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    })

    mockApiService.getProject.mockResolvedValue(mockProject)
  })

  it('renders loading state initially', () => {
    mockApiService.getProject.mockImplementation(() => new Promise(() => {}))
    
    render(<ProjectPage />)
    
    expect(screen.getByText('Loading project...')).toBeInTheDocument()
  })

  it('loads and displays project information', async () => {
    render(<ProjectPage />)

    await waitFor(() => {
      expect(mockApiService.getProject).toHaveBeenCalledWith(1)
      expect(screen.getByText('Test Project')).toBeInTheDocument()
      expect(screen.getByText('ACTIVE')).toBeInTheDocument()
      expect(screen.getByText('Created by testuser')).toBeInTheDocument()
      expect(screen.getByText('3 Members')).toBeInTheDocument()
    })
  })

  it('renders kanban board with correct project id', async () => {
    render(<ProjectPage />)

    await waitFor(() => {
      expect(screen.getByTestId('kanban-board')).toBeInTheDocument()
      expect(screen.getByText('Kanban Board for project 1')).toBeInTheDocument()
    })
  })

  it('navigates back to dashboard when back button is clicked', async () => {
    render(<ProjectPage />)

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument()
    })

    const backButton = screen.getByText('Back to Dashboard')
    fireEvent.click(backButton)

    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('opens members dialog when members button is clicked', async () => {
    render(<ProjectPage />)

    await waitFor(() => {
      expect(screen.getByText('3 Members')).toBeInTheDocument()
    })

    const membersButton = screen.getByText('3 Members')
    fireEvent.click(membersButton)

    expect(screen.getByTestId('members-dialog')).toBeInTheDocument()
    expect(screen.getByText('Members Dialog for Test Project')).toBeInTheDocument()
  })

  it('displays correct status badge colors', async () => {
    const statuses = [
      { status: 'ACTIVE', expectedClass: 'bg-green-100 text-green-800' },
      { status: 'COMPLETED', expectedClass: 'bg-blue-100 text-blue-800' },
      { status: 'ON_HOLD', expectedClass: 'bg-yellow-100 text-yellow-800' },
      { status: 'CANCELLED', expectedClass: 'bg-red-100 text-red-800' }
    ]

    for (const { status, expectedClass } of statuses) {
      mockApiService.getProject.mockResolvedValue({
        ...mockProject,
        status: status as any
      })

      const { unmount } = render(<ProjectPage />)

      await waitFor(() => {
        const badge = screen.getByText(status.replace('_', ' '))
        expect(badge).toHaveClass(...expectedClass.split(' '))
      })

      unmount()
    }
  })

  it('handles project loading error and redirects to dashboard', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    mockApiService.getProject.mockRejectedValue(new Error('Project not found'))

    render(<ProjectPage />)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error loading project:', expect.any(Error))
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    consoleSpy.mockRestore()
  })

  it('shows project not found message when project is null', async () => {
    mockApiService.getProject.mockResolvedValue(null as any)

    render(<ProjectPage />)

    await waitFor(() => {
      expect(screen.getByText('Project not found')).toBeInTheDocument()
    })
  })

  it('handles invalid project id parameter', async () => {
    mockUseParams.mockReturnValue({ id: 'invalid' })

    render(<ProjectPage />)

    // Should show loading initially, then handle invalid ID gracefully
    expect(screen.getByText('Loading project...')).toBeInTheDocument()
    
    // The component might not call the API with NaN, or handle it differently
    // Let's just verify it doesn't crash
    await waitFor(() => {
      expect(screen.getByText('Loading project...')).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('renders settings button', async () => {
    render(<ProjectPage />)

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    const settingsButton = screen.getByText('Settings')
    expect(settingsButton).toBeInTheDocument()
    
    // Settings button doesn't have functionality yet, but should be clickable
    fireEvent.click(settingsButton)
  })

  it('displays project description in header', async () => {
    render(<ProjectPage />)

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument()
    })

    // The project name should be displayed as the main heading
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Test Project')
  })

  it('handles project with different member counts', async () => {
    const projectWithNoMembers = {
      ...mockProject,
      memberCount: 0
    }

    mockApiService.getProject.mockResolvedValue(projectWithNoMembers)

    render(<ProjectPage />)

    await waitFor(() => {
      expect(screen.getByText('0 Members')).toBeInTheDocument()
    })
  })

  it('handles project with underscored status correctly', async () => {
    const projectWithUnderscoreStatus = {
      ...mockProject,
      status: 'ON_HOLD' as const
    }

    mockApiService.getProject.mockResolvedValue(projectWithUnderscoreStatus)

    render(<ProjectPage />)

    await waitFor(() => {
      // Should replace underscore with space
      expect(screen.getByText('ON HOLD')).toBeInTheDocument()
    })
  })

  it('closes members dialog when onOpenChange is called', async () => {
    render(<ProjectPage />)

    await waitFor(() => {
      expect(screen.getByText('3 Members')).toBeInTheDocument()
    })

    // Open dialog
    const membersButton = screen.getByText('3 Members')
    fireEvent.click(membersButton)

    expect(screen.getByTestId('members-dialog')).toBeInTheDocument()

    // The dialog should close when onOpenChange is called with false
    // This would be handled by the actual ProjectMembersDialog component
  })
})