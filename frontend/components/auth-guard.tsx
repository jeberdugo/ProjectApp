"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

const publicRoutes = ["/login", "/register"]

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated && !publicRoutes.includes(pathname)) {
        router.push("/login")
      } else if (isAuthenticated && publicRoutes.includes(pathname)) {
        router.push("/dashboard")
      }
    }
  }, [isAuthenticated, loading, pathname, router])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" data-testid="loading-spinner"></div>
      </div>
    )
  }

  // Only render children if authenticated OR on a public route
  if (isAuthenticated || publicRoutes.includes(pathname)) {
    return <>{children}</>
  }

  // Don't render anything for unauthenticated users on protected routes
  return null
}
