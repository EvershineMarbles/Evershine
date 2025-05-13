"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isFeederAuthenticated } from "@/lib/feeder-auth"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if the user is authenticated
    const authenticated = isFeederAuthenticated()
    setIsAuthenticated(authenticated)

    if (!authenticated) {
      // Redirect to login page if not authenticated
      router.push("/login")
    } else {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#194a95]" />
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // Only render children if authenticated
  return isAuthenticated ? <>{children}</> : null
}
