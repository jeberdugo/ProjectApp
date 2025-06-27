"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Plus, UserMinus, Crown, Shield, Briefcase, User, Eye, Mail, Calendar } from "lucide-react"
import { type ProjectMemberResponse, type ProjectMemberRequest, apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface ProjectMembersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: number
  projectName: string
}

const ROLES = [
  { value: "OWNER", label: "Owner", icon: Crown, color: "bg-purple-100 text-purple-800", description: "Full control" },
  {
    value: "ADMIN",
    label: "Admin",
    icon: Shield,
    color: "bg-red-100 text-red-800",
    description: "Manage project & members",
  },
  {
    value: "PROJECT_MANAGER",
    label: "Project Manager",
    icon: Briefcase,
    color: "bg-blue-100 text-blue-800",
    description: "Manage tasks & timeline",
  },
  {
    value: "TEAM_MEMBER",
    label: "Team Member",
    icon: User,
    color: "bg-green-100 text-green-800",
    description: "Create & edit tasks",
  },
  { value: "VIEWER", label: "Viewer", icon: Eye, color: "bg-gray-100 text-gray-800", description: "View only access" },
]

export function ProjectMembersDialog({ open, onOpenChange, projectId, projectName }: ProjectMembersDialogProps) {
  const [members, setMembers] = useState<ProjectMemberResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [addingMember, setAddingMember] = useState(false)
  const [newMember, setNewMember] = useState<ProjectMemberRequest>({
    username: "",
    role: "TEAM_MEMBER",
  })
  const [editingMember, setEditingMember] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadMembers()
    }
  }, [open, projectId])

  const loadMembers = async () => {
    setLoading(true)
    try {
      const data = await apiService.getProjectMembers(projectId)
      setMembers(data)
    } catch (error) {
      console.error("Error loading members:", error)
      toast({
        title: "Error",
        description: "Failed to load project members",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMember.username.trim()) return

    setAddingMember(true)
    try {
      await apiService.addProjectMember(projectId, newMember)
      await loadMembers()
      setNewMember({ username: "", role: "TEAM_MEMBER" })
      toast({
        title: "Success",
        description: `${newMember.username} has been added to the project`,
      })
    } catch (error) {
      console.error("Error adding member:", error)
      toast({
        title: "Error",
        description: "Failed to add member. Please check if the username exists.",
        variant: "destructive",
      })
    } finally {
      setAddingMember(false)
    }
  }

  const handleUpdateRole = async (username: string, newRole: string) => {
    try {
      await apiService.updateMemberRole(projectId, username, newRole)
      await loadMembers()
      setEditingMember(null)
      toast({
        title: "Success",
        description: `${username}'s role has been updated`,
      })
    } catch (error) {
      console.error("Error updating role:", error)
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      })
    }
  }

  const handleRemoveMember = async (username: string) => {
    if (!confirm(`Are you sure you want to remove ${username} from the project?`)) return

    try {
      await apiService.removeMember(projectId, username)
      await loadMembers()
      toast({
        title: "Success",
        description: `${username} has been removed from the project`,
      })
    } catch (error) {
      console.error("Error removing member:", error)
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      })
    }
  }

  const getRoleInfo = (role: string) => {
    return ROLES.find((r) => r.value === role) || ROLES[3] // Default to TEAM_MEMBER
  }

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Project Members - {projectName}
          </DialogTitle>
          <DialogDescription>
            Manage project members and their roles
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Member Section */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Member
              </h3>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="Enter username"
                      value={newMember.username}
                      onChange={(e) => setNewMember((prev) => ({ ...prev, username: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={newMember.role}
                      onValueChange={(value) => setNewMember((prev) => ({ ...prev, role: value as any }))}
                    >
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.filter((role) => role.value !== "OWNER").map((role) => {
                          const Icon = role.icon
                          return (
                            <SelectItem key={role.value} value={role.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span>{role.label}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" disabled={addingMember || !newMember.username.trim()}>
                  {addingMember ? "Adding..." : "Add Member"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Separator />

          {/* Current Members Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Current Members ({members.length})</h3>
            <div className="space-y-3">
              {members.map((member) => {
                const roleInfo = getRoleInfo(member.role)
                const Icon = roleInfo.icon
                const isEditing = editingMember === member.username

                return (
                  <Card key={member.username} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {getInitials(member.username)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{member.username}</h4>
                              {member.role === "OWNER" && <Crown className="h-4 w-4 text-yellow-500" />}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="h-3 w-3" />
                              <span>{member.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <Calendar className="h-3 w-3" />
                              <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <Select
                                defaultValue={member.role}
                                onValueChange={(value) => handleUpdateRole(member.username, value)}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ROLES.filter((role) => role.value !== "OWNER").map((role) => {
                                    const RoleIcon = role.icon
                                    return (
                                      <SelectItem key={role.value} value={role.value}>
                                        <div className="flex items-center gap-2">
                                          <RoleIcon className="h-4 w-4" />
                                          <span>{role.label}</span>
                                        </div>
                                      </SelectItem>
                                    )
                                  })}
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="sm" onClick={() => setEditingMember(null)}>
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Badge
                                className={`${roleInfo.color} cursor-pointer hover:opacity-80`}
                                onClick={() => member.role !== "OWNER" && setEditingMember(member.username)}
                              >
                                <Icon className="h-3 w-3 mr-1" />
                                {roleInfo.label}
                              </Badge>
                              {member.role !== "OWNER" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveMember(member.username)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <UserMinus className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {!isEditing && <div className="mt-2 text-xs text-gray-500">{roleInfo.description}</div>}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Role Legend */}
          <Card className="bg-gray-50">
            <CardContent className="pt-4">
              <h4 className="font-medium mb-3">Role Permissions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {ROLES.map((role) => {
                  const Icon = role.icon
                  return (
                    <div key={role.value} className="flex items-center gap-2">
                      <Badge className={`${role.color} text-xs`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {role.label}
                      </Badge>
                      <span className="text-gray-600">{role.description}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
