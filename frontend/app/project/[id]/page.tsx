"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Settings, Users } from "lucide-react"
import { type ProjectResponse, apiService } from "@/lib/api"
import { KanbanBoard } from "@/components/kanban-board"
import { ProjectMembersDialog } from "@/components/project-members-dialog"

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = Number.parseInt(params.id as string)

  const [project, setProject] = useState<ProjectResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false)

  useEffect(() => {
    if (projectId) {
      loadProject()
    }
  }, [projectId])

  const loadProject = async () => {
    try {
      const data = await apiService.getProject(projectId)
      setProject(data)
    } catch (error) {
      console.error("Error loading project:", error)
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
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

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading project...</div>
  }

  if (!project) {
    return <div className="flex justify-center items-center min-h-screen">Project not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getStatusColor(project.status)}>{project.status.replace("_", " ")}</Badge>
                  <span className="text-sm text-gray-500">Created by {project.createdBy}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsMembersDialogOpen(true)}>
                <Users className="h-4 w-4 mr-2" />
                {project.memberCount} Members
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <KanbanBoard projectId={projectId} />
      <ProjectMembersDialog
        open={isMembersDialogOpen}
        onOpenChange={setIsMembersDialogOpen}
        projectId={projectId}
        projectName={project.name}
      />
    </div>
  )
}
