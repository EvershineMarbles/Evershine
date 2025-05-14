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

// Minimum dimensions we want to ensure for good coverage
const MIN_PATTERN_HEIGHT = 1500
const MIN_PATTERN_WIDTH = 1500

export default function ProductVisualizer({ productImage, productName }: ProductVisualizerProps) {
  const [activeTab, setActiveTab] = useState<string>(MOCKUPS[0].id)
  const [loading, setLoading] = useState(true)
  const [textureReady, setTextureReady] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bookmatchedTextureRef = useRef<string | null>(null)
  const [backgroundSize, setBackgroundSize] = useState("400px 400px") // Default size

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

      // Calculate the pattern size based on the image dimensions
      // For smaller images, we'll create a larger pattern by repeating more
      const originalWidth = img.width
      const originalHeight = img.height

      // Calculate how many times we need to repeat the pattern to reach minimum dimensions
      // We'll create a 2x2 grid at minimum, but might need more repetitions for small images
      const repeatX = Math.max(2, Math.ceil(MIN_PATTERN_WIDTH / (originalWidth * 2)))
      const repeatY = Math.max(2, Math.ceil(MIN_PATTERN_HEIGHT / (originalHeight * 2)))

      // Set canvas size to accommodate the repeated pattern
      const patternWidth = originalWidth * repeatX
      const patternHeight = originalHeight * repeatY

      canvas.width = patternWidth
      canvas.height = patternHeight

      // Function to draw the image with flipping options
      const drawImage = (x: number, y: number, flipX: boolean, flipY: boolean) => {
        ctx.save()
        ctx.translate(x, y)
        if (flipX) {
          ctx.translate(originalWidth, 0)
          ctx.scale(-1, 1)
        }
        if (flipY) {
          ctx.translate(0, originalHeight)
          ctx.scale(1, -1)
        }
        ctx.drawImage(img, 0, 0, originalWidth, originalHeight)
        ctx.restore()
      }

      // Create the bookmatched pattern by repeating in a grid
      for (let y = 0; y < repeatY; y += 2) {
        for (let x = 0; x < repeatX; x += 2) {
          // Original image in top-left
          drawImage(x * originalWidth, y * originalHeight, false, false)

          // Horizontally flipped in top-right
          drawImage((x + 1) * originalWidth, y * originalHeight, true, false)

          // Vertically flipped in bottom-left
          drawImage(x * originalWidth, (y + 1) * originalHeight, false, true)

          // Both horizontally and vertically flipped in bottom-right
          drawImage((x + 1) * originalWidth, (y + 1) * originalHeight, true, true)
        }
      }

      // Calculate appropriate background size for CSS
      // For smaller images, we want to ensure the pattern is large enough to cover the area
      const bgSize = Math.max(400, Math.min(originalWidth, originalHeight) * 2)
      setBackgroundSize(`${bgSize}px ${bgSize}px`)

      // Store the bookmatched texture
      bookmatchedTextureRef.current = canvas.toDataURL("image/jpeg")
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
                    <div
                      className="relative inline-block max-w-full"
                      style={{
                        backgroundImage: `url(${bookmatchedTextureRef.current || productImage})`,
                        backgroundRepeat: "repeat",
                        backgroundSize: backgroundSize, // Dynamic background size
                      }}
                    >
                      <img
                        src={mockup.src || "/placeholder.svg"}
                        alt={`${mockup.name} mockup with ${productName}`}
                        className="block"
                        style={{ maxWidth: "100%", height: "auto", maxHeight: "500px" }}
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                    </div>
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
