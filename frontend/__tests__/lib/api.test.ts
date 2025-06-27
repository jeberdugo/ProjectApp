import { apiService } from '@/lib/api'

// Mock fetch
const mockFetch = jest.mocked(global.fetch)

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('Authentication', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        token: 'test-token',
        refreshToken: 'test-refresh-token'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await apiService.login({
        usernameOrEmail: 'test@example.com',
        password: 'password'
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usernameOrEmail: 'test@example.com',
            password: 'password'
          })
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should handle login error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response)

      await expect(apiService.login({
        usernameOrEmail: 'test@example.com',
        password: 'wrong-password'
      })).rejects.toThrow('HTTP error! status: 401')
    })
  })

  describe('Projects', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'test-token')
    })

    it('should get projects with auth header', async () => {
      const mockProjects = [
        {
          id: 1,
          name: 'Test Project',
          description: 'Test Description',
          status: 'ACTIVE',
          createdBy: 'user',
          createdAt: '2024-01-01',
          taskCount: 0,
          memberCount: 1,
          members: []
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProjects,
      } as Response)

      const result = await apiService.getProjects()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/projects',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
      expect(result).toEqual(mockProjects)
    })

    it('should create project', async () => {
      const newProject = {
        name: 'New Project',
        description: 'New Description',
        status: 'ACTIVE' as const
      }

      const mockResponse = {
        id: 1,
        ...newProject,
        createdBy: 'user',
        createdAt: '2024-01-01',
        taskCount: 0,
        memberCount: 1,
        members: []
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await apiService.createProject(newProject)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/projects',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newProject)
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })
})