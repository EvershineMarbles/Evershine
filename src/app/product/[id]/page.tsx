"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import axios, { AxiosError } from "axios"
import { ArrowLeft } from 'lucide-react'
import Image from "next/image"
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

interface ApiResponse {
  success: boolean
  data?: Product[]
  msg?: string
}

export default function ProductDetail() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedThumbnail, setSelectedThumbnail] = useState(0)
  const [imageLoadError, setImageLoadError] = useState<boolean[]>([])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError("")

        if (!params.id) {
          throw new Error("Product ID is missing")
        }

        const response = await axios.get<ApiResponse>(`http://localhost:8000/api/getPostDataById`, {
          params: { id: params.id }
        })

        if (response.data.success && response.data.data?.[0]) {
          setProduct(response.data.data[0])
          // Initialize image load error array
          setImageLoadError(new Array(response.data.data[0].image.length).fill(false))
        } else {
          throw new Error(response.data.msg || "No data found")
        }
      } catch (error) {
        let errorMessage = "Error fetching product"
        
        if (error instanceof AxiosError) {
          errorMessage = error.response?.data?.msg || error.message
        } else if (error instanceof Error) {
          errorMessage = error.message
        }
        
        console.error("Error fetching product:", error)
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index)
    setSelectedThumbnail(index)
  }

  const handleImageError = (index: number) => {
    setImageLoadError(prev => {
      const newErrors = [...prev]
      newErrors[index] = true
      return newErrors
    })
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
          <h2 className="text-xl font-medium text-gray-900">
            {error || "No data found"}
          </h2>
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
        className="mb-6 hover:bg-gray-100 p-2 rounded-full transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:gap-12">
          {/* Images Section */}
          <div className="w-full md:w-1/2 md:order-2 mb-8 md:mb-0">
            {/* Main Image */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 mb-4">
              <div className="aspect-[4/3] relative">
                <Image
                  src={imageLoadError[currentImageIndex] ? "/placeholder.svg" : (product.image[currentImageIndex] || "/placeholder.svg")}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onError={() => handleImageError(currentImageIndex)}
                  priority
                />
              </div>
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
                    <Image
                      src={imageLoadError[index] ? "/placeholder.svg" : (img || "/placeholder.svg")}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      onError={() => handleImageError(index)}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="w-full md:w-1/2 md:order-1 space-y-6">
            {/* Product Info Sections */}
            {[
              { label: "Product Name", value: product.name, isTitle: true },
              { label: "Price (per sqft)", value: `₹${product.price}/per sqft` },
              { label: "Product Category", value: product.category },
              { label: "Quality Available (in sqft)", value: product.quantityAvailable },
              { label: "Application Areas", value: product.applicationAreas },
              { label: "About Product", value: product.description || "Product mainly used for countertop" }
            ].map((item, index) => (
              <div key={index} className="pb-4 border-b border-gray-200">
                <p className="text-gray-500">{item.label}</p>
                {item.isTitle ? (
                  <h1 className="text-3xl font-bold mt-1">{item.value}</h1>
                ) : (
                  <p className="text-xl font-bold mt-1">{item.value}</p>
                )}
              </div>
            ))}

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