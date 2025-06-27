"use client"

import { useMemo } from "react"
import type { ProjectResponse } from "@/lib/api"
import type { ProjectFilters } from "@/components/project-filters"

export function useProjectFilters(projects: ProjectResponse[], filters: ProjectFilters) {
  const filteredProjects = useMemo(() => {
    let filtered = [...projects]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower) ||
          project.createdBy.toLowerCase().includes(searchLower),
      )
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((project) => project.status === filters.status)
    }

    // Created by filter
    if (filters.createdBy) {
      filtered = filtered.filter((project) => project.createdBy === filters.createdBy)
    }

    // Date range filter
    if (filters.dateRange) {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      filtered = filtered.filter((project) => {
        const createdDate = new Date(project.createdAt)
        const createdDateOnly = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate())

        switch (filters.dateRange) {
          case "today":
            return createdDateOnly.getTime() === today.getTime()
          case "week":
            const weekAgo = new Date(today)
            weekAgo.setDate(weekAgo.getDate() - 7)
            return createdDate >= weekAgo
          case "month":
            const monthAgo = new Date(today)
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            return createdDate >= monthAgo
          case "quarter":
            const quarterAgo = new Date(today)
            quarterAgo.setMonth(quarterAgo.getMonth() - 3)
            return createdDate >= quarterAgo
          case "year":
            const yearAgo = new Date(today)
            yearAgo.setFullYear(yearAgo.getFullYear() - 1)
            return createdDate >= yearAgo
          default:
            return true
        }
      })
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (filters.sortBy) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "createdAt":
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        case "taskCount":
          aValue = a.taskCount
          bValue = b.taskCount
          break
        case "memberCount":
          aValue = a.memberCount
          bValue = b.memberCount
          break
        case "status":
          aValue = a.status
          bValue = b.status
          break
        default:
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
      }

      if (aValue < bValue) return filters.sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return filters.sortOrder === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [projects, filters])

  return filteredProjects
}
