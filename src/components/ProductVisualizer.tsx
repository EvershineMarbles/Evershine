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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bookmatchedTextureRef = useRef<string | null>(null)
  const [backgroundSize, setBackgroundSize] = useState("400px 400px") // Default size
  const [backgroundPosition, setBackgroundPosition] = useState("center") // Default position
  const [mockupsLoaded, setMockupsLoaded] = useState<Record<string, boolean>>({})
  const [allMockupsLoaded, setAllMockupsLoaded] = useState(false)

  // Preload all mockup images as soon as component mounts
  useEffect(() => {
    const preloadedMockups: Record<string, boolean> = {}
    let loadedCount = 0

    MOCKUPS.forEach((mockup) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      
      img.onload = () => {
        preloadedMockups[mockup.id] = true
        loadedCount++
        
        if (loadedCount === MOCKUPS.length) {
          setAllMockupsLoaded(true)
          setMockupsLoaded(preloadedMockups)
        }
      }
      
      img.onerror = () => {
        preloadedMockups[mockup.id] = false
        loadedCount++
        
        if (loadedCount === MOCKUPS.length) {
          setAllMockupsLoaded(true)
          setMockupsLoaded(preloadedMockups)
        }
      }
      
      img.src = mockup.src
    })
  }, [])

  // Create bookmatched texture as soon as component mounts
  useEffect(() => {
    createBookmatchedTexture(productImage)
  }, [productImage])

  // Set a timeout to simulate loading and ensure the DOM is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500) // Reduced from 1000ms to 500ms for faster initial display

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

      const originalWidth = img.width
      const originalHeight = img.height
      const isSquareImage = Math.abs(originalWidth - originalHeight) < 20 // Consider nearly square images as square

      console.log(`Image dimensions: ${originalWidth}x${originalHeight}, Is square: ${isSquareImage}`)

      // Special handling for square images to avoid visible seam lines
      if (isSquareImage) {
        // For square images, create a 3x3 grid with the original in the center
        // and seamlessly blend the edges
        
        // Make the canvas 3x the size of the original image
        const multiplier = 3
        canvas.width = originalWidth * multiplier
        canvas.height = originalHeight * multiplier
        
        // Calculate center position
        const centerX = originalWidth
        const centerY = originalHeight
        
        // Draw the original image in the center
        ctx.drawImage(img, centerX, centerY, originalWidth, originalHeight)
        
        // Create a function to draw the image with various transformations
        const drawTransformed = (x: number, y: number, flipX: boolean, flipY: boolean) => {
          ctx.save()
          
          // Position at the target location
          ctx.translate(x + (flipX ? originalWidth : 0), y + (flipY ? originalHeight : 0))
          
          // Apply scaling (flipping)
          ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1)
          
          // Draw the image
          ctx.drawImage(img, 0, 0, originalWidth, originalHeight)
          
          ctx.restore()
        }
        
        // Draw 8 surrounding copies with appropriate flipping
        // Top row
        drawTransformed(0, 0, false, false)                    // Top-left
        drawTransformed(centerX, 0, false, false)              // Top-center
        drawTransformed(centerX * 2, 0, true, false)           // Top-right
        
        // Middle row
        drawTransformed(0, centerY, false, false)              // Middle-left
        drawTransformed(centerX * 2, centerY, true, false)     // Middle-right
        
        // Bottom row
        drawTransformed(0, centerY * 2, false, true)           // Bottom-left
        drawTransformed(centerX, centerY * 2, false, true)     // Bottom-center
        drawTransformed(centerX * 2, centerY * 2, true, true)  // Bottom-right
        
        // Apply a subtle blur to hide seams
        ctx.filter = 'blur(0.5px)'
        ctx.globalAlpha = 0.3
        ctx.drawImage(canvas, 0, 0)
        ctx.filter = 'none'
        ctx.globalAlpha = 1.0
        
        // Set background size to ensure the pattern covers well
        setBackgroundSize(`${originalWidth * 3}px ${originalHeight * 3}px`)
        setBackgroundPosition("center")
      } else {
        // For non-square images, use the grid approach
        // Create a 4x4 grid for all images (16 copies total)
        const gridSize = 4

        // Set canvas size to accommodate the grid
        canvas.width = originalWidth * gridSize
        canvas.height = originalHeight * gridSize

        // Fill the entire grid with copies of the image
        for (let y = 0; y < gridSize; y++) {
          for (let x = 0; x < gridSize; x++) {
            // For every other position, flip the image horizontally, vertically, or both
            // to create the bookmatched effect
            const flipHorizontal = x % 2 === 1
            const flipVertical = y % 2 === 1

            ctx.save()

            // Position at the correct grid cell
            const posX = x * originalWidth
            const posY = y * originalHeight

            if (flipHorizontal && flipVertical) {
              // Flip both horizontally and vertically
              ctx.translate(posX + originalWidth, posY + originalHeight)
              ctx.scale(-1, -1)
              ctx.drawImage(img, 0, 0, originalWidth, originalHeight)
            } else if (flipHorizontal) {
              // Flip horizontally only
              ctx.translate(posX + originalWidth, posY)
              ctx.scale(-1, 1)
              ctx.drawImage(img, 0, 0, originalWidth, originalHeight)
            } else if (flipVertical) {
              // Flip vertically only
              ctx.translate(posX, posY + originalHeight)
              ctx.scale(1, -1)
              ctx.drawImage(img, 0, 0, originalWidth, originalHeight)
            } else {
              // No flip
              ctx.drawImage(img, posX, posY, originalWidth, originalHeight)
            }

            ctx.restore()
          }
        }

        // Set background size to ensure full coverage
        // Use a smaller tile size to create more repetition and better coverage
        const tileSize = Math.min(originalWidth, originalHeight)
        setBackgroundSize(`${tileSize}px ${tileSize}px`)
        setBackgroundPosition("center")
      }

      // Store the bookmatched texture
      bookmatchedTextureRef.current = canvas.toDataURL("image/jpeg", 0.95) // Higher quality JPEG
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

  // Determine if we should show loading state
  const showLoading = loading || !textureReady || !allMockupsLoaded

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
                {showLoading ? (
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
