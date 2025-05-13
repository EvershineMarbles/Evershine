"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Package, PlusCircle, Edit, ListPlus, QrCode, LogOut } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import { logoutFeeder } from "@/lib/feeder-auth"

export function FeederSidebar() {
  const pathname = usePathname()
  const router = useRouter()

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
      name: "Bulk Edit",
      href: "/all-qr",
      icon: Edit,
    },
  ]
 
    return (
      <div className="fixed top-0 left-0 h-screen w-16 flex flex-col bg-black text-white shadow-lg">
        {/* No blue strip in sidebar - it will be in the layout */}
        <div className="sidebar-icon mt-4">
          <span className="text-xl font-bold">F</span>
        </div>
  
        <hr className="sidebar-hr my-2" />
  
        <TooltipProvider>
          {routes.map((route) => (
            <Tooltip key={route.href}>
              <TooltipTrigger asChild>
                <Link
                  href={route.href}
                  className={cn(
                    "sidebar-icon",
                    pathname === route.href || pathname.startsWith(route.href + "/") ? "bg-[#194a95]" : "",
                  )}
                >
                  <route.icon size={24} />
                  <span className="sidebar-tooltip">{route.name}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{route.name}</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
  
        <div className="mt-auto mb-4">
          <hr className="sidebar-hr my-2" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={handleLogout} className="sidebar-icon">
                  <LogOut size={24} />
                  <span className="sidebar-tooltip">Logout</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    )
  }
  