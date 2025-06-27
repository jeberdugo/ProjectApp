import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProjectDialog } from '@/components/project-dialog'
import { apiService } from '@/lib/api'

jest.mock('@/lib/api')

const mockApiService = apiService as jest.Mocked<typeof apiService>

describe('ProjectDialog', () => {
  const mockOnSave = jest.fn()
  const mockOnOpenChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders create project dialog', () => {
    render(
      <ProjectDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSave={mockOnSave}
      />
    )

    expect(screen.getByText('Create New Project')).toBeInTheDocument()
    expect(screen.getByLabelText('Project Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('renders edit project dialog with existing data', () => {
    const project = {
      id: 1,
      name: 'Test Project',
      description: 'Test Description',
      status: 'ACTIVE' as const,
      createdBy: 'user',
      createdAt: '2024-01-01',
      taskCount: 0,
      memberCount: 1,
      members: []
    }

    render(
      <ProjectDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        project={project}
        onSave={mockOnSave}
      />
    )

    expect(screen.getByText('Edit Project')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument()
  })

  it('creates new project on form submit', async () => {
    mockApiService.createProject.mockResolvedValue({
      id: 1,
      name: 'New Project',
      description: 'New Description',
      status: 'ACTIVE',
      createdBy: 'user',
      createdAt: '2024-01-01',
      taskCount: 0,
      memberCount: 1,
      members: []
    })

    render(
      <ProjectDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSave={mockOnSave}
      />
    )

    fireEvent.change(screen.getByLabelText('Project Name'), {
      target: { value: 'New Project' }
    })
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'New Description' }
    })

    fireEvent.click(screen.getByText('Create'))

    await waitFor(() => {
      expect(mockApiService.createProject).toHaveBeenCalledWith({
        name: 'New Project',
        description: 'New Description',
        status: 'ACTIVE'
      })
      expect(mockOnSave).toHaveBeenCalled()
    })
  })
})