"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import ProductForm from "@/app/components/ProductForm"
import { Loader2, LogOut, Home } from "lucide-react"
import ProtectedRoute from "@/components/ProtectedRoute"
import { logoutFeeder } from "@/lib/feeder-auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface Product {
  _id: string
  name: string
  category: string
  price: string
  quantityAvailable: string
  applicationAreas: string
  description?: string
  image: string[]
  postId: string
  status?: "draft" | "pending" | "approved"
}

function EditProduct() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feederName, setFeederName] = useState<string>("")

  useEffect(() => {
    // Get feeder name from localStorage
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("feederName")
      setFeederName(name || "Feeder")
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const handleLogout = () => {
    logoutFeeder()
    router.push("/login")
  }

  const fetchProduct = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(`${API_URL}/api/getPostDataById?id=${params.id}`)

      if (response.data.success && response.data.data?.[0]) {
        // Transform numeric values to strings for the form
        const productData = response.data.data[0]
        setProduct({
          ...productData,
          price: productData.price.toString(),
          quantityAvailable: productData.quantityAvailable.toString(),
        })
      } else {
        setError("Failed to fetch product details")
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch product")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#194a95]" />
        <p className="mt-4 text-gray-600">Loading product details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="max-w-md mx-auto text-center px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Product</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => router.back()} className="text-[#194a95] hover:text-[#0f3a7a] font-medium">
            ← Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="max-w-md mx-auto text-center px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => router.back()} className="text-[#194a95] hover:text-[#0f3a7a] font-medium">
            ← Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
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
      <ProductForm mode="edit" initialData={product} />
    </div>
  )
}

export default function ProtectedEditProductPage() {
  return (
    <ProtectedRoute>
      <EditProduct />
    </ProtectedRoute>
  )
}
