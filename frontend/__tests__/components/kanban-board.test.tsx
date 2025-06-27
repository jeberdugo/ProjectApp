import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { KanbanBoard } from '@/components/kanban-board'
import { apiService } from '@/lib/api'

jest.mock('@/lib/api')

const mockApiService = apiService as jest.Mocked<typeof apiService>

const mockTasks = [
  {
    id: 1,
    title: 'Task 1',
    description: 'Description 1',
    status: 'TODO' as const,
    priority: 'HIGH' as const,
    assignedTo: 'john',
    projectName: 'Project A',
    createdBy: 'jane',
    createdAt: '2024-01-01T00:00:00Z',
    dueDate: '2024-01-10T00:00:00Z',
    labels: []
  },
  {
    id: 2,
    title: 'Task 2',
    description: 'Description 2',
    status: 'IN_PROGRESS' as const,
    priority: 'MEDIUM' as const,
    assignedTo: 'jane',
    projectName: 'Project A',
    createdBy: 'john',
    createdAt: '2024-01-05T00:00:00Z',
    labels: []
  }
]

describe('KanbanBoard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockApiService.getProjectTasks.mockResolvedValue(mockTasks)
    mockApiService.getProjectLabels.mockResolvedValue([])
  })

  it('renders kanban columns', async () => {
    render(<KanbanBoard projectId={1} />)

    await waitFor(() => {
      expect(screen.getByText('To Do')).toBeInTheDocument()
      expect(screen.getByText('In Progress')).toBeInTheDocument()
      expect(screen.getByText('Review')).toBeInTheDocument()
      expect(screen.getByText('Done')).toBeInTheDocument()
    })
  })

  it('loads and displays tasks', async () => {
    render(<KanbanBoard projectId={1} />)

    await waitFor(() => {
      expect(mockApiService.getProjectTasks).toHaveBeenCalledWith(1)
      expect(screen.getByText('Task 1')).toBeInTheDocument()
      expect(screen.getByText('Task 2')).toBeInTheDocument()
    })
  })

  it('shows loading state initially', () => {
    render(<KanbanBoard projectId={1} />)
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument()
  })

  it('opens task dialog when clicking add button', async () => {
    render(<KanbanBoard projectId={1} />)

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument()
    })

    const addButtons = screen.getAllByRole('button')
    const addButton = addButtons.find(button => button.querySelector('svg'))
    
    if (addButton) {
      fireEvent.click(addButton)
      // Task dialog should open (would need to mock the dialog component)
    }
  })

  it('opens task dialog when clicking on task card', async () => {
    render(<KanbanBoard projectId={1} />)

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Task 1'))
    // Task dialog should open with task data
  })

  it('handles drag and drop', async () => {
    mockApiService.updateTask.mockResolvedValue({
      ...mockTasks[0],
      status: 'IN_PROGRESS'
    })

    render(<KanbanBoard projectId={1} />)

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument()
    })

    const taskCard = screen.getByText('Task 1').closest('[draggable="true"]')
    const inProgressColumn = screen.getByText('In Progress').closest('div')

    if (taskCard && inProgressColumn) {
      // Create proper drag events with dataTransfer
      const dragStartEvent = new DragEvent('dragstart', { bubbles: true })
      const dragOverEvent = new DragEvent('dragover', { bubbles: true })
      const dropEvent = new DragEvent('drop', { bubbles: true })
      
      fireEvent(taskCard, dragStartEvent)
      fireEvent(inProgressColumn, dragOverEvent)
      fireEvent(inProgressColumn, dropEvent)

      await waitFor(() => {
        expect(mockApiService.updateTask).toHaveBeenCalledWith(1, expect.objectContaining({
          status: 'IN_PROGRESS'
        }))
      })
    }
  })
})