import { renderHook } from '@testing-library/react'
import { useProjectFilters } from '@/hooks/use-project-filters'
import type { ProjectResponse } from '@/lib/api'

const mockProjects: ProjectResponse[] = [
  {
    id: 1,
    name: 'Active Project',
    description: 'An active project',
    status: 'ACTIVE',
    createdBy: 'john',
    createdAt: '2024-01-01T00:00:00Z',
    taskCount: 5,
    memberCount: 3,
    members: []
  },
  {
    id: 2,
    name: 'Completed Project',
    description: 'A completed project',
    status: 'COMPLETED',
    createdBy: 'jane',
    createdAt: '2024-01-15T00:00:00Z',
    taskCount: 10,
    memberCount: 2,
    members: []
  },
  {
    id: 3,
    name: 'Test Project',
    description: 'A test project by john',
    status: 'ACTIVE',
    createdBy: 'john',
    createdAt: '2024-02-01T00:00:00Z',
    taskCount: 2,
    memberCount: 1,
    members: []
  }
]

describe('useProjectFilters', () => {
  it('returns all projects when no filters applied', () => {
    const filters = {
      search: '',
      status: '',
      createdBy: '',
      sortBy: 'createdAt',
      sortOrder: 'desc' as const,
      dateRange: ''
    }

    const { result } = renderHook(() => useProjectFilters(mockProjects, filters))
    
    expect(result.current).toHaveLength(3)
  })

  it('filters projects by search term', () => {
    const filters = {
      search: 'test',
      status: '',
      createdBy: '',
      sortBy: 'createdAt',
      sortOrder: 'desc' as const,
      dateRange: ''
    }

    const { result } = renderHook(() => useProjectFilters(mockProjects, filters))
    
    expect(result.current).toHaveLength(1)
    expect(result.current[0].name).toBe('Test Project')
  })

  it('filters projects by status', () => {
    const filters = {
      search: '',
      status: 'COMPLETED',
      createdBy: '',
      sortBy: 'createdAt',
      sortOrder: 'desc' as const,
      dateRange: ''
    }

    const { result } = renderHook(() => useProjectFilters(mockProjects, filters))
    
    expect(result.current).toHaveLength(1)
    expect(result.current[0].status).toBe('COMPLETED')
  })

  it('filters projects by creator', () => {
    const filters = {
      search: '',
      status: '',
      createdBy: 'john',
      sortBy: 'createdAt',
      sortOrder: 'desc' as const,
      dateRange: ''
    }

    const { result } = renderHook(() => useProjectFilters(mockProjects, filters))
    
    expect(result.current).toHaveLength(2)
    expect(result.current.every(p => p.createdBy === 'john')).toBe(true)
  })

  it('sorts projects by name ascending', () => {
    const filters = {
      search: '',
      status: '',
      createdBy: '',
      sortBy: 'name',
      sortOrder: 'asc' as const,
      dateRange: ''
    }

    const { result } = renderHook(() => useProjectFilters(mockProjects, filters))
    
    expect(result.current[0].name).toBe('Active Project')
    expect(result.current[1].name).toBe('Completed Project')
    expect(result.current[2].name).toBe('Test Project')
  })

  it('sorts projects by task count descending', () => {
    const filters = {
      search: '',
      status: '',
      createdBy: '',
      sortBy: 'taskCount',
      sortOrder: 'desc' as const,
      dateRange: ''
    }

    const { result } = renderHook(() => useProjectFilters(mockProjects, filters))
    
    expect(result.current[0].taskCount).toBe(10)
    expect(result.current[1].taskCount).toBe(5)
    expect(result.current[2].taskCount).toBe(2)
  })
})