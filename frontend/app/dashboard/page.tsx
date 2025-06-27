"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Calendar, MoreHorizontal } from "lucide-react"
import { type ProjectResponse, apiService } from "@/lib/api"
import { ProjectDialog } from "@/components/project-dialog"
import { useAuth } from "@/contexts/auth-context"
import { ProjectFiltersComponent, type ProjectFilters } from "@/components/project-filters"
import { useProjectFilters } from "@/hooks/use-project-filters"

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null)
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [filters, setFilters] = useState<ProjectFilters>({
    search: "",
    status: "",
    createdBy: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    dateRange: "",
  })

  const { logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const data = await apiService.getProjects()
      setProjects(data)
    } catch (error) {
      console.error("Error loading projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const openProjectDialog = (project?: ProjectResponse) => {
    setSelectedProject(project || null)
    setIsProjectDialogOpen(true)
  }

  const handleProjectSaved = () => {
    loadProjects()
    setIsProjectDialogOpen(false)
    setSelectedProject(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "COMPLETED":
        return "bg-blue-100 text-blue-800"
      case "ON_HOLD":
        return "bg-yellow-100 text-yellow-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredProjects = useProjectFilters(projects, filters)

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">ProjectApp</h1>
            <div className="flex items-center gap-4">
              <Button onClick={() => openProjectDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Projects</h2>
          <p className="text-gray-600">Manage and collaborate on your projects</p>
        </div>

        <ProjectFiltersComponent
          projects={projects}
          filters={filters}
          onFiltersChange={setFilters}
          filteredCount={filteredProjects.length}
        />

        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Calendar className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No projects yet</h3>
              <p>Create your first project to get started</p>
            </div>
            <Button onClick={() => openProjectDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/project/${project.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{project.name}</CardTitle>
                      <Badge className={getStatusColor(project.status)}>{project.status.replace("_", " ")}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        openProjectDialog(project)
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4 line-clamp-2">
                    {project.description || "No description provided"}
                  </CardDescription>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{project.memberCount} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{project.taskCount} tasks</span>
                      </div>
                    </div>
                    <span>by {project.createdBy}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <ProjectDialog
        open={isProjectDialogOpen}
        onOpenChange={setIsProjectDialogOpen}
        project={selectedProject}
        onSave={handleProjectSaved}
      />
    </div>
  )
}
