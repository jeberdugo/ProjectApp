"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, X, User, Tag, AlertCircle, Calendar } from "lucide-react"
import type { TaskResponse } from "@/lib/api"

export interface TaskFilters {
  search: string
  assignedTo: string
  priority: string
  labels: string[]
  dueDate: string
  createdBy: string
  hasOverdue: boolean
}

interface TaskFiltersProps {
  tasks: TaskResponse[]
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  filteredCount: number
}

export function TaskFiltersComponent({ tasks, filters, onFiltersChange, filteredCount }: TaskFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateFilter = (key: keyof TaskFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleLabel = (labelName: string) => {
    const newLabels = filters.labels.includes(labelName)
      ? filters.labels.filter((l) => l !== labelName)
      : [...filters.labels, labelName]
    updateFilter("labels", newLabels)
  }

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      assignedTo: "",
      priority: "",
      labels: [],
      dueDate: "",
      createdBy: "",
      hasOverdue: false,
    })
  }

  const getUniqueAssignees = () => {
    const assignees = [...new Set(tasks.map((t) => t.assignedTo).filter(Boolean))]
    return assignees.sort()
  }

  const getUniqueCreators = () => {
    const creators = [...new Set(tasks.map((t) => t.createdBy))]
    return creators.sort()
  }

  const getUniqueLabels = () => {
    const allLabels = tasks.flatMap((t) => t.labels)
    const uniqueLabels = allLabels.filter((label, index, self) => self.findIndex((l) => l.id === label.id) === index)
    return uniqueLabels.sort((a, b) => a.name.localeCompare(b.name))
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.assignedTo) count++
    if (filters.priority) count++
    if (filters.labels.length > 0) count++
    if (filters.dueDate) count++
    if (filters.createdBy) count++
    if (filters.hasOverdue) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search and Quick Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tasks by title or description..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select value={filters.assignedTo} onValueChange={(value) => updateFilter("assignedTo", value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Assignees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {getUniqueAssignees().map((assignee) => (
                    <SelectItem key={assignee} value={assignee!}>
                      {assignee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.priority} onValueChange={(value) => updateFilter("priority", value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="URGENT">🔴 Urgent</SelectItem>
                  <SelectItem value="HIGH">🟠 High</SelectItem>
                  <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
                  <SelectItem value="LOW">⚪ Low</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="border-t pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Created By
                  </label>
                  <Select value={filters.createdBy} onValueChange={(value) => updateFilter("createdBy", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Creators" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Creators</SelectItem>
                      {getUniqueCreators().map((creator) => (
                        <SelectItem key={creator} value={creator}>
                          {creator}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Due Date
                  </label>
                  <Select value={filters.dueDate} onValueChange={(value) => updateFilter("dueDate", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Dates" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="today">Due Today</SelectItem>
                      <SelectItem value="tomorrow">Due Tomorrow</SelectItem>
                      <SelectItem value="week">Due This Week</SelectItem>
                      <SelectItem value="month">Due This Month</SelectItem>
                      <SelectItem value="no-date">No Due Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full flex items-center gap-2 bg-transparent"
                  >
                    <X className="h-4 w-4" />
                    Clear All
                  </Button>
                </div>
              </div>

              {/* Labels Filter */}
              {getUniqueLabels().length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Labels
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {getUniqueLabels().map((label) => (
                      <Badge
                        key={label.id}
                        variant={filters.labels.includes(label.name) ? "default" : "outline"}
                        className="cursor-pointer hover:opacity-80"
                        style={{
                          backgroundColor: filters.labels.includes(label.name) ? label.color : undefined,
                          borderColor: label.color,
                        }}
                        onClick={() => toggleLabel(label.name)}
                      >
                        {label.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button
                  variant={filters.hasOverdue ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter("hasOverdue", !filters.hasOverdue)}
                  className="flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  Show Only Overdue
                </Button>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-4">
            <span>
              Showing {filteredCount} of {tasks.length} tasks
            </span>
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2">
                <span>Active filters:</span>
                <div className="flex gap-1 flex-wrap">
                  {filters.search && <Badge variant="secondary">Search: "{filters.search}"</Badge>}
                  {filters.assignedTo && <Badge variant="secondary">Assignee: {filters.assignedTo}</Badge>}
                  {filters.priority && <Badge variant="secondary">Priority: {filters.priority}</Badge>}
                  {filters.labels.length > 0 && <Badge variant="secondary">Labels: {filters.labels.length}</Badge>}
                  {filters.dueDate && <Badge variant="secondary">Due: {filters.dueDate}</Badge>}
                  {filters.createdBy && <Badge variant="secondary">Creator: {filters.createdBy}</Badge>}
                  {filters.hasOverdue && <Badge variant="secondary">Overdue Only</Badge>}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
