"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface Product {
  _id: string
  name: string
  price: number
  category: string
  applicationAreas: string
  description: string
  image: string[]
  postId: string
  quantityAvailable: number
}

export default function ProductDetail() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedThumbnail, setSelectedThumbnail] = useState(0)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`http://localhost:8000/api/getPostDataById`, {
          params: { id: params.id }
        })

        if (response.data.success && response.data.data?.length > 0) {
          setProduct(response.data.data[0])
        } else {
          setError("No data found")
        }
      } catch (error: any) {
        console.error("Error fetching product:", error)
        setError(error.message || "Error fetching product")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index)
    setSelectedThumbnail(index)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#194a95]"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md p-6 text-center space-y-2">
          <h2 className="text-xl font-medium text-gray-900">No data found</h2>
          <p className="text-sm text-gray-500">Product ID: {params.id}</p>
          <Button 
            onClick={() => router.push("/")}
            className="mt-4 bg-[#194a95]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Back Button */}
      <button 
        onClick={() => router.back()} 
        className="mb-6"
        aria-label="Go back"
      >
        <ArrowLeft className="h-8 w-8" />
      </button>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:gap-12">
          {/* Images Section - First on mobile, Right on desktop */}
          <div className="w-full md:w-1/2 md:order-2 mb-8 md:mb-0">
            {/* Main Image */}
            <div className="rounded-2xl overflow-hidden bg-gray-100 mb-4">
              <img
                src={product.image[currentImageIndex] || "/placeholder.svg"}
                alt={product.name}
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
            
            {/* Thumbnails */}
            {product.image.length > 1 && (
              <div className="grid grid-cols-2 gap-4">
                {product.image.slice(0, 2).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={`relative rounded-xl overflow-hidden aspect-[4/3] ${
                      selectedThumbnail === index ? "ring-2 ring-[#194a95]" : ""
                    }`}
                  >
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details - Second on mobile, Left on desktop */}
          <div className="w-full md:w-1/2 md:order-1">
            {/* Product Name */}
            <div className="mb-6">
              <p className="text-gray-500">Product Name</p>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <div className="h-px bg-gray-200 w-full mt-4"></div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex justify-between items-baseline">
                <p className="text-gray-500">Price (per sqft)</p>
                <p className="text-xl font-bold">₹{product.price}/per sqft</p>
              </div>
              <div className="h-px bg-gray-200 w-full mt-4"></div>
            </div>

            {/* Category */}
            <div className="mb-6">
              <div className="flex justify-between items-baseline">
                <p className="text-gray-500">Product Category</p>
                <p className="text-xl font-bold">{product.category}</p>
              </div>
              <div className="h-px bg-gray-200 w-full mt-4"></div>
            </div>

            {/* Quality Available */}
            <div className="mb-6">
              <div className="flex justify-between items-baseline">
                <p className="text-gray-500">Quality Available (in sqft)</p>
                <p className="text-xl font-bold">{product.quantityAvailable}</p>
              </div>
              <div className="h-px bg-gray-200 w-full mt-4"></div>
            </div>

            {/* Application Areas */}
            <div className="mb-6">
              <div className="flex justify-between items-baseline">
                <p className="text-gray-500">Application Areas</p>
                <p className="text-xl font-bold">{product.applicationAreas}</p>
              </div>
              <div className="h-px bg-gray-200 w-full mt-4"></div>
            </div>

            {/* About Product */}
            <div className="mb-6">
              <div className="flex justify-between items-baseline">
                <p className="text-gray-500">About Product</p>
                <p className="text-xl font-bold">{product.description || "Product mainly used for countertop"}</p>
              </div>
              <div className="h-px bg-gray-200 w-full mt-4"></div>
            </div>

            {/* Edit Button */}
            <Button 
              onClick={() => router.push(`/edit-product/${product.postId}`)}
              className="w-full md:w-auto px-12 py-3 bg-[#194a95] hover:bg-[#0f3a7a] text-white rounded-md"
            >
              Edit
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}