"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Package, PlusCircle, Edit, ListPlus, QrCode, LogOut } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useEffect, useState } from "react"
import { logoutFeeder } from "@/lib/feeder-auth"
import { useRouter } from "next/navigation"

export function FeederSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

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

  const handleLogout = () => {
    logoutFeeder()
    router.push("/login")
  }

  const routes = [
    {
      name: "Dashboard",
      href: "/products",
      icon: Home,
    },
    {
      name: "All Products",
      href: "/products",
      icon: Package,
    },
    {
      name: "Add Product",
      href: "/add-product",
      icon: PlusCircle,
    },
    {
      name: "Edit Products",
      href: "/edit-products",
      icon: Edit,
    },
    {
      name: "Bulk Edit",
      href: "/bulk-edit",
      icon: ListPlus,
    },
    {
      name: "QR Codes",
      href: "/all-qr",
      icon: QrCode,
    },
  ]

  // For mobile, create a toggle sidebar function
  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  // If on mobile and sidebar is closed, show only a hamburger icon
  if (isMobile && !isOpen) {
    return (
      <div
        className="fixed top-4 left-4 z-50 p-3 bg-[#194a95] rounded-full shadow-lg cursor-pointer"
        onClick={toggleSidebar}
      >
        <div className="w-5 h-0.5 bg-white mb-1"></div>
        <div className="w-5 h-0.5 bg-white mb-1"></div>
        <div className="w-5 h-0.5 bg-white"></div>
      </div>
    )
  }

  return (
    <div
      className={`fixed top-0 left-0 h-screen ${isMobile ? "w-64" : "w-16"} flex flex-col bg-[#194a95] text-white shadow-lg z-40 transition-all duration-300`}
    >
      {isMobile && (
        <div className="flex justify-between items-center p-4">
          <span className="text-xl font-bold">Evershine</span>
          <button onClick={toggleSidebar} className="text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className={`sidebar-icon mt-4 ${isMobile ? "mx-auto" : ""}`}>
        <span className="text-xl font-bold">F</span>
      </div>

      <hr className="sidebar-hr my-2 border-t border-white/20 mx-2" />

      <TooltipProvider>
        {routes.map((route) => (
          <Tooltip key={route.href}>
            <TooltipTrigger asChild>
              <Link
                href={route.href}
                className={cn(
                  isMobile ? "flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors" : "sidebar-icon",
                  pathname === route.href || pathname.startsWith(route.href + "/")
                    ? isMobile
                      ? "bg-white/20"
                      : "bg-white/20"
                    : "",
                )}
              >
                <route.icon size={24} />
                {isMobile && <span>{route.name}</span>}
                {!isMobile && <span className="sidebar-tooltip">{route.name}</span>}
              </Link>
            </TooltipTrigger>
            {!isMobile && <TooltipContent side="right">{route.name}</TooltipContent>}
          </Tooltip>
        ))}
      </TooltipProvider>

      <div className="mt-auto mb-4">
        <hr className="sidebar-hr my-2 border-t border-white/20 mx-2" />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className={cn(
                  isMobile
                    ? "flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors w-full"
                    : "sidebar-icon",
                )}
              >
                <LogOut size={24} />
                {isMobile && <span>Logout</span>}
                {!isMobile && <span className="sidebar-tooltip">Logout</span>}
              </button>
            </TooltipTrigger>
            {!isMobile && <TooltipContent side="right">Logout</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
