"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, Loader2, Search } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import QRCode from "qrcode"

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

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/api/getAllProducts`)
      if (response.data.success) {
        setProducts(response.data.data)
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
            // Draw QR code in the white space
            ctx.drawImage(qrCode, 380, 620, 150, 150)

            // Add product name below the QR code
            ctx.font = "bold 16px Arial"
            ctx.fillStyle = "#000000"
            ctx.textAlign = "center"

            // Position the text below the QR code
            const qrCodeCenterX = 380 + 75 // QR code X position + half width
            const textY = 790 // Position below the QR code

            // Capitalize the product name
            const capitalizedName = capitalizeWords(product.name)

            // Wrap text if needed
            const maxWidth = 150 // Same width as QR code
            const words = capitalizedName.split(" ")
            let line = ""
            let y = textY

            for (let i = 0; i < words.length; i++) {
              const testLine = line + words[i] + " "
              const metrics = ctx.measureText(testLine)
              const testWidth = metrics.width

              if (testWidth > maxWidth && i > 0) {
                ctx.fillText(line, qrCodeCenterX, y)
                line = words[i] + " "
                y += 20 // Line height
              } else {
                line = testLine
              }
            }
            ctx.fillText(line, qrCodeCenterX, y)

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

  const generateSimpleQRCode = async (productId: string): Promise<string> => {
    try {
      const productUrl = `${window.location.origin}/product/${productId}`
      return await QRCode.toDataURL(productUrl, {
        width: 300,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })
    } catch (error) {
      console.error("Error generating simple QR code:", error)
      throw error
    }
  }

  const handleDownloadQR = async (product: Product, type: "simple" | "branded") => {
    try {
      setGeneratingQR((prev) => ({ ...prev, [product.postId]: true }))

      let qrCodeUrl: string

      if (type === "simple") {
        qrCodeUrl = await generateSimpleQRCode(product.postId)
        downloadQR(qrCodeUrl, `evershine-qr-${product.postId}.png`)
      } else {
        qrCodeUrl = await generateQRCode(product)
        downloadQR(qrCodeUrl, `evershine-product-${product.postId}.png`)
      }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-[#194a95]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4 flex items-center">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold ml-4">Product QR Codes</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#194a95] focus:border-transparent"
            />
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
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Category
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
                      <div className="h-10 w-10 flex-shrink-0 mr-3">
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
                      </div>
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500">ID: {product.postId.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₹{product.price}/per sqft</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.category || "N/A"}</div>
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
                        onClick={() => handleDownloadQR(product, "simple")}
                        variant="outline"
                        size="sm"
                        disabled={!!generatingQR[product.postId]}
                        className="text-[#194a95] border-[#194a95]"
                      >
                        {generatingQR[product.postId] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-1" /> Simple QR
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleDownloadQR(product, "branded")}
                        size="sm"
                        disabled={!!generatingQR[product.postId]}
                        className="bg-[#194a95] hover:bg-[#0f3a7a]"
                      >
                        {generatingQR[product.postId] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-1" /> Branded QR
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
              <div className="flex space-x-3">
                <Button
                  onClick={() => handleDownloadQR(previewProduct, "simple")}
                  variant="outline"
                  className="text-[#194a95] border-[#194a95]"
                >
                  <Download className="h-4 w-4 mr-1" /> Simple QR
                </Button>
                <Button
                  onClick={() => handleDownloadQR(previewProduct, "branded")}
                  className="bg-[#194a95] hover:bg-[#0f3a7a]"
                >
                  <Download className="h-4 w-4 mr-1" /> Branded QR
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
