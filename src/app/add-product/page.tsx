"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Home } from "lucide-react"
import ProductForm from "@/app/components/ProductForm"
import ProtectedRoute from "@/components/ProtectedRoute"
import { logoutFeeder } from "@/lib/feeder-auth"

function AddProduct() {
  const router = useRouter()
  const [feederName, setFeederName] = useState<string>("")

  useEffect(() => {
    // Get feeder name from localStorage
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("feederName")
      setFeederName(name || "Feeder")
    }
  }, [])

  const handleLogout = () => {
    logoutFeeder()
    router.push("/login")
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Dashboard Header Strip */}
      <div className="w-full bg-[rgb(25,74,149)] py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-white text-xl font-medium">Evershine Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-white">Welcome, {feederName}</span>
            <button
              onClick={() => router.push("/products")}
              className="flex items-center text-white hover:text-gray-200 transition-colors mr-4"
            >
              <Home className="h-5 w-5 mr-1" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center text-white hover:text-gray-200 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-1" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
      <ProductForm />
    </main>
  )
}

export default function ProtectedAddProductPage() {
  return (
    <ProtectedRoute>
      <AddProduct />
    </ProtectedRoute>
  )
}
