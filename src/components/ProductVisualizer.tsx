"use client"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface ProductVisualizerProps {
  productImage: string
  productName: string
  preload?: boolean // Optional prop to control preloading behavior
}

// Define mockup rooms
const MOCKUPS = [
  {
    id: "bathroom",
    name: "Bathroom",
    src: "/assets/mockups/bathroom.png",
  },
  {
    id: "modern-bedroom",
    name: "Modern Bedroom",
    src: "/assets/mockups/modern-bedroom.png",
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
    id: "bedroom-green",
    name: "Bedroom",
    src: "/assets/mockups/bedroom-green.png",
  },
  {
    id: "minimalist",
    name: "Minimalist",
    src: "/assets/mockups/minimalist.png",
  },
]

// Minimum dimensions we want to ensure for good coverage
const MIN_IMAGE_SIZE = 400 // Images smaller than this will use the enhanced method

export default function ProductVisualizer({ productImage, productName }: ProductVisualizerProps) {
  const [activeTab, setActiveTab] = useState<string>(MOCKUPS[0].id)
  const [loading, setLoading] = useState(true)
  const [textureReady, setTextureReady] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bookmatchedTextureRef = useRef<string | null>(null)
  const [backgroundSize, setBackgroundSize] = useState("400px 400px") // Default size
  const [backgroundPosition, setBackgroundPosition] = useState("center") // Default position

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
      // Add debug logging for image dimensions
      console.log(`Product image loaded - Width: ${img.width}, Height: ${img.height}`)

      // Create a canvas to manipulate the image
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        console.error("Could not get canvas context")
        return
      }

      const originalWidth = img.width
      const originalHeight = img.height

      // Enhanced detection for small images - check both dimensions and aspect ratio
      const isSmallImage = originalWidth < MIN_IMAGE_SIZE || originalHeight < MIN_IMAGE_SIZE
      const hasUnbalancedAspectRatio = originalWidth / originalHeight > 3 || originalHeight / originalWidth > 3

      if (isSmallImage || hasUnbalancedAspectRatio) {
        console.log("Using enhanced method for small or unbalanced image")

        // ENHANCED METHOD FOR SMALL OR UNBALANCED IMAGES
        // Create a more detailed pattern with more repetitions

        // Determine the base size for our pattern
        const baseSize = Math.max(originalWidth, originalHeight)

        // For very small images, we'll create an even larger pattern
        const repetitionFactor = Math.min(4, Math.ceil(MIN_IMAGE_SIZE / baseSize))
        const patternSize = baseSize * repetitionFactor

        // Create a canvas large enough for our enhanced pattern
        canvas.width = patternSize * 2
        canvas.height = patternSize * 2

        // First create a single bookmatched tile
        const createBasicBookmatchTile = (x: number, y: number, size: number) => {
          // Original image in top-left
          ctx.drawImage(img, x, y, originalWidth, originalHeight)

          // Horizontally flipped
          ctx.save()
          ctx.translate(x + originalWidth * 2, y)
          ctx.scale(-1, 1)
          ctx.drawImage(img, 0, 0, originalWidth, originalHeight)
          ctx.restore()

          // Vertically flipped
          ctx.save()
          ctx.translate(x, y + originalHeight * 2)
          ctx.scale(1, -1)
          ctx.drawImage(img, 0, 0, originalWidth, originalHeight)
          ctx.restore()

          // Both horizontally and vertically flipped
          ctx.save()
          ctx.translate(x + originalWidth * 2, y + originalHeight * 2)
          ctx.scale(-1, -1)
          ctx.drawImage(img, 0, 0, originalWidth, originalHeight)
          ctx.restore()
        }

        // Create a temporary canvas with a basic bookmatched tile
        const tempCanvas = document.createElement("canvas")
        tempCanvas.width = originalWidth * 2
        tempCanvas.height = originalHeight * 2
        const tempCtx = tempCanvas.getContext("2d")

        if (tempCtx) {
          // Create the basic bookmatched tile on the temp canvas
          createBasicBookmatchTile(0, 0, originalWidth)

          // Now use this basic tile to fill our larger canvas with a repeating pattern
          const tileWidth = originalWidth * 2
          const tileHeight = originalHeight * 2

          // Fill the canvas with repeated tiles
          for (let y = 0; y < canvas.height; y += tileHeight) {
            for (let x = 0; x < canvas.width; x += tileWidth) {
              ctx.drawImage(tempCanvas, x, y, tileWidth, tileHeight)
            }
          }
        }

        // Set a background size that ensures good coverage without being too small
        const backgroundSizeValue = Math.min(canvas.width, canvas.height) / 2
        setBackgroundSize(`${backgroundSizeValue}px ${backgroundSizeValue}px`)
        setBackgroundPosition("center")
      } else {
        // ORIGINAL METHOD FOR ADEQUATELY SIZED IMAGES
        // Create a classic bookmatched pattern
        const patternSize = Math.max(originalWidth, originalHeight) * 2
        canvas.width = patternSize
        canvas.height = patternSize

        // Draw the original image in the top-left quadrant
        ctx.drawImage(img, 0, 0)

        // Draw horizontally flipped image in top-right quadrant
        ctx.save()
        ctx.translate(patternSize, 0)
        ctx.scale(-1, 1)
        ctx.drawImage(img, 0, 0, originalWidth, originalHeight)
        ctx.restore()

        // Draw vertically flipped image in bottom-left quadrant
        ctx.save()
        ctx.translate(0, patternSize)
        ctx.scale(1, -1)
        ctx.drawImage(img, 0, 0, originalWidth, originalHeight)
        ctx.restore()

        // Draw both horizontally and vertically flipped image in bottom-right quadrant
        ctx.save()
        ctx.translate(patternSize, patternSize)
        ctx.scale(-1, -1)
        ctx.drawImage(img, 0, 0, originalWidth, originalHeight)
        ctx.restore()

        // Use a background size that ensures the pattern is visible but not too small
        setBackgroundSize(`${patternSize / 2}px ${patternSize / 2}px`)
        setBackgroundPosition("center")
      }

      // Store the bookmatched texture with high quality
      bookmatchedTextureRef.current = canvas.toDataURL("image/jpeg", 0.98) // Higher quality JPEG
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
                        backgroundSize: backgroundSize,
                        backgroundPosition: backgroundPosition,
                        imageRendering: "auto", // Changed from "high-quality" to "auto"
                      }}
                    >
                      <img
                        src={
                          mockup.src ||
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Cpath d='M30 40 L50 65 L70 40' stroke='%23cccccc' stroke-width='2' fill='none'/%3E%3Ccircle cx='50' cy='30' r='10' fill='%23cccccc'/%3E%3C/svg%3E" ||
                          "/placeholder.svg"
                        }
                        alt={`${mockup.name} mockup with ${productName}`}
                        className="block"
                        style={{ maxWidth: "100%", height: "auto", maxHeight: "500px" }}
                        onError={(e) => {
                          e.currentTarget.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Cpath d='M30 40 L50 65 L70 40' stroke='%23cccccc' strokeWidth='2' fill='none'/%3E%3Ccircle cx='50' cy='30' r='10' fill='%23cccccc'/%3E%3C/svg%3E"
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
