import { apiService } from '@/lib/api'

// Mock fetch
const mockFetch = jest.mocked(global.fetch)

// Mock window.location
const mockLocation = {
  href: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
}

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
})

describe('ApiService Extended Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    mockLocation.href = ''
  })

  describe('Authentication Headers', () => {
    it('includes auth header when token exists', async () => {
      localStorage.setItem('token', 'test-token')
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response)

      await apiService.getProjects()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/projects',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })

    it('does not include auth header when no token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response)

      await apiService.getProjects()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/projects',
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.any(String)
          })
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('redirects to login on 401 error', async () => {
      localStorage.setItem('token', 'invalid-token')
      localStorage.setItem('refreshToken', 'invalid-refresh')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response)

      await expect(apiService.getProjects()).rejects.toThrow('HTTP error! status: 401')

      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('refreshToken')).toBeNull()
      expect(mockLocation.href).toBe('/login')
    })

    it('throws error for other HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response)

      await expect(apiService.getProjects()).rejects.toThrow('HTTP error! status: 500')
    })
  })

  describe('Task Endpoints', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'test-token')
    })

    it('gets user tasks', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'User Task',
          description: 'Task Description',
          status: 'TODO',
          priority: 'HIGH',
          projectName: 'Project A',
          createdBy: 'user',
          createdAt: '2024-01-01',
          labels: []
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasks,
      } as Response)

      const result = await apiService.getUserTasks()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/tasks/my-tasks',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
      expect(result).toEqual(mockTasks)
    })

    it('gets single task', async () => {
      const mockTask = {
        id: 1,
        title: 'Single Task',
        description: 'Task Description',
        status: 'TODO',
        priority: 'HIGH',
        projectName: 'Project A',
        createdBy: 'user',
        createdAt: '2024-01-01',
        labels: []
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTask,
      } as Response)

      const result = await apiService.getTask(1)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/tasks/1',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
      expect(result).toEqual(mockTask)
    })

    it('updates task', async () => {
      const taskData = {
        title: 'Updated Task',
        description: 'Updated Description',
        status: 'IN_PROGRESS' as const,
        priority: 'MEDIUM' as const,
        projectId: 1,
        labelIds: [1, 2]
      }

      const mockResponse = {
        id: 1,
        ...taskData,
        projectName: 'Project A',
        createdBy: 'user',
        createdAt: '2024-01-01',
        labels: []
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await apiService.updateTask(1, taskData)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/tasks/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(taskData)
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('deletes task', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => undefined,
      } as Response)

      await apiService.deleteTask(1)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/tasks/1',
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })
  })

  describe('Label Endpoints', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'test-token')
    })

    it('gets all labels', async () => {
      const mockLabels = [
        { id: 1, name: 'bug', color: '#ff0000' },
        { id: 2, name: 'feature', color: '#00ff00' }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockLabels,
      } as Response)

      const result = await apiService.getLabels()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/labels',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
      expect(result).toEqual(mockLabels)
    })

    it('creates label', async () => {
      const labelData = {
        name: 'urgent',
        color: '#ff6600'
      }

      const mockResponse = {
        id: 3,
        ...labelData
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await apiService.createLabel(labelData)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/labels',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(labelData)
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('updates label', async () => {
      const labelData = {
        name: 'updated-label',
        color: '#0066ff'
      }

      const mockResponse = {
        id: 1,
        ...labelData
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await apiService.updateLabel(1, labelData)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/labels/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(labelData)
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('deletes label', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => undefined,
      } as Response)

      await apiService.deleteLabel(1)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/labels/1',
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })
  })

  describe('Project Member Endpoints', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'test-token')
    })

    it('gets project members', async () => {
      const mockMembers = [
        {
          username: 'user1',
          email: 'user1@example.com',
          role: 'OWNER',
          joinedAt: '2024-01-01'
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMembers,
      } as Response)

      const result = await apiService.getProjectMembers(1)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/projects/1/members',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
      expect(result).toEqual(mockMembers)
    })

    it('adds project member', async () => {
      const memberData = {
        username: 'newuser',
        role: 'TEAM_MEMBER' as const
      }

      const mockResponse = {
        username: 'newuser',
        email: 'newuser@example.com',
        role: 'TEAM_MEMBER',
        joinedAt: '2024-01-01'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await apiService.addProjectMember(1, memberData)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/projects/1/members',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(memberData)
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('updates member role', async () => {
      const mockResponse = {
        username: 'user1',
        email: 'user1@example.com',
        role: 'ADMIN',
        joinedAt: '2024-01-01'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await apiService.updateMemberRole(1, 'user1', 'ADMIN')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/projects/1/members/user1/role',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify('ADMIN')
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('removes member', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => undefined,
      } as Response)

      await apiService.removeMember(1, 'user1')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/projects/1/members/user1',
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })
  })

  describe('Refresh Token', () => {
    it('refreshes token successfully', async () => {
      const mockResponse = {
        token: 'new-token',
        refreshToken: 'new-refresh-token'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await apiService.refreshToken('old-refresh-token')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/auth/refresh',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ refreshToken: 'old-refresh-token' })
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Project Operations', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'test-token')
    })

    it('gets single project', async () => {
      const mockProject = {
        id: 1,
        name: 'Test Project',
        description: 'Test Description',
        status: 'ACTIVE',
        createdBy: 'user',
        createdAt: '2024-01-01',
        taskCount: 5,
        memberCount: 2,
        members: []
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProject,
      } as Response)

      const result = await apiService.getProject(1)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/projects/1',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
      expect(result).toEqual(mockProject)
    })

    it('updates project', async () => {
      const projectData = {
        name: 'Updated Project',
        description: 'Updated Description',
        status: 'COMPLETED' as const
      }

      const mockResponse = {
        id: 1,
        ...projectData,
        createdBy: 'user',
        createdAt: '2024-01-01',
        taskCount: 5,
        memberCount: 2,
        members: []
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await apiService.updateProject(1, projectData)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/projects/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(projectData)
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('deletes project', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => undefined,
      } as Response)

      await apiService.deleteProject(1)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/projects/1',
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })
  })
})