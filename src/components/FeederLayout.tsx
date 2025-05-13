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
      <div className="content-with-sidebar flex-1 flex flex-col">
        {/* Blue top strip for the content area */}
        <div className="h-10 w-full bg-[#194a95] sticky top-0 z-10"></div>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}
