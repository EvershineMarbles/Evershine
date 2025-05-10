"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Download, Loader2, RefreshCw, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProductVisualizerProps {
  productImage: string
  productName: string
}

const MOCKUPS = [
  {
    id: "bathroom",
    name: "Bathroom",
    src: "/assets/mockups/bathroom-mockup.png",
    targetAreas: [
      {
        name: "wall",
        x: 0,
        y: 0,
        width: 1000,
        height: 600,
        opacity: 0.85,
        blendMode: "multiply",
      },
      {
        name: "floor",
        x: 0,
        y: 600,
        width: 1000,
        height: 400,
        opacity: 0.7,
        blendMode: "overlay",
      },
    ],
  },
  {
    id: "living-room",
    name: "Living Room",
    src: "/assets/mockups/living-room-mockup.jpeg",
    targetAreas: [
      {
        name: "floor",
        x: 0,
        y: 700,
        width: 1000,
        height: 300,
        opacity: 0.8,
        blendMode: "overlay",
      },
      {
        name: "wall",
        x: 0,
        y: 0,
        width: 1000,
        height: 700,
        opacity: 0.3,
        blendMode: "overlay",
      },
    ],
  },
]

export default function ProductVisualizer({ productImage, productName }: ProductVisualizerProps) {
  const [activeTab, setActiveTab] = useState<string>(MOCKUPS[0].id)
  const [useFallback, setUseFallback] = useState(false)
  const [visualizations, setVisualizations] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [selectedArea, setSelectedArea] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Initialize loading and selected areas
  useEffect(() => {
    const initialLoading: Record<string, boolean> = {}
    const initialSelectedArea: Record<string, string> = {}

    MOCKUPS.forEach((mockup) => {
      initialLoading[mockup.id] = true
      initialSelectedArea[mockup.id] = mockup.targetAreas[0].name
    })

    setLoading(initialLoading)
    setSelectedArea(initialSelectedArea)
  }, [])

  // Generate visualizations when component mounts or product image changes
  useEffect(() => {
    if (productImage && !useFallback) {
      MOCKUPS.forEach((mockup) => {
        generateVisualization(mockup.id, selectedArea[mockup.id])
      })
    }
  }, [productImage, useFallback])

  const generateVisualization = async (mockupId: string, areaName: string) => {
    try {
      setLoading((prev) => ({ ...prev, [mockupId]: true }))
      setError(null)

      const mockup = MOCKUPS.find((m) => m.id === mockupId)
      if (!mockup) return

      const targetArea = mockup.targetAreas.find((area) => area.name === areaName)
      if (!targetArea) return

      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d", { willReadFrequently: true })
      if (!ctx) return

      // Set canvas dimensions
      canvas.width = 1000
      canvas.height = 1000

      // Load the mockup image
      const mockupImage = document.createElement("img")
      mockupImage.crossOrigin = "anonymous"

      // Load the product texture
      const textureImage = document.createElement("img")
      textureImage.crossOrigin = "anonymous"

      // Create a promise to handle image loading
      const loadImages = new Promise<void>((resolve, reject) => {
        let loadedCount = 0
        const totalImages = 2

        const checkAllLoaded = () => {
          loadedCount++
          if (loadedCount === totalImages) resolve()
        }

        mockupImage.onload = checkAllLoaded
        textureImage.onload = checkAllLoaded

        mockupImage.onerror = (e) => {
          console.error("Error loading mockup image:", e)
          reject(new Error("Failed to load mockup image"))
        }

        textureImage.onerror = (e) => {
          console.error("Error loading texture image:", e)
          reject(new Error("Failed to load product texture"))
        }

        // Use local paths for mockups
        mockupImage.src = mockup.src

        // For product image, try direct loading first
        // If this fails due to CORS, the error handler will catch it
        textureImage.src = productImage
      })

      try {
        await loadImages

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Draw the mockup image
        ctx.drawImage(mockupImage, 0, 0, canvas.width, canvas.height)

        // Create a pattern from the texture
        const pattern = ctx.createPattern(textureImage, "repeat")
        if (!pattern) throw new Error("Failed to create pattern")

        // Save the current state
        ctx.save()

        // Apply the texture to the target area
        ctx.globalAlpha = targetArea.opacity
        ctx.globalCompositeOperation = targetArea.blendMode as GlobalCompositeOperation

        ctx.fillStyle = pattern
        ctx.fillRect(targetArea.x, targetArea.y, targetArea.width, targetArea.height)

        // Restore the canvas state
        ctx.restore()

        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9)

        // Update visualizations state
        setVisualizations((prev) => ({
          ...prev,
          [mockupId]: dataUrl,
        }))
      } catch (error) {
        console.error("Canvas operation failed:", error)
        throw error
      }
    } catch (error) {
      console.error("Error generating visualization:", error)
      setError(error instanceof Error ? error.message : "Failed to generate visualization")

      // If we've tried and failed, switch to fallback mode
      if (!useFallback) {
        setUseFallback(true)
      }
    } finally {
      setLoading((prev) => ({ ...prev, [mockupId]: false }))
    }
  }

  const handleAreaChange = (mockupId: string, areaName: string) => {
    setSelectedArea((prev) => ({ ...prev, [mockupId]: areaName }))
    if (!useFallback) {
      generateVisualization(mockupId, areaName)
    }
  }

  const handleDownload = (mockupId: string) => {
    // If we're in fallback mode, just download the mockup image
    if (useFallback) {
      const mockup = MOCKUPS.find((m) => m.id === mockupId)
      if (!mockup) return

      const link = document.createElement("a")
      link.href = mockup.src
      link.download = `${productName.replace(/\s+/g, "-").toLowerCase()}-${mockupId}-visualization.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return
    }

    // Otherwise download the generated visualization
    const dataUrl = visualizations[mockupId]
    if (!dataUrl) return

    const link = document.createElement("a")
    link.href = dataUrl
    link.download = `${productName.replace(/\s+/g, "-").toLowerCase()}-${mockupId}-visualization.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleRegenerateAll = () => {
    if (useFallback) {
      setUseFallback(false)
    } else {
      MOCKUPS.forEach((mockup) => {
        generateVisualization(mockup.id, selectedArea[mockup.id])
      })
    }
  }

  return (
    <div className="w-full">
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Product Visualizer</h2>
        <Button onClick={handleRegenerateAll} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          {useFallback ? "Try Advanced Mode" : "Regenerate All"}
        </Button>
      </div>

      {useFallback && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-2">
          <Info className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-700">
              Using simplified visualization mode due to image loading issues. For a custom visualization with your
              product, please contact our team or try a different product image.
            </p>
          </div>
        </div>
      )}

      {/* Custom Tabs Implementation */}
      <div className="w-full">
        {/* Tab Headers */}
        <div className="flex border-b mb-6">
          {MOCKUPS.map((mockup) => (
            <button
              key={mockup.id}
              onClick={() => setActiveTab(mockup.id)}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === mockup.id
                  ? "border-b-2 border-[#194a95] text-[#194a95]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {mockup.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {MOCKUPS.map((mockup) => (
          <div key={mockup.id} className={activeTab === mockup.id ? "block" : "hidden"}>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex flex-wrap gap-3 mb-4">
                {mockup.targetAreas.map((area) => (
                  <Button
                    key={area.name}
                    variant={selectedArea[mockup.id] === area.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAreaChange(mockup.id, area.name)}
                    className="capitalize"
                    disabled={useFallback}
                  >
                    {area.name}
                  </Button>
                ))}
              </div>

              <div className="relative rounded-lg overflow-hidden bg-white border">
                {loading[mockup.id] && !useFallback ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-[#194a95]" />
                  </div>
                ) : useFallback || !visualizations[mockup.id] ? (
                  // Fallback mode - just show the mockup
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={mockup.src || "/placeholder.svg"}
                      alt={`${productName} in ${mockup.name}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  // Advanced mode with visualization
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={visualizations[mockup.id] || "/placeholder.svg"}
                      alt={`${productName} in ${mockup.name}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => handleDownload(mockup.id)}
                  disabled={loading[mockup.id] && !useFallback}
                  className="bg-[#194a95] hover:bg-[#0f3a7a]"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
