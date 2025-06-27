import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TaskDialog } from '@/components/task-dialog'
import { apiService } from '@/lib/api'

jest.mock('@/lib/api')

const mockApiService = apiService as jest.Mocked<typeof apiService>

describe('TaskDialog', () => {
  const mockOnSave = jest.fn()
  const mockOnOpenChange = jest.fn()
  const projectId = 1

  beforeEach(() => {
    jest.clearAllMocks()
    mockApiService.getProjectLabels.mockResolvedValue([
      { id: 1, name: 'bug', color: '#ff0000' },
      { id: 2, name: 'feature', color: '#00ff00' }
    ])
  })

  it('renders create task dialog', async () => {
    render(
      <TaskDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId={projectId}
        onSave={mockOnSave}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Create New Task')).toBeInTheDocument()
    })

    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('Status')).toBeInTheDocument()
    expect(screen.getByLabelText('Priority')).toBeInTheDocument()
  })

  it('renders edit task dialog with existing data', async () => {
    const task = {
      id: 1,
      title: 'Test Task',
      description: 'Test Description',
      status: 'TODO' as const,
      priority: 'HIGH' as const,
      assignedTo: 'john',
      projectName: 'Project A',
      createdBy: 'jane',
      createdAt: '2024-01-01T00:00:00Z',
      dueDate: '2024-01-10T00:00:00Z',
      labels: [{ id: 1, name: 'bug', color: '#ff0000' }]
    }

    render(
      <TaskDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        task={task}
        projectId={projectId}
        onSave={mockOnSave}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Edit Task')).toBeInTheDocument()
    })

    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument()
  })

  it('creates new task on form submit', async () => {
    mockApiService.createTask.mockResolvedValue({
      id: 1,
      title: 'New Task',
      description: 'New Description',
      status: 'TODO',
      priority: 'MEDIUM',
      projectName: 'Project A',
      createdBy: 'user',
      createdAt: '2024-01-01T00:00:00Z',
      labels: []
    })

    render(
      <TaskDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId={projectId}
        onSave={mockOnSave}
      />
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Title')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'New Task' }
    })
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'New Description' }
    })

    fireEvent.click(screen.getByText('Create'))

    await waitFor(() => {
      expect(mockApiService.createTask).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'New Description',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: projectId,
        labelIds: []
      })
      expect(mockOnSave).toHaveBeenCalled()
    })
  })

  it('updates existing task on form submit', async () => {
    const task = {
      id: 1,
      title: 'Test Task',
      description: 'Test Description',
      status: 'TODO' as const,
      priority: 'HIGH' as const,
      assignedTo: 'john',
      projectName: 'Project A',
      createdBy: 'jane',
      createdAt: '2024-01-01T00:00:00Z',
      labels: []
    }

    mockApiService.updateTask.mockResolvedValue({
      ...task,
      title: 'Updated Task'
    })

    render(
      <TaskDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        task={task}
        projectId={projectId}
        onSave={mockOnSave}
      />
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByDisplayValue('Test Task'), {
      target: { value: 'Updated Task' }
    })

    fireEvent.click(screen.getByText('Update'))

    await waitFor(() => {
      expect(mockApiService.updateTask).toHaveBeenCalledWith(1, {
        title: 'Updated Task',
        description: 'Test Description',
        status: 'TODO',
        priority: 'HIGH',
        projectId: projectId,
        labelIds: []
      })
      expect(mockOnSave).toHaveBeenCalled()
    })
  })
})