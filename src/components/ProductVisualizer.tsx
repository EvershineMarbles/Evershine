"use client"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface ProductVisualizerProps {
  productImage: string
  productName: string
}

// Define mockup rooms
const MOCKUPS = [
  {
    id: "bathroom",
    name: "Bathroom",
    src: "/assets/mockups/bathroom.png",
  },
  {
    id: "bedroom-green",
    name: "Bedroom",
    src: "/assets/mockups/bedroom-green.png",
  },
  {
    id: "living-room",
    name: "Living Room",
    src: "/assets/mockups/living-room.jpeg",
  },
  {
    id: "luxury-living",
    name: "Luxury Living",
    src: "/assets/mockups/luxury-living.png",
  },
  {
    id: "modern-bedroom",
    name: "Modern Bedroom",
    src: "/assets/mockups/modern-bedroom.png",
  },
  {
    id: "minimalist",
    name: "Minimalist",
    src: "/assets/mockups/minimalist.png",
  },
]

export default function ProductVisualizer({ productImage, productName }: ProductVisualizerProps) {
  const [activeTab, setActiveTab] = useState<string>(MOCKUPS[0].id)
  const [loading, setLoading] = useState(true)
  const [textureReady, setTextureReady] = useState(false)
  const bookmatchedTextureRef = useRef<string | null>(null)
  const mockupCanvasRef = useRef<HTMLCanvasElement>(null)
  const [mockupDimensions, setMockupDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 })

  // Create bookmatched texture as soon as component mounts
  useEffect(() => {
    createBookmatchedTexture(productImage)
  }, [productImage])

  // Set a timeout to simulate loading and ensure the DOM is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Create a bookmatched texture from the product image
  const createBookmatchedTexture = (imageUrl: string) => {
    // If we already created the texture, don't recreate it
    if (bookmatchedTextureRef.current) {
      setTextureReady(true)
      return
    }

    // Create an image element to load the texture
    const img = document.createElement("img")
    img.crossOrigin = "anonymous"

    img.onload = () => {
      // Create a canvas to manipulate the image
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        console.error("Could not get canvas context")
        return
      }

      // First, create a clean version of the image without any transparent areas
      const cleanCanvas = document.createElement("canvas")
      const cleanCtx = cleanCanvas.getContext("2d")

      if (!cleanCtx) {
        console.error("Could not get clean canvas context")
        return
      }

      // Set clean canvas to the image size
      cleanCanvas.width = img.width
      cleanCanvas.height = img.height

      // Fill with white background first to eliminate any transparency
      cleanCtx.fillStyle = "#FFFFFF"
      cleanCtx.fillRect(0, 0, cleanCanvas.width, cleanCanvas.height)

      // Draw the image on top of the white background
      cleanCtx.drawImage(img, 0, 0, img.width, img.height)

      // Get the clean image data
      const cleanImg = cleanCanvas

      // Set canvas size to 2x the image size to fit the bookmatched pattern
      const patternSize = Math.max(cleanImg.width, cleanImg.height) * 2
      canvas.width = patternSize
      canvas.height = patternSize

      // Draw the original image in the top-left quadrant
      ctx.drawImage(cleanImg, 0, 0, cleanImg.width, cleanImg.height)

      // Draw horizontally flipped image in top-right quadrant
      ctx.save()
      ctx.translate(cleanImg.width * 2, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(cleanImg, 0, 0, cleanImg.width, cleanImg.height)
      ctx.restore()

      // Draw vertically flipped image in bottom-left quadrant
      ctx.save()
      ctx.translate(0, cleanImg.height * 2)
      ctx.scale(1, -1)
      ctx.drawImage(cleanImg, 0, 0, cleanImg.width, cleanImg.height)
      ctx.restore()

      // Draw both horizontally and vertically flipped image in bottom-right quadrant
      ctx.save()
      ctx.translate(cleanImg.width * 2, cleanImg.height * 2)
      ctx.scale(-1, -1)
      ctx.drawImage(cleanImg, 0, 0, cleanImg.width, cleanImg.height)
      ctx.restore()

      // Store the bookmatched texture
      bookmatchedTextureRef.current = canvas.toDataURL("image/jpeg", 0.95)
      setTextureReady(true)
    }

    img.onerror = () => {
      console.error("Error loading product image for bookmatching")
      // Fallback to original image if there's an error
      bookmatchedTextureRef.current = imageUrl
      setTextureReady(true)
    }

    // Handle CORS issues by using a proxy if needed
    if (imageUrl.startsWith("http")) {
      // Use proxy for external images
      img.src = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`
    } else {
      // Use direct path for local images
      img.src = imageUrl
    }
  }

  // Load mockup image and prepare canvas when tab changes
  useEffect(() => {
    if (!textureReady || loading) return

    const mockup = MOCKUPS.find((m) => m.id === activeTab)
    if (!mockup) return

    const loadMockup = () => {
      const mockupImg = document.createElement("img")
      mockupImg.crossOrigin = "anonymous"

      mockupImg.onload = () => {
        setMockupDimensions({
          width: mockupImg.width,
          height: mockupImg.height,
        })

        // Draw on canvas in the next render cycle
        setTimeout(() => {
          renderVisualization(mockupImg)
        }, 0)
      }

      mockupImg.onerror = (e) => {
        console.error("Error loading mockup image:", e)
      }

      mockupImg.src = mockup.src
    }

    loadMockup()
  }, [activeTab, textureReady, loading])

  // Render the visualization on canvas
  const renderVisualization = (mockupImg: HTMLImageElement) => {
    const canvas = mockupCanvasRef.current
    if (!canvas || !bookmatchedTextureRef.current) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions to match the mockup image
    canvas.width = mockupImg.width
    canvas.height = mockupImg.height

    // Create a pattern from the bookmatched texture
    const textureImg = document.createElement("img")
    textureImg.crossOrigin = "anonymous"

    textureImg.onload = () => {
      // First, fill the entire canvas with the texture
      const pattern = ctx.createPattern(textureImg, "repeat")
      if (pattern) {
        ctx.fillStyle = pattern
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // Then draw the mockup image on top, but with special handling for black areas
      // Create a temporary canvas to analyze the mockup
      const tempCanvas = document.createElement("canvas")
      const tempCtx = tempCanvas.getContext("2d")
      if (!tempCtx) return

      tempCanvas.width = mockupImg.width
      tempCanvas.height = mockupImg.height
      tempCtx.drawImage(mockupImg, 0, 0)

      // Get image data to analyze pixels
      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
      const data = imageData.data

      // Create a mask for non-black areas
      for (let i = 0; i < data.length; i += 4) {
        // Check if pixel is very dark (black or near black)
        // R, G, B values all below 30 (out of 255) indicates a very dark pixel
        if (data[i] < 30 && data[i + 1] < 30 && data[i + 2] < 30) {
          // Make this pixel transparent in the mockup
          data[i + 3] = 0 // Set alpha to 0
        }
      }

      // Put the modified image data back
      tempCtx.putImageData(imageData, 0, 0)

      // Draw the modified mockup (with transparent black areas) on top of the texture
      ctx.drawImage(tempCanvas, 0, 0)
    }

    textureImg.onerror = () => {
      console.error("Error loading texture for visualization")
      // Fallback to just showing the mockup
      ctx.drawImage(mockupImg, 0, 0)
    }

    textureImg.src = bookmatchedTextureRef.current
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Product Visualizer</h2>

      <Tabs defaultValue={MOCKUPS[0].id} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
          {MOCKUPS.map((mockup) => (
            <TabsTrigger key={mockup.id} value={mockup.id} className="text-xs">
              {mockup.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {MOCKUPS.map((mockup) => (
          <TabsContent key={mockup.id} value={mockup.id} className="mt-0">
            <div className="border rounded-lg p-2 bg-gray-50">
              <div className="relative rounded-lg overflow-hidden bg-white border">
                {loading || !textureReady ? (
                  <div className="flex items-center justify-center h-[200px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#194a95]"></div>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <canvas
                      ref={mockupCanvasRef}
                      width={mockupDimensions.width || 800}
                      height={mockupDimensions.height || 600}
                      className="max-w-full h-auto"
                      style={{ maxHeight: "500px" }}
                    />
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-2 text-center">
                This is a visualization of how {productName} might look in this space.
              </p>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
