"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Download, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  const [visualizations, setVisualizations] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [selectedArea, setSelectedArea] = useState<Record<string, string>>({})
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
    if (productImage) {
      MOCKUPS.forEach((mockup) => {
        generateVisualization(mockup.id, selectedArea[mockup.id])
      })
    }
  }, [productImage])

  const generateVisualization = async (mockupId: string, areaName: string) => {
    try {
      setLoading((prev) => ({ ...prev, [mockupId]: true }))

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
      const mockupImage = new Image()
      mockupImage.crossOrigin = "anonymous"

      // Load the product texture
      const textureImage = new Image()
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
        mockupImage.onerror = reject
        textureImage.onerror = reject

        mockupImage.src = mockup.src
        textureImage.src = productImage
      })

      await loadImages

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw the mockup image
      ctx.drawImage(mockupImage, 0, 0, canvas.width, canvas.height)

      // Create a pattern from the texture
      const pattern = ctx.createPattern(textureImage, "repeat")
      if (!pattern) return

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
      console.error("Error generating visualization:", error)
    } finally {
      setLoading((prev) => ({ ...prev, [mockupId]: false }))
    }
  }

  const handleAreaChange = (mockupId: string, areaName: string) => {
    setSelectedArea((prev) => ({ ...prev, [mockupId]: areaName }))
    generateVisualization(mockupId, areaName)
  }

  const handleDownload = (mockupId: string) => {
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
    MOCKUPS.forEach((mockup) => {
      generateVisualization(mockup.id, selectedArea[mockup.id])
    })
  }

  return (
    <div className="w-full">
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Product Visualizer</h2>
        <Button onClick={handleRegenerateAll} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Regenerate All
        </Button>
      </div>

      <Tabs defaultValue={MOCKUPS[0].id} className="w-full">
        <TabsList className="grid grid-cols-2 w-full mb-6">
          {MOCKUPS.map((mockup) => (
            <TabsTrigger key={mockup.id} value={mockup.id}>
              {mockup.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {MOCKUPS.map((mockup) => (
          <TabsContent key={mockup.id} value={mockup.id} className="mt-0">
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex flex-wrap gap-3 mb-4">
                {mockup.targetAreas.map((area) => (
                  <Button
                    key={area.name}
                    variant={selectedArea[mockup.id] === area.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAreaChange(mockup.id, area.name)}
                    className="capitalize"
                  >
                    {area.name}
                  </Button>
                ))}
              </div>

              <div className="relative rounded-lg overflow-hidden bg-white border">
                {loading[mockup.id] ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-[#194a95]" />
                  </div>
                ) : visualizations[mockup.id] ? (
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={visualizations[mockup.id] || "/placeholder.svg"}
                      alt={`${productName} in ${mockup.name}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[400px]">
                    <p>Failed to generate visualization</p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => handleDownload(mockup.id)}
                  disabled={!visualizations[mockup.id] || loading[mockup.id]}
                  className="bg-[#194a95] hover:bg-[#0f3a7a]"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
