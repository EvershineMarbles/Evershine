"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { FeederSidebar } from "@/components/FeederSidebar"

interface FeederLayoutProps {
  children: React.ReactNode
}

export default function FeederLayout({ children }: FeederLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    // Initial check
    checkScreenSize()

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize)

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  return (
    <div className="min-h-screen bg-white flex">
      <FeederSidebar />
      <div
        className={`${isMobile && isSidebarOpen ? "content-with-sidebar-mobile-open" : "content-with-sidebar"} flex-1`}
      >
        {children}
      </div>
    </div>
  )
}
