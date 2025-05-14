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
    id: "luxury-living",
    name: "Luxury Living",
    src: "/assets/mockups/luxury-living.png",
  },
  {
    id: "living-room",
    name: "Living Room",
    src: "/assets/mockups/living-room.jpeg",
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
const MIN_IMAGE_SIZE = 650 // Images smaller than this will use the enhanced method

export default function ProductVisualizer({ productImage, productName, preload = true }: ProductVisualizerProps) {
  const [activeTab, setActiveTab] = useState<string>(MOCKUPS[0].id)
  const [loading, setLoading] = useState(true)
  const [textureReady, setTextureReady] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bookmatchedTextureRef = useRef<string | null>(null)
  const [backgroundSize, setBackgroundSize] = useState("400px 400px") // Default size
  const [backgroundPosition, setBackgroundPosition] = useState("center") // Default position
  const [mockupImagesLoaded, setMockupImagesLoaded] = useState<Record<string, boolean>>({})

  // Preload all mockup images
  useEffect(() => {
    if (!preload) return

    const preloadImages = async () => {
      const loadPromises = MOCKUPS.map((mockup) => {
        return new Promise<void>((resolve) => {
          const img = new window.Image()
          img.src = mockup.src
          img.onload = () => {
            setMockupImagesLoaded((prev) => ({ ...prev, [mockup.id]: true }))
            resolve()
          }
          img.onerror = () => {
            console.error(`Failed to preload mockup image: ${mockup.src}`)
            resolve() // Still resolve to not block other images
          }
        })
      })

      await Promise.all(loadPromises)
    }

    preloadImages()
  }, [preload])

  // Create bookmatched texture as soon as component mounts
  useEffect(() => {
    // Start creating the bookmatched texture immediately
    createBookmatchedTexture(productImage)
  }, [productImage])

  // Remove artificial loading delay and rely on actual asset loading
  useEffect(() => {
    // Check if all necessary assets are loaded
    const allMockupsLoaded = Object.keys(mockupImagesLoaded).length === MOCKUPS.length

    if (textureReady && allMockupsLoaded) {
      setLoading(false)
    }
  }, [textureReady, mockupImagesLoaded])

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

      // Determine if we need to use the enhanced method for small images
      const isSmallImage = originalWidth < MIN_IMAGE_SIZE || originalHeight < MIN_IMAGE_SIZE

      if (isSmallImage) {
        // ENHANCED METHOD FOR SMALL IMAGES
        // Create a larger, more detailed bookmatched pattern

        // Create a 2x2 bookmatched pattern first
        const basePatternSize = Math.max(originalWidth, originalHeight) * 2

        // Then repeat it 2x2 times for more detail without excessive scaling
        canvas.width = basePatternSize * 2
        canvas.height = basePatternSize * 2

        // Create the base 2x2 bookmatched pattern
        const createBasePattern = () => {
          // Original image in top-left
          ctx.drawImage(img, 0, 0, originalWidth, originalHeight)

          // Horizontally flipped in top-right
          ctx.save()
          ctx.translate(originalWidth * 2, 0)
          ctx.scale(-1, 1)
          ctx.drawImage(img, 0, 0, originalWidth, originalHeight)
          ctx.restore()

          // Vertically flipped in bottom-left
          ctx.save()
          ctx.translate(0, originalHeight * 2)
          ctx.scale(1, -1)
          ctx.drawImage(img, 0, 0, originalWidth, originalHeight)
          ctx.restore()

          // Both horizontally and vertically flipped in bottom-right
          ctx.save()
          ctx.translate(originalWidth * 2, originalHeight * 2)
          ctx.scale(-1, -1)
          ctx.drawImage(img, 0, 0, originalWidth, originalHeight)
          ctx.restore()
        }

        // Create the base pattern
        createBasePattern()

        // Now create a temporary canvas with just the base pattern
        const tempCanvas = document.createElement("canvas")
        tempCanvas.width = basePatternSize
        tempCanvas.height = basePatternSize
        const tempCtx = tempCanvas.getContext("2d")

        if (tempCtx) {
          // Copy the base pattern to the temp canvas
          tempCtx.drawImage(canvas, 0, 0, basePatternSize, basePatternSize, 0, 0, basePatternSize, basePatternSize)

          // Now use this base pattern to create a larger seamless pattern
          // Top-left
          ctx.drawImage(tempCanvas, 0, 0)

          // Top-right
          ctx.drawImage(tempCanvas, basePatternSize, 0)

          // Bottom-left
          ctx.drawImage(tempCanvas, 0, basePatternSize)

          // Bottom-right
          ctx.drawImage(tempCanvas, basePatternSize, basePatternSize)
        }

        // Set a smaller background size to maintain quality
        setBackgroundSize(`${basePatternSize}px ${basePatternSize}px`)
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

      {/* Hidden preload container for mockup images */}
      <div className="hidden">
        {MOCKUPS.map((mockup) => (
          <img
            key={`preload-${mockup.id}`}
            src={mockup.src || "/placeholder.svg"}
            alt=""
            onLoad={() => setMockupImagesLoaded((prev) => ({ ...prev, [mockup.id]: true }))}
          />
        ))}
      </div>

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
                        imageRendering: "auto",
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
