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
      // Log image dimensions for debugging
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

      // Enhanced detection for problematic images
      const isSmallImage = originalWidth < MIN_IMAGE_SIZE || originalHeight < MIN_IMAGE_SIZE
      const isVerySmallImage = originalWidth < 100 || originalHeight < 100
      const hasUnbalancedAspectRatio = originalWidth / originalHeight > 3 || originalHeight / originalWidth > 3
      const isRectangular = Math.abs(originalWidth - originalHeight) > Math.min(originalWidth, originalHeight) * 0.5

      // Determine the approach based on image characteristics
      if (isVerySmallImage || hasUnbalancedAspectRatio) {
        console.log("Using super-enhanced method for very small or unbalanced image")

        // SUPER-ENHANCED METHOD FOR VERY SMALL OR UNBALANCED IMAGES
        // Create a normalized square version of the image first

        // Create a temporary square canvas to normalize the image
        const normalSize = Math.max(originalWidth, originalHeight)
        const tempCanvas = document.createElement("canvas")
        tempCanvas.width = normalSize
        tempCanvas.height = normalSize
        const tempCtx = tempCanvas.getContext("2d")

        if (tempCtx) {
          // Center the image in the square canvas
          const offsetX = (normalSize - originalWidth) / 2
          const offsetY = (normalSize - originalHeight) / 2

          // Draw the original image centered in the square canvas
          tempCtx.drawImage(img, offsetX, offsetY, originalWidth, originalHeight)

          // Now create a large grid of bookmatched patterns (6x6)
          const gridSize = 6
          canvas.width = normalSize * gridSize
          canvas.height = normalSize * gridSize

          // Create a 2x2 bookmatched pattern from the normalized image
          const patternCanvas = document.createElement("canvas")
          patternCanvas.width = normalSize * 2
          patternCanvas.height = normalSize * 2
          const patternCtx = patternCanvas.getContext("2d")

          if (patternCtx) {
            // Original image in top-left
            patternCtx.drawImage(tempCanvas, 0, 0)

            // Horizontally flipped in top-right
            patternCtx.save()
            patternCtx.translate(normalSize * 2, 0)
            patternCtx.scale(-1, 1)
            patternCtx.drawImage(tempCanvas, 0, 0)
            patternCtx.restore()

            // Vertically flipped in bottom-left
            patternCtx.save()
            patternCtx.translate(0, normalSize * 2)
            patternCtx.scale(1, -1)
            patternCtx.drawImage(tempCanvas, 0, 0)
            patternCtx.restore()

            // Both horizontally and vertically flipped in bottom-right
            patternCtx.save()
            patternCtx.translate(normalSize * 2, normalSize * 2)
            patternCtx.scale(-1, -1)
            patternCtx.drawImage(tempCanvas, 0, 0)
            patternCtx.restore()

            // Now tile this pattern across the main canvas
            for (let y = 0; y < canvas.height; y += normalSize * 2) {
              for (let x = 0; x < canvas.width; x += normalSize * 2) {
                ctx.drawImage(patternCanvas, x, y)
              }
            }
          }

          // Set a background size that ensures good coverage
          setBackgroundSize(`${normalSize * 2}px ${normalSize * 2}px`)
        }
      } else if (isSmallImage || isRectangular) {
        console.log("Using enhanced method for small or rectangular image")

        // ENHANCED METHOD FOR SMALL OR RECTANGULAR IMAGES
        // Create a 4x4 grid of bookmatched patterns
        const gridSize = 4

        // Set canvas size to accommodate the grid
        canvas.width = originalWidth * gridSize
        canvas.height = originalHeight * gridSize

        // Function to draw a single bookmatched pattern (2x2) at a specific position
        const drawBookmatchedPattern = (startX: number, startY: number) => {
          // Original image in top-left
          ctx.drawImage(img, startX, startY, originalWidth, originalHeight)

          // Horizontally flipped in top-right
          ctx.save()
          ctx.translate(startX + originalWidth * 2, startY)
          ctx.scale(-1, 1)
          ctx.drawImage(img, 0, 0, originalWidth, originalHeight)
          ctx.restore()

          // Vertically flipped in bottom-left
          ctx.save()
          ctx.translate(startX, startY + originalHeight * 2)
          ctx.scale(1, -1)
          ctx.drawImage(img, 0, 0, originalWidth, originalHeight)
          ctx.restore()

          // Both horizontally and vertically flipped in bottom-right
          ctx.save()
          ctx.translate(startX + originalWidth * 2, startY + originalHeight * 2)
          ctx.scale(-1, -1)
          ctx.drawImage(img, 0, 0, originalWidth, originalHeight)
          ctx.restore()
        }

        // Draw multiple bookmatched patterns in a grid
        for (let y = 0; y < gridSize; y += 2) {
          for (let x = 0; x < gridSize; x += 2) {
            drawBookmatchedPattern(x * originalWidth, y * originalHeight)
          }
        }

        // Set a background size that ensures good coverage
        const patternSize = Math.min(originalWidth, originalHeight) * 2
        setBackgroundSize(`${patternSize}px ${patternSize}px`)
      } else {
        console.log("Using standard method for normal-sized image")

        // STANDARD METHOD FOR NORMAL-SIZED IMAGES
        // Set canvas size to 2x the image size to fit the bookmatched pattern
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
      }

      setBackgroundPosition("center")

      // Store the bookmatched texture with high quality
      bookmatchedTextureRef.current = canvas.toDataURL("image/jpeg", 0.98)
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
                          "/placeholder.svg" ||
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
