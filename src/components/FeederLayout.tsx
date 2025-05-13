"use client"

import type React from "react"
import { FeederSidebar } from "@/components/FeederSidebar"

interface FeederLayoutProps {
  children: React.ReactNode
}

export default function FeederLayout({ children }: FeederLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex">
      <FeederSidebar />
      <div className="content-with-sidebar flex-1">{children}</div>
    </div>
  )
}
