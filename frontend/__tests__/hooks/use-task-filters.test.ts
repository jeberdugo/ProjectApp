import { renderHook } from '@testing-library/react'
import { useTaskFilters } from '@/hooks/use-task-filters'
import type { TaskResponse } from '@/lib/api'

const mockTasks: TaskResponse[] = [
  {
    id: 1,
    title: 'Fix bug in login',
    description: 'Critical bug needs fixing',
    status: 'TODO',
    priority: 'HIGH',
    assignedTo: 'john',
    projectName: 'Project A',
    createdBy: 'jane',
    createdAt: '2024-01-01T00:00:00Z',
    dueDate: '2024-01-10T00:00:00Z',
    labels: [{ id: 1, name: 'bug', color: '#ff0000' }]
  },
  {
    id: 2,
    title: 'Add new feature',
    description: 'Implement user dashboard',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    assignedTo: 'jane',
    projectName: 'Project A',
    createdBy: 'john',
    createdAt: '2024-01-05T00:00:00Z',
    dueDate: '2024-01-20T00:00:00Z',
    labels: [{ id: 2, name: 'feature', color: '#00ff00' }]
  },
  {
    id: 3,
    title: 'Update documentation',
    description: 'Update API docs',
    status: 'DONE',
    priority: 'LOW',
    assignedTo: undefined,
    projectName: 'Project B',
    createdBy: 'john',
    createdAt: '2024-01-03T00:00:00Z',
    labels: [{ id: 3, name: 'docs', color: '#0000ff' }]
  }
]

describe('useTaskFilters', () => {
  it('returns all tasks when no filters applied', () => {
    const filters = {
      search: '',
      assignedTo: '',
      priority: '',
      labels: [],
      dueDate: '',
      createdBy: '',
      hasOverdue: false
    }

    const { result } = renderHook(() => useTaskFilters(mockTasks, filters))
    
    expect(result.current).toHaveLength(3)
  })

  it('filters tasks by search term', () => {
    const filters = {
      search: 'bug',
      assignedTo: '',
      priority: '',
      labels: [],
      dueDate: '',
      createdBy: '',
      hasOverdue: false
    }

    const { result } = renderHook(() => useTaskFilters(mockTasks, filters))
    
    expect(result.current).toHaveLength(1)
    expect(result.current[0].title).toBe('Fix bug in login')
  })

  it('filters tasks by assigned user', () => {
    const filters = {
      search: '',
      assignedTo: 'john',
      priority: '',
      labels: [],
      dueDate: '',
      createdBy: '',
      hasOverdue: false
    }

    const { result } = renderHook(() => useTaskFilters(mockTasks, filters))
    
    expect(result.current).toHaveLength(1)
    expect(result.current[0].assignedTo).toBe('john')
  })

  it('filters unassigned tasks', () => {
    const filters = {
      search: '',
      assignedTo: 'unassigned',
      priority: '',
      labels: [],
      dueDate: '',
      createdBy: '',
      hasOverdue: false
    }

    const { result } = renderHook(() => useTaskFilters(mockTasks, filters))
    
    expect(result.current).toHaveLength(1)
    expect(result.current[0].assignedTo).toBeUndefined()
  })

  it('filters tasks by priority', () => {
    const filters = {
      search: '',
      assignedTo: '',
      priority: 'HIGH',
      labels: [],
      dueDate: '',
      createdBy: '',
      hasOverdue: false
    }

    const { result } = renderHook(() => useTaskFilters(mockTasks, filters))
    
    expect(result.current).toHaveLength(1)
    expect(result.current[0].priority).toBe('HIGH')
  })

  it('filters tasks by labels', () => {
    const filters = {
      search: '',
      assignedTo: '',
      priority: '',
      labels: ['bug'],
      dueDate: '',
      createdBy: '',
      hasOverdue: false
    }

    const { result } = renderHook(() => useTaskFilters(mockTasks, filters))
    
    expect(result.current).toHaveLength(1)
    expect(result.current[0].labels.some(l => l.name === 'bug')).toBe(true)
  })

  it('filters tasks by creator', () => {
    const filters = {
      search: '',
      assignedTo: '',
      priority: '',
      labels: [],
      dueDate: '',
      createdBy: 'john',
      hasOverdue: false
    }

    const { result } = renderHook(() => useTaskFilters(mockTasks, filters))
    
    expect(result.current).toHaveLength(2)
    expect(result.current.every(t => t.createdBy === 'john')).toBe(true)
  })

  it('filters tasks without due date', () => {
    const filters = {
      search: '',
      assignedTo: '',
      priority: '',
      labels: [],
      dueDate: 'no-date',
      createdBy: '',
      hasOverdue: false
    }

    const { result } = renderHook(() => useTaskFilters(mockTasks, filters))
    
    expect(result.current).toHaveLength(1)
    expect(result.current[0].dueDate).toBeUndefined()
  })
})