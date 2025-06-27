import { render, screen, fireEvent } from '@testing-library/react'
import { ProjectFiltersComponent } from '@/components/project-filters'
import type { ProjectResponse } from '@/lib/api'

const mockProjects: ProjectResponse[] = [
  {
    id: 1,
    name: 'Project A',
    description: 'Description A',
    status: 'ACTIVE',
    createdBy: 'john',
    createdAt: '2024-01-01T00:00:00Z',
    taskCount: 5,
    memberCount: 3,
    members: []
  },
  {
    id: 2,
    name: 'Project B',
    description: 'Description B',
    status: 'COMPLETED',
    createdBy: 'jane',
    createdAt: '2024-01-15T00:00:00Z',
    taskCount: 10,
    memberCount: 2,
    members: []
  }
]

describe('ProjectFiltersComponent', () => {
  const mockOnFiltersChange = jest.fn()
  const defaultFilters = {
    search: '',
    status: '',
    createdBy: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as const,
    dateRange: ''
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders search input', () => {
    render(
      <ProjectFiltersComponent
        projects={mockProjects}
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        filteredCount={2}
      />
    )

    expect(screen.getByPlaceholderText('Search projects by name...')).toBeInTheDocument()
  })

  it('renders status filter', () => {
    render(
      <ProjectFiltersComponent
        projects={mockProjects}
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        filteredCount={2}
      />
    )

    expect(screen.getByText('All Status')).toBeInTheDocument()
  })

  it('calls onFiltersChange when search input changes', () => {
    render(
      <ProjectFiltersComponent
        projects={mockProjects}
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        filteredCount={2}
      />
    )

    const searchInput = screen.getByPlaceholderText('Search projects by name...')
    fireEvent.change(searchInput, { target: { value: 'test search' } })

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      search: 'test search'
    })
  })

  it('shows advanced filters when filters button is clicked', () => {
    render(
      <ProjectFiltersComponent
        projects={mockProjects}
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        filteredCount={2}
      />
    )

    fireEvent.click(screen.getByText('Filters'))
    expect(screen.getByText('Created By')).toBeInTheDocument()
    expect(screen.getByText('Sort By')).toBeInTheDocument()
  })

  it('displays filter count badge when filters are active', () => {
    const activeFilters = {
      ...defaultFilters,
      search: 'test',
      status: 'ACTIVE'
    }

    render(
      <ProjectFiltersComponent
        projects={mockProjects}
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
        filteredCount={1}
      />
    )

    expect(screen.getByText('2')).toBeInTheDocument() // Badge showing 2 active filters
  })

  it('shows results summary', () => {
    render(
      <ProjectFiltersComponent
        projects={mockProjects}
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        filteredCount={1}
      />
    )

    expect(screen.getByText('Showing 1 of 2 projects')).toBeInTheDocument()
  })

  it('clears all filters when clear button is clicked', () => {
    const activeFilters = {
      ...defaultFilters,
      search: 'test',
      status: 'ACTIVE'
    }

    render(
      <ProjectFiltersComponent
        projects={mockProjects}
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
        filteredCount={1}
      />
    )

    fireEvent.click(screen.getByText('Filters'))
    fireEvent.click(screen.getByText('Clear All'))

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      search: '',
      status: '',
      createdBy: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      dateRange: ''
    })
  })

  it('toggles sort order when sort button is clicked', () => {
    render(
      <ProjectFiltersComponent
        projects={mockProjects}
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        filteredCount={2}
      />
    )

    fireEvent.click(screen.getByText('Filters'))
    
    // Find the sort button by looking for the button with sort icon
    const sortButton = screen.getByRole('button', { name: '' })
    const buttons = screen.getAllByRole('button')
    const sortButtonElement = buttons.find(button => 
      button.querySelector('svg') && 
      button.className.includes('bg-transparent')
    )
    
    if (sortButtonElement) {
      fireEvent.click(sortButtonElement)
    }

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      sortOrder: 'asc'
    })
  })
})