"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, User } from "lucide-react"
import { type TaskResponse, apiService } from "@/lib/api"
import { TaskDialog } from "./task-dialog"
import { TaskFiltersComponent, type TaskFilters } from "@/components/task-filters"
import { useTaskFilters } from "@/hooks/use-task-filters"

interface KanbanBoardProps {
  projectId: number
}

const COLUMNS = [
  { id: "TODO", title: "To Do", color: "bg-gray-100" },
  { id: "IN_PROGRESS", title: "In Progress", color: "bg-blue-100" },
  { id: "REVIEW", title: "Review", color: "bg-yellow-100" },
  { id: "DONE", title: "Done", color: "bg-green-100" },
]

const PRIORITY_COLORS = {
  LOW: "bg-gray-500",
  MEDIUM: "bg-yellow-500",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-500",
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<TaskResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [draggedTask, setDraggedTask] = useState<TaskResponse | null>(null)

  const [filters, setFilters] = useState<TaskFilters>({
    search: "",
    assignedTo: "",
    priority: "",
    labels: [],
    dueDate: "",
    createdBy: "",
    hasOverdue: false,
  })

  const filteredTasks = useTaskFilters(tasks, filters)

  useEffect(() => {
    loadTasks()
  }, [projectId])

  const loadTasks = async () => {
    try {
      const data = await apiService.getProjectTasks(projectId)
      setTasks(data)
    } catch (error) {
      console.error("Error loading tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskUpdate = async (taskId: number, newStatus: string) => {
    try {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      await apiService.updateTask(taskId, {
        title: task.title,
        description: task.description,
        status: newStatus as any,
        priority: task.priority,
        projectId: projectId,
        assignedToId: undefined, // You might want to handle this properly
        dueDate: task.dueDate,
        labelIds: task.labels.map((l) => l.id),
      })

      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus as any } : t)))
    } catch (error) {
      console.error("Error updating task:", error)
    }
  }

  const handleDragStart = (e: React.DragEvent, task: TaskResponse) => {
    setDraggedTask(task)
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move"
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move"
    }
  }

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    if (draggedTask && draggedTask.status !== status) {
      handleTaskUpdate(draggedTask.id, status)
    }
    setDraggedTask(null)
  }

  const openTaskDialog = (task?: TaskResponse) => {
    setSelectedTask(task || null)
    setIsTaskDialogOpen(true)
  }

  const handleTaskSaved = () => {
    loadTasks()
    setIsTaskDialogOpen(false)
    setSelectedTask(null)
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading tasks...</div>
  }

  return (
    <div className="flex gap-6 p-6 overflow-x-auto min-h-screen">
      <TaskFiltersComponent
        tasks={tasks}
        filters={filters}
        onFiltersChange={setFilters}
        filteredCount={filteredTasks.length}
      />
      {COLUMNS.map((column) => (
        <div
          key={column.id}
          className={`flex-shrink-0 w-80 ${column.color} rounded-lg p-4`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">{column.title}</h3>
            <Button size="sm" variant="ghost" onClick={() => openTaskDialog()} className="h-8 w-8 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {filteredTasks
              .filter((task) => task.status === column.id)
              .map((task) => (
                <Card
                  key={task.id}
                  className="cursor-pointer hover:shadow-md transition-shadow bg-white"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onClick={() => openTaskDialog(task)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-medium line-clamp-2">{task.title}</CardTitle>
                      <div className={`w-3 h-3 rounded-full ${PRIORITY_COLORS[task.priority]} flex-shrink-0 ml-2`} />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {task.description && <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>}

                    <div className="flex flex-wrap gap-1 mb-3">
                      {task.labels.map((label) => (
                        <Badge
                          key={label.id}
                          variant="secondary"
                          className="text-xs"
                          style={{ backgroundColor: label.color }}
                        >
                          {label.name}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        {task.assignedTo && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{task.assignedTo}</span>
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {task.priority}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        task={selectedTask}
        projectId={projectId}
        onSave={handleTaskSaved}
      />
    </div>
  )
}
