"use client"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"

interface ProductVisualizerProps {
  productImage: string
  productName: string
  preload?: boolean
}

// Define mockup rooms
const MOCKUPS = [
  {
    id: "bathroom",
    name: "Bathroom",
    src: "/assets/mockups/bathroom.png",
    maskSrc: "/assets/mockups/bathroom-mask.png", // Optional mask for better blending
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

export default function ProductVisualizer({ productImage, productName }: ProductVisualizerProps) {
  const [activeTab, setActiveTab] = useState<string>(MOCKUPS[0].id)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [renderMethod, setRenderMethod] = useState<"canvas" | "css">("canvas")
  const [retryCount, setRetryCount] = useState(0)

  // Use a direct reference to the image element for more control
  const productImageRef = useRef<HTMLImageElement | null>(null)
  const mockupImageRef = useRef<HTMLImageElement | null>(null)

  // Effect to handle visualization
  useEffect(() => {
    // Reset error state on tab change or retry
    setError(null)
    setLoading(true)

    // Create a new image element for the product
    const productImg = new Image()
    productImg.crossOrigin = "anonymous"

    // Create a new image element for the mockup
    const mockupImg = new Image()
    mockupImg.crossOrigin = "anonymous"

    // Store references
    productImageRef.current = productImg
    mockupImageRef.current = mockupImg

    // Handle product image load
    productImg.onload = () => {
      console.log("Product image loaded successfully:", {
        width: productImg.width,
        height: productImg.height,
        src: productImage,
      })

      // Now load the mockup image
      const activeMockup = MOCKUPS.find((m) => m.id === activeTab)
      if (activeMockup) {
        mockupImg.src = activeMockup.src
      }
    }

    // Handle product image error
    productImg.onerror = (e) => {
      console.error("Failed to load product image:", e)
      setError("Failed to load product image. Please try again.")
      setLoading(false)
    }

    // Handle mockup image load
    mockupImg.onload = () => {
      console.log("Mockup image loaded successfully")
      renderVisualization()
    }

    // Handle mockup image error
    mockupImg.onerror = (e) => {
      console.error("Failed to load mockup image:", e)
      setError("Failed to load room mockup. Please try again.")
      setLoading(false)
    }

    // Start loading the product image
    productImg.src = productImage

    // Cleanup function
    return () => {
      productImg.onload = null
      productImg.onerror = null
      mockupImg.onload = null
      mockupImg.onerror = null
    }
  }, [productImage, activeTab, retryCount, renderMethod])

  // Function to render the visualization
  const renderVisualization = () => {
    if (!canvasRef.current || !productImageRef.current || !mockupImageRef.current) {
      setError("Canvas or images not available")
      setLoading(false)
      return
    }

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        setError("Could not get canvas context")
        setLoading(false)
        return
      }

      const productImg = productImageRef.current
      const mockupImg = mockupImageRef.current

      // Set canvas dimensions to match mockup image
      canvas.width = mockupImg.width
      canvas.height = mockupImg.height

      // Draw the mockup image first
      ctx.drawImage(mockupImg, 0, 0, canvas.width, canvas.height)

      // Get the active mockup to check for mask
      const activeMockup = MOCKUPS.find((m) => m.id === activeTab)

      // If we have a mask for this mockup, use it for better blending
      if (activeMockup?.maskSrc) {
        const maskImg = new Image()
        maskImg.crossOrigin = "anonymous"
        maskImg.onload = () => {
          applyMaskedTexture(ctx, productImg, maskImg, canvas.width, canvas.height)
          setLoading(false)
        }
        maskImg.onerror = () => {
          // Fall back to standard method if mask fails to load
          applyStandardTexture(ctx, productImg, canvas.width, canvas.height)
          setLoading(false)
        }
        maskImg.src = activeMockup.maskSrc
      } else {
        // Use standard method without mask
        applyStandardTexture(ctx, productImg, canvas.width, canvas.height)
        setLoading(false)
      }
    } catch (err) {
      console.error("Error rendering visualization:", err)
      setError("Failed to render visualization. Please try again.")
      setLoading(false)
    }
  }

  // Apply texture with mask for better blending
  const applyMaskedTexture = (
    ctx: CanvasRenderingContext2D,
    productImg: HTMLImageElement,
    maskImg: HTMLImageElement,
    width: number,
    height: number,
  ) => {
    // Create a temporary canvas for the texture pattern
    const patternCanvas = document.createElement("canvas")
    const patternCtx = patternCanvas.getContext("2d")

    if (!patternCtx) return

    // Create a bookmatched pattern
    const patternSize = Math.max(productImg.width, productImg.height) * 2
    patternCanvas.width = patternSize
    patternCanvas.height = patternSize

    // Draw original image in top-left
    patternCtx.drawImage(productImg, 0, 0)

    // Draw horizontally flipped in top-right
    patternCtx.save()
    patternCtx.translate(patternSize, 0)
    patternCtx.scale(-1, 1)
    patternCtx.drawImage(productImg, 0, 0, productImg.width, productImg.height)
    patternCtx.restore()

    // Draw vertically flipped in bottom-left
    patternCtx.save()
    patternCtx.translate(0, patternSize)
    patternCtx.scale(1, -1)
    patternCtx.drawImage(productImg, 0, 0, productImg.width, productImg.height)
    patternCtx.restore()

    // Draw both horizontally and vertically flipped in bottom-right
    patternCtx.save()
    patternCtx.translate(patternSize, patternSize)
    patternCtx.scale(-1, -1)
    patternCtx.drawImage(productImg, 0, 0, productImg.width, productImg.height)
    patternCtx.restore()

    // Create a pattern from the bookmatched texture
    const pattern = ctx.createPattern(patternCanvas, "repeat")
    if (!pattern) return

    // Draw the mask
    ctx.drawImage(maskImg, 0, 0, width, height)

    // Use the mask as a composite operation
    ctx.globalCompositeOperation = "source-in"

    // Fill with the pattern
    ctx.fillStyle = pattern
    ctx.fillRect(0, 0, width, height)

    // Reset composite operation
    ctx.globalCompositeOperation = "source-over"
  }

  // Apply standard texture without mask
  const applyStandardTexture = (
    ctx: CanvasRenderingContext2D,
    productImg: HTMLImageElement,
    width: number,
    height: number,
  ) => {
    // Create a temporary canvas for the texture pattern
    const patternCanvas = document.createElement("canvas")
    const patternCtx = patternCanvas.getContext("2d")

    if (!patternCtx) return

    // Create a bookmatched pattern
    const patternSize = Math.max(productImg.width, productImg.height) * 2
    patternCanvas.width = patternSize
    patternCanvas.height = patternSize

    // Draw original image in top-left
    patternCtx.drawImage(productImg, 0, 0)

    // Draw horizontally flipped in top-right
    patternCtx.save()
    patternCtx.translate(patternSize, 0)
    patternCtx.scale(-1, 1)
    patternCtx.drawImage(productImg, 0, 0, productImg.width, productImg.height)
    patternCtx.restore()

    // Draw vertically flipped in bottom-left
    patternCtx.save()
    patternCtx.translate(0, patternSize)
    patternCtx.scale(1, -1)
    patternCtx.drawImage(productImg, 0, 0, productImg.width, productImg.height)
    patternCtx.restore()

    // Draw both horizontally and vertically flipped in bottom-right
    patternCtx.save()
    patternCtx.translate(patternSize, patternSize)
    patternCtx.scale(-1, -1)
    patternCtx.drawImage(productImg, 0, 0, productImg.width, productImg.height)
    patternCtx.restore()

    // Create a pattern from the bookmatched texture
    const pattern = ctx.createPattern(patternCanvas, "repeat")
    if (!pattern) return

    // Define areas to apply the texture (simplified for this example)
    // In a real implementation, you would use more precise coordinates based on the mockup
    const areas = [
      { x: 0, y: 0, width: width, height: height * 0.3 }, // Top wall
      { x: 0, y: height * 0.7, width: width, height: height * 0.3 }, // Bottom wall/floor
    ]

    // Apply the pattern to each area
    ctx.fillStyle = pattern
    areas.forEach((area) => {
      ctx.fillRect(area.x, area.y, area.width, area.height)
    })
  }

  // Function to retry visualization
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    setError(null)
    setLoading(true)
  }

  // Function to toggle render method
  const toggleRenderMethod = () => {
    setRenderMethod((prev) => (prev === "canvas" ? "css" : "canvas"))
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Product Visualizer</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={toggleRenderMethod} className="text-xs">
            {renderMethod === "canvas" ? "Switch to CSS Mode" : "Switch to Canvas Mode"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRetry} className="text-xs">
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>
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
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-[#194a95] mb-2" />
                    <p className="text-sm text-gray-500">Loading visualization...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-[300px]">
                    <p className="text-sm text-red-500 mb-2">{error}</p>
                    <Button variant="outline" size="sm" onClick={handleRetry}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    {renderMethod === "canvas" ? (
                      <canvas ref={canvasRef} className="max-w-full h-auto" style={{ maxHeight: "500px" }} />
                    ) : (
                      <div
                        className="relative inline-block"
                        style={{
                          backgroundImage: `url(${mockup.src})`,
                          backgroundSize: "contain",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat",
                          width: "100%",
                          height: "300px",
                        }}
                      >
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: `url(${productImage})`,
                            backgroundSize: "200px 200px",
                            backgroundRepeat: "repeat",
                            opacity: 0.8,
                            mixBlendMode: "multiply",
                          }}
                        />
                      </div>
                    )}
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

      {/* Technical information for debugging */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border text-xs">
        <p className="font-medium mb-1">Technical Information:</p>
        <ul className="list-disc pl-5 space-y-1 text-gray-600">
          <li>Render method: {renderMethod}</li>
          <li>Product image: {productImage ? productImage.substring(0, 50) + "..." : "Not loaded"}</li>
          <li>
            Image dimensions: {productImageRef.current?.width || 0}×{productImageRef.current?.height || 0}px
          </li>
          <li>
            Aspect ratio:{" "}
            {productImageRef.current
              ? (productImageRef.current.width / productImageRef.current.height).toFixed(2)
              : "N/A"}
          </li>
          <li>Retry count: {retryCount}</li>
        </ul>
      </div>
    </div>
  )
}
