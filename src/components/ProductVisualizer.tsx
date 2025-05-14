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

// Thresholds for different image sizes
const SIZE_THRESHOLDS = {
  VERY_SMALL: 200, // Images smaller than this in either dimension
  SMALL: 500, // Images smaller than this in either dimension
  MEDIUM: 800, // Images smaller than this in either dimension
  // Anything larger is considered LARGE
}

// Thresholds for aspect ratio
const ASPECT_RATIO_THRESHOLDS = {
  EXTREME: 3.0, // Aspect ratio greater than this is considered extreme
  UNBALANCED: 1.5, // Aspect ratio greater than this is considered unbalanced
  // Anything closer to 1 is considered balanced
}

export default function ProductVisualizer({ productImage, productName, preload = false }: ProductVisualizerProps) {
  const [activeTab, setActiveTab] = useState<string>(MOCKUPS[0].id)
  const [loading, setLoading] = useState(true)
  const [textureReady, setTextureReady] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bookmatchedTextureRef = useRef<string | null>(null)
  const [backgroundSize, setBackgroundSize] = useState("400px 400px") // Default size
  const [backgroundPosition, setBackgroundPosition] = useState("center") // Default position
  const [mockupImagesLoaded, setMockupImagesLoaded] = useState<Record<string, boolean>>({})

  // Preload all mockup images if preload is true
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
    createBookmatchedTexture(productImage)
  }, [productImage])

  // Remove artificial loading delay and rely on actual asset loading
  useEffect(() => {
    if (textureReady) {
      const timer = setTimeout(() => {
        setLoading(false)
      }, 500) // Short delay to ensure smooth transition

      return () => clearTimeout(timer)
    }
  }, [textureReady])

  // Helper function to classify image size
  const classifyImageSize = (width: number, height: number) => {
    const minDimension = Math.min(width, height)

    if (minDimension < SIZE_THRESHOLDS.VERY_SMALL) return "VERY_SMALL"
    if (minDimension < SIZE_THRESHOLDS.SMALL) return "SMALL"
    if (minDimension < SIZE_THRESHOLDS.MEDIUM) return "MEDIUM"
    return "LARGE"
  }

  // Helper function to classify aspect ratio
  const classifyAspectRatio = (width: number, height: number) => {
    const aspectRatio = Math.max(width / height, height / width)

    if (aspectRatio > ASPECT_RATIO_THRESHOLDS.EXTREME) return "EXTREME"
    if (aspectRatio > ASPECT_RATIO_THRESHOLDS.UNBALANCED) return "UNBALANCED"
    return "BALANCED"
  }

  // Calculate optimal repetition factor based on image dimensions
  const calculateRepetitionFactor = (width: number, height: number) => {
    const sizeCategory = classifyImageSize(width, height)
    const aspectRatioCategory = classifyAspectRatio(width, height)

    // Base repetition factor on size
    let repetitionFactor = 1

    if (sizeCategory === "VERY_SMALL") {
      repetitionFactor = 8
    } else if (sizeCategory === "SMALL") {
      repetitionFactor = 6
    } else if (sizeCategory === "MEDIUM") {
      repetitionFactor = 4
    } else {
      repetitionFactor = 2
    }

    // Adjust based on aspect ratio
    if (aspectRatioCategory === "EXTREME") {
      repetitionFactor += 2
    } else if (aspectRatioCategory === "UNBALANCED") {
      repetitionFactor += 1
    }

    return repetitionFactor
  }

  // Calculate optimal background size based on image dimensions
  const calculateBackgroundSize = (width: number, height: number) => {
    const sizeCategory = classifyImageSize(width, height)
    const aspectRatioCategory = classifyAspectRatio(width, height)

    // For very small images, we want to show more repetitions
    // so we use a smaller background size
    if (sizeCategory === "VERY_SMALL") {
      return `${Math.max(width, height) * 2}px ${Math.max(width, height) * 2}px`
    } else if (sizeCategory === "SMALL") {
      return `${Math.max(width, height) * 3}px ${Math.max(width, height) * 3}px`
    } else if (aspectRatioCategory === "EXTREME") {
      // For extreme aspect ratios, we want to show more repetitions
      return `${Math.max(width, height) * 2}px ${Math.max(width, height) * 2}px`
    } else {
      // For larger, balanced images, we can use a larger background size
      return `${Math.max(width, height) * 4}px ${Math.max(width, height) * 4}px`
    }
  }

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
      // Check if image actually loaded with dimensions
      if (img.width === 0 || img.height === 0) {
        console.error("Image loaded but has zero dimensions:", imageUrl)
        bookmatchedTextureRef.current = imageUrl
        setTextureReady(true)
        return
      }

      const originalWidth = img.width
      const originalHeight = img.height
      const aspectRatio = originalWidth / originalHeight

      // Classify the image
      const sizeCategory = classifyImageSize(originalWidth, originalHeight)
      const aspectRatioCategory = classifyAspectRatio(originalWidth, originalHeight)

      // Create a canvas to manipulate the image
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        console.error("Could not get canvas context")
        return
      }

      // Determine if we need special handling for small or rectangular images
      if (sizeCategory === "VERY_SMALL" || aspectRatioCategory === "EXTREME") {
        // SUPER-ENHANCED METHOD FOR VERY SMALL OR EXTREME ASPECT RATIO IMAGES

        // Calculate repetition factor
        const repetitionFactor = calculateRepetitionFactor(originalWidth, originalHeight)

        // Create a normalized square version of the image
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

          // Create a large grid of bookmatched patterns
          canvas.width = normalSize * repetitionFactor
          canvas.height = normalSize * repetitionFactor

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
        }
      } else if (sizeCategory === "SMALL" || aspectRatioCategory === "UNBALANCED") {
        // ENHANCED METHOD FOR SMALL OR UNBALANCED ASPECT RATIO IMAGES

        // Calculate repetition factor
        const repetitionFactor = calculateRepetitionFactor(originalWidth, originalHeight)

        // Set canvas size to accommodate the grid
        canvas.width = originalWidth * repetitionFactor
        canvas.height = originalHeight * repetitionFactor

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
        for (let y = 0; y < repetitionFactor; y += 2) {
          for (let x = 0; x < repetitionFactor; x += 2) {
            drawBookmatchedPattern(x * originalWidth, y * originalHeight)
          }
        }
      } else {
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
      }

      // Calculate optimal background size
      const bgSize = calculateBackgroundSize(originalWidth, originalHeight)
      setBackgroundSize(bgSize)
      setBackgroundPosition("center")

      // Store the bookmatched texture with high quality
      bookmatchedTextureRef.current = canvas.toDataURL("image/jpeg", 0.95)
      setTextureReady(true)
    }

    img.onerror = (error) => {
      console.error("Error loading product image for bookmatching:", error)
      console.error("Failed image URL:", imageUrl)

      // Try an alternative approach with a new image
      const fallbackImg = new Image()
      fallbackImg.crossOrigin = "anonymous"

      fallbackImg.onload = () => {
        console.log("Fallback image loaded successfully")
        bookmatchedTextureRef.current = fallbackImg.src
        setTextureReady(true)
      }

      fallbackImg.onerror = () => {
        console.error("Even fallback approach failed")
        // Use a placeholder pattern as absolute fallback
        bookmatchedTextureRef.current =
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Cpath d='M30 40 L50 65 L70 40' stroke='%23cccccc' strokeWidth='2' fill='none'/%3E%3Ccircle cx='50' cy='30' r='10' fill='%23cccccc'/%3E%3C/svg%3E"
        setTextureReady(true)
      }

      // Try direct URL first as fallback
      if (imageUrl.startsWith("http")) {
        fallbackImg.src = imageUrl
      } else {
        fallbackImg.src =
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Cpath d='M30 40 L50 65 L70 40' stroke='%23cccccc' strokeWidth='2' fill='none'/%3E%3Ccircle cx='50' cy='30' r='10' fill='%23cccccc'/%3E%3C/svg%3E"
      }
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
