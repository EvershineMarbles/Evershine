"use client"

import type React from "react"
import { FeederSidebar } from "@/components/FeederSidebar"

interface FeederLayoutProps {
  children: React.ReactNode
}

export default function FeederLayout({ children }: FeederLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Black strip on top */}
      <div className="h-6 w-full bg-black sticky top-0 z-20"></div>

      {/* Blue strip below black strip */}
      <div className="h-6 w-full bg-[#194a95] sticky top-6 z-10"></div>

      <div className="flex flex-1">
        <FeederSidebar />
        <div className="content-with-sidebar flex-1">{children}</div>
      </div>
    </div>
  )
}
