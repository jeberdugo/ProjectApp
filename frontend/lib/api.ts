const API_BASE_URL = "http://localhost:8080/api"

export interface AuthRequest {
  usernameOrEmail: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
}

export interface ProjectRequest {
  name: string
  description: string
  status: "ACTIVE" | "COMPLETED" | "ON_HOLD" | "CANCELLED"
}

export interface ProjectResponse {
  id: number
  name: string
  description: string
  status: "ACTIVE" | "COMPLETED" | "ON_HOLD" | "CANCELLED"
  createdBy: string
  createdAt: string
  taskCount: number
  memberCount: number
  members: string[]
}

export interface TaskRequest {
  title: string
  description: string
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  assignedToId?: number
  projectId: number
  dueDate?: string
  labelIds?: number[]
}

export interface TaskResponse {
  id: number
  title: string
  description: string
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  assignedTo?: string
  projectName: string
  createdBy: string
  createdAt: string
  dueDate?: string
  labels: LabelResponse[]
}

export interface LabelRequest {
  name: string
  color: string
}

export interface LabelResponse {
  id: number
  name: string
  color: string
}

export interface ProjectMemberRequest {
  username: string
  role: "OWNER" | "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER" | "VIEWER"
}

export interface ProjectMemberResponse {
  username: string
  email: string
  role: "OWNER" | "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER" | "VIEWER"
  joinedAt: string
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("refreshToken")
        window.location.href = "/login"
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  // Auth endpoints
  async login(data: AuthRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return this.handleResponse<AuthResponse>(response)
  }

  async register(data: RegisterRequest): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return this.handleResponse<any>(response)
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
    return this.handleResponse<AuthResponse>(response)
  }

  // Project endpoints
  async getProjects(): Promise<ProjectResponse[]> {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse<ProjectResponse[]>(response)
  }

  async getProject(id: number): Promise<ProjectResponse> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse<ProjectResponse>(response)
  }

  async createProject(data: ProjectRequest): Promise<ProjectResponse> {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<ProjectResponse>(response)
  }

  async updateProject(id: number, data: ProjectRequest): Promise<ProjectResponse> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<ProjectResponse>(response)
  }

  async deleteProject(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })
    await this.handleResponse<void>(response)
  }

  // Task endpoints
  async getProjectTasks(projectId: number): Promise<TaskResponse[]> {
    const response = await fetch(`${API_BASE_URL}/tasks/project/${projectId}`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse<TaskResponse[]>(response)
  }

  async getUserTasks(): Promise<TaskResponse[]> {
    const response = await fetch(`${API_BASE_URL}/tasks/my-tasks`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse<TaskResponse[]>(response)
  }

  async getTask(id: number): Promise<TaskResponse> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse<TaskResponse>(response)
  }

  async createTask(data: TaskRequest): Promise<TaskResponse> {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<TaskResponse>(response)
  }

  async updateTask(id: number, data: TaskRequest): Promise<TaskResponse> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<TaskResponse>(response)
  }

  async deleteTask(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })
    await this.handleResponse<void>(response)
  }

  // Label endpoints
  async getLabels(): Promise<LabelResponse[]> {
    const response = await fetch(`${API_BASE_URL}/labels`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse<LabelResponse[]>(response)
  }

  async getProjectLabels(projectId: number): Promise<LabelResponse[]> {
    const response = await fetch(`${API_BASE_URL}/labels/project/${projectId}`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse<LabelResponse[]>(response)
  }

  async createLabel(data: LabelRequest): Promise<LabelResponse> {
    const response = await fetch(`${API_BASE_URL}/labels`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<LabelResponse>(response)
  }

  async updateLabel(id: number, data: LabelRequest): Promise<LabelResponse> {
    const response = await fetch(`${API_BASE_URL}/labels/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<LabelResponse>(response)
  }

  async deleteLabel(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/labels/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })
    await this.handleResponse<void>(response)
  }

  // Project member endpoints
  async getProjectMembers(projectId: number): Promise<ProjectMemberResponse[]> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse<ProjectMemberResponse[]>(response)
  }

  async addProjectMember(projectId: number, data: ProjectMemberRequest): Promise<ProjectMemberResponse> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<ProjectMemberResponse>(response)
  }

  async updateMemberRole(projectId: number, username: string, role: string): Promise<ProjectMemberResponse> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members/${username}/role`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(role),
    })
    return this.handleResponse<ProjectMemberResponse>(response)
  }

  async removeMember(projectId: number, username: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members/${username}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })
    await this.handleResponse<void>(response)
  }
}

export const apiService = new ApiService()
