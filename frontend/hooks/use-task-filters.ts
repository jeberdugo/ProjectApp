"use client"

import { useMemo } from "react"
import type { TaskResponse } from "@/lib/api"
import type { TaskFilters } from "@/components/task-filters"

export function useTaskFilters(tasks: TaskResponse[], filters: TaskFilters) {
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower) ||
          task.assignedTo?.toLowerCase().includes(searchLower) ||
          task.createdBy.toLowerCase().includes(searchLower),
      )
    }

    // Assigned to filter
    if (filters.assignedTo) {
      if (filters.assignedTo === "unassigned") {
        filtered = filtered.filter((task) => !task.assignedTo)
      } else {
        filtered = filtered.filter((task) => task.assignedTo === filters.assignedTo)
      }
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter((task) => task.priority === filters.priority)
    }

    // Labels filter
    if (filters.labels.length > 0) {
      filtered = filtered.filter((task) =>
        filters.labels.some((labelName) => task.labels.some((label) => label.name === labelName)),
      )
    }

    // Created by filter
    if (filters.createdBy) {
      filtered = filtered.filter((task) => task.createdBy === filters.createdBy)
    }

    // Due date filter
    if (filters.dueDate) {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      filtered = filtered.filter((task) => {
        if (!task.dueDate && filters.dueDate === "no-date") return true
        if (!task.dueDate) return false

        const dueDate = new Date(task.dueDate)
        const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())

        switch (filters.dueDate) {
          case "overdue":
            return dueDate < now
          case "today":
            return dueDateOnly.getTime() === today.getTime()
          case "tomorrow":
            return dueDateOnly.getTime() === tomorrow.getTime()
          case "week":
            const weekFromNow = new Date(today)
            weekFromNow.setDate(weekFromNow.getDate() + 7)
            return dueDate >= today && dueDate <= weekFromNow
          case "month":
            const monthFromNow = new Date(today)
            monthFromNow.setMonth(monthFromNow.getMonth() + 1)
            return dueDate >= today && dueDate <= monthFromNow
          case "no-date":
            return !task.dueDate
          default:
            return true
        }
      })
    }

    // Overdue filter
    if (filters.hasOverdue) {
      const now = new Date()
      filtered = filtered.filter((task) => task.dueDate && new Date(task.dueDate) < now)
    }

    return filtered
  }, [tasks, filters])

  return filteredTasks
}
