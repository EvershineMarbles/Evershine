"use client"

import type React from "react"

import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, Loader2, Search, Home, Check } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import QRCode from "qrcode"
import { toast } from "sonner"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface Product {
  _id: string
  name: string
  price: number
  image: string[]
  postId: string
  status?: "draft" | "pending" | "approved"
  category?: string
  thickness?: string
  size?: string
}

export default function ProductQRList() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [generatingQR, setGeneratingQR] = useState<Record<string, boolean>>({})
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string | null>(null)
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null)
  const [priceValues, setPriceValues] = useState<Record<string, string>>({})
  const [updatingPrice, setUpdatingPrice] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/api/getAllProducts`)
      if (response.data.success) {
        const productsData = response.data.data
        setProducts(productsData)

        // Initialize price values for all products
        const initialPriceValues: Record<string, string> = {}
        productsData.forEach((product: Product) => {
          initialPriceValues[product.postId] = product.price.toString()
        })
        setPriceValues(initialPriceValues)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((product) => {
    return product.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Helper function to capitalize each word in a string
  const capitalizeWords = (str: string): string => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  const generateQRCode = async (product: Product): Promise<string> => {
    try {
      // Generate QR code for the product URL
      const productUrl = `${window.location.origin}/product/${product.postId}`
      const qrCodeDataUrl = await QRCode.toDataURL(productUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })

      // Create a canvas element
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Could not get canvas context")

      // Set canvas dimensions
      canvas.width = 600
      canvas.height = 900

      // Load the template image
      const templateImage = document.createElement("img")
      templateImage.crossOrigin = "anonymous"

      return new Promise((resolve, reject) => {
        templateImage.onload = () => {
          // Draw the template image on the canvas
          ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height)

          // Load and draw the QR code
          const qrCode = document.createElement("img")
          qrCode.crossOrigin = "anonymous"

          qrCode.onload = () => {
            // Draw QR code in the white space - keep the exact same position
            ctx.drawImage(qrCode, 380, 620, 150, 150)

            // Add product name below the QR code
            // Adjust font size based on name length
            const capitalizedName = capitalizeWords(product.name)
            const fontSize = capitalizedName.length > 20 ? 14 : 16
            ctx.font = `bold ${fontSize}px Arial`
            ctx.fillStyle = "#000000"
            ctx.textAlign = "center"

            // Position the text below the QR code in the white area
            const qrCodeCenterX = 380 + 75 // QR code X position + half width
            const maxWidth = 150 // Same width as QR code

            // Improved text wrapping for long names
            const words = capitalizedName.split(" ")
            const lines = []
            let currentLine = ""

            // Create lines that fit within maxWidth
            for (let i = 0; i < words.length; i++) {
              const testLine = currentLine + (currentLine ? " " : "") + words[i]
              const metrics = ctx.measureText(testLine)
              const testWidth = metrics.width

              if (testWidth > maxWidth && i > 0) {
                lines.push(currentLine)
                currentLine = words[i]
              } else {
                currentLine = testLine
              }
            }

            if (currentLine) {
              lines.push(currentLine)
            }

            // Limit to maximum 3 lines and add ellipsis if needed
            if (lines.length > 3) {
              lines.splice(3)
              const lastLine = lines[2]
              lines[2] = lastLine.substring(0, lastLine.length - 3) + "..."
            }

            // Calculate vertical position based on number of lines
            const lineHeight = fontSize + 4
            const totalTextHeight = lines.length * lineHeight

            // Keep text in the same vertical area, just adjust spacing between lines
            const startY = 790 - ((lines.length - 1) * lineHeight) / 2

            // Draw each line
            lines.forEach((line, index) => {
              const y = startY + index * lineHeight
              ctx.fillText(line, qrCodeCenterX, y)
            })

            // Convert canvas to data URL
            const dataUrl = canvas.toDataURL("image/png")
            resolve(dataUrl)
          }

          qrCode.onerror = reject
          qrCode.src = qrCodeDataUrl
        }

        templateImage.onerror = reject
        templateImage.src = "/assets/qr-template.png"
      })
    } catch (error) {
      console.error("Error generating QR code:", error)
      throw error
    }
  }

  const handleDownloadQR = async (product: Product) => {
    try {
      setGeneratingQR((prev) => ({ ...prev, [product.postId]: true }))
      const qrCodeUrl = await generateQRCode(product)
      downloadQR(qrCodeUrl, `evershine-product-${product.postId}.png`)
    } catch (error) {
      console.error("Error downloading QR code:", error)
    } finally {
      setGeneratingQR((prev) => ({ ...prev, [product.postId]: false }))
    }
  }

  const downloadQR = (dataUrl: string, filename: string) => {
    const link = document.createElement("a")
    link.href = dataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePreviewQR = async (product: Product) => {
    try {
      setPreviewProduct(product)
      setQrPreviewUrl(null) // Clear previous preview
      const qrCodeUrl = await generateQRCode(product)
      setQrPreviewUrl(qrCodeUrl)
    } catch (error) {
      console.error("Error generating QR preview:", error)
    }
  }

  const closePreview = () => {
    setQrPreviewUrl(null)
    setPreviewProduct(null)
  }

  const handlePriceChange = (productId: string, value: string) => {
    setPriceValues((prev) => ({
      ...prev,
      [productId]: value,
    }))
  }

  const updatePrice = async (productId: string) => {
    try {
      const newPrice = priceValues[productId]

      if (!newPrice || isNaN(Number(newPrice)) || Number(newPrice) <= 0) {
        toast.error("Please enter a valid price")
        return
      }

      setUpdatingPrice((prev) => ({ ...prev, [productId]: true }))

      // Using the correct endpoint for updating product price
      const response = await axios.post(`${API_URL}/api/updateProduct/${productId}`, {
        price: Number(newPrice),
      })

      if (response.data.success) {
        // Update the local state
        setProducts(
          products.map((product) => (product.postId === productId ? { ...product, price: Number(newPrice) } : product)),
        )

        toast.success("Price updated successfully")
      } else {
        toast.error(response.data.msg || "Failed to update price")
      }
    } catch (error) {
      console.error("Error updating price:", error)
      toast.error("Failed to update price. Please try again.")
    } finally {
      setUpdatingPrice((prev) => ({ ...prev, [productId]: false }))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, productId: string) => {
    if (e.key === "Enter") {
      updatePrice(productId)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-[#194a95]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Dashboard Header Strip */}
      <div className="w-full bg-[rgb(25,74,149)] py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-white text-xl font-medium">Evershine Dashboard</h1>
          <button
            onClick={() => router.push("https://evershine-two.vercel.app/")}
            className="flex items-center text-white hover:text-gray-200 transition-colors"
          >
            <Home className="h-5 w-5" />
            <span className="ml-2">Home</span>
          </button>
        </div>
      </div>

      {/* Back Button Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        {/* Header with Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-4xl font-bold text-[#181818]">Product QR Codes</h1>
          <div className="relative w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search Product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 w-full md:w-[300px] rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#194a95] focus:border-transparent [&::placeholder]:text-black"
              />
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Link href={`/product/${product.postId}`} className="h-10 w-10 flex-shrink-0 mr-3 block">
                        <Image
                          src={product.image[0] || "/placeholder.svg"}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="rounded-md object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg"
                          }}
                        />
                      </Link>
                      <div className="ml-2">
                        <Link
                          href={`/product/${product.postId}`}
                          className="text-sm font-medium text-gray-900 hover:text-[#194a95] transition-colors cursor-pointer"
                        >
                          {product.name}
                        </Link>
                        <div className="text-xs text-gray-500">ID: {product.postId.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        <input
                          type="number"
                          value={priceValues[product.postId] || ""}
                          onChange={(e) => handlePriceChange(product.postId, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, product.postId)}
                          className="pl-6 pr-2 py-1 w-24 border rounded focus:outline-none focus:ring-2 focus:ring-[#194a95]"
                          min="1"
                          step="any"
                        />
                      </div>
                      <button
                        onClick={() => updatePrice(product.postId)}
                        disabled={updatingPrice[product.postId]}
                        className="p-1 text-green-600 hover:text-green-800"
                      >
                        {updatingPrice[product.postId] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                      <span className="text-xs text-gray-500">/per sqft</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        onClick={() => handlePreviewQR(product)}
                        variant="outline"
                        size="sm"
                        className="text-[#194a95] border-[#194a95]"
                      >
                        Preview
                      </Button>
                      <Button
                        onClick={() => handleDownloadQR(product)}
                        size="sm"
                        disabled={!!generatingQR[product.postId]}
                        className="bg-[#194a95] hover:bg-[#0f3a7a]"
                      >
                        {generatingQR[product.postId] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-1" /> Download QR
                          </>
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        )}
      </div>

      {/* QR Code Preview Modal */}
      {qrPreviewUrl && previewProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">QR Code Preview</h3>
              <button onClick={closePreview} className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col items-center">
              <Image
                src={qrPreviewUrl || "/placeholder.svg"}
                alt={`QR Code for ${previewProduct.name}`}
                width={300}
                height={450}
                className="object-contain mb-4"
              />
              <div className="text-center mb-4">
                <h4 className="font-medium">{previewProduct.name}</h4>
                <p className="text-sm text-gray-500">₹{previewProduct.price}/per sqft</p>
              </div>
              <Button onClick={() => handleDownloadQR(previewProduct)} className="bg-[#194a95] hover:bg-[#0f3a7a]">
                <Download className="h-4 w-4 mr-1" /> Download QR
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
