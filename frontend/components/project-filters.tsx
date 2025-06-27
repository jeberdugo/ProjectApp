"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, X, SortAsc, SortDesc, Calendar, User, BarChart3 } from "lucide-react"
import type { ProjectResponse } from "@/lib/api"

export interface ProjectFilters {
  search: string
  status: string
  createdBy: string
  sortBy: string
  sortOrder: "asc" | "desc"
  dateRange: string
}

interface ProjectFiltersProps {
  projects: ProjectResponse[]
  filters: ProjectFilters
  onFiltersChange: (filters: ProjectFilters) => void
  filteredCount: number
}

export function ProjectFiltersComponent({ projects, filters, onFiltersChange, filteredCount }: ProjectFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateFilter = (key: keyof ProjectFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      status: "",
      createdBy: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      dateRange: "",
    })
  }

  const toggleSortOrder = () => {
    onFiltersChange({ ...filters, sortOrder: filters.sortOrder === "asc" ? "desc" : "asc" })
  }

  const getUniqueCreators = () => {
    const creators = [...new Set(projects.map((p) => p.createdBy))]
    return creators.sort()
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.status) count++
    if (filters.createdBy) count++
    if (filters.dateRange) count++
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
                placeholder="Search projects by name..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <BarChart3 className="h-4 w-4" />
                    Sort By
                  </label>
                  <div className="flex gap-1">
                    <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="createdAt">Created Date</SelectItem>
                        <SelectItem value="taskCount">Task Count</SelectItem>
                        <SelectItem value="memberCount">Member Count</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={toggleSortOrder} className="px-2 bg-transparent">
                      {filters.sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date Range
                  </label>
                  <Select value={filters.dateRange} onValueChange={(value) => updateFilter("dateRange", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
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
            </div>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-4">
            <span>
              Showing {filteredCount} of {projects.length} projects
            </span>
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2">
                <span>Active filters:</span>
                <div className="flex gap-1">
                  {filters.search && <Badge variant="secondary">Search: "{filters.search}"</Badge>}
                  {filters.status && <Badge variant="secondary">Status: {filters.status}</Badge>}
                  {filters.createdBy && <Badge variant="secondary">Creator: {filters.createdBy}</Badge>}
                  {filters.dateRange && <Badge variant="secondary">Date: {filters.dateRange}</Badge>}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
