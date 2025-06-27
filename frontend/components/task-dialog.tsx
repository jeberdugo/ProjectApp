"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type TaskResponse, type TaskRequest, apiService, type LabelResponse } from "@/lib/api"

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: TaskResponse | null
  projectId: number
  onSave: () => void
}

export function TaskDialog({ open, onOpenChange, task, projectId, onSave }: TaskDialogProps) {
  const [formData, setFormData] = useState<TaskRequest>({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    projectId: projectId,
    labelIds: [],
  })
  const [labels, setLabels] = useState<LabelResponse[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      loadLabels()
      if (task) {
        setFormData({
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          projectId: projectId,
          dueDate: task.dueDate,
          labelIds: task.labels.map((l) => l.id),
        })
      } else {
        setFormData({
          title: "",
          description: "",
          status: "TODO",
          priority: "MEDIUM",
          projectId: projectId,
          labelIds: [],
        })
      }
    }
  }, [open, task, projectId])

  const loadLabels = async () => {
    try {
      const data = await apiService.getProjectLabels(projectId)
      setLabels(data)
    } catch (error) {
      console.error("Error loading labels:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (task) {
        await apiService.updateTask(task.id, formData)
      } else {
        await apiService.createTask(formData)
      }
      onSave()
    } catch (error) {
      console.error("Error saving task:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!task) return

    setLoading(true)
    try {
      await apiService.deleteTask(task.id)
      onSave()
    } catch (error) {
      console.error("Error deleting task:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update task details" : "Create a new task for this project"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="REVIEW">Review</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value as any }))}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={formData.dueDate ? new Date(formData.dueDate).toISOString().slice(0, 16) : ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                }))
              }
            />
          </div>

          <div className="flex justify-between">
            <div className="flex gap-2">
              {task && (
                <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : task ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
