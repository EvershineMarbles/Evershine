"use client"

import { useState, useEffect, useRef } from "react"

interface ProductVisualizerProps {
  productImage: string
  productName: string
}

export default function ProductVisualizer({ productImage, productName }: ProductVisualizerProps) {
  const [loading, setLoading] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Create a function to handle the visualization
    const createVisualization = async () => {
      try {
        setLoading(true)
        setError(null)

        const canvas = canvasRef.current
        if (!canvas) {
          throw new Error("Canvas not available")
        }

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          throw new Error("Canvas context not available")
        }

        // Set canvas dimensions
        canvas.width = 800
        canvas.height = 600

        // Load the mockup image
        const mockupImage = document.createElement("img")
        mockupImage.crossOrigin = "anonymous"
        mockupImage.src = "/assets/mockups/bathroom-mockup.png"

        // Load the product texture
        const productTextureImage = document.createElement("img")
        productTextureImage.crossOrigin = "anonymous"
        productTextureImage.src = productImage

        // Wait for both images to load
        await Promise.all([
          new Promise<void>((resolve, reject) => {
            mockupImage.onload = () => resolve()
            mockupImage.onerror = () => reject(new Error("Failed to load mockup image"))
          }),
          new Promise<void>((resolve, reject) => {
            productTextureImage.onload = () => resolve()
            productTextureImage.onerror = () => reject(new Error("Failed to load product texture"))
          }),
        ])

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Create a pattern from the product texture
        const pattern = ctx.createPattern(productTextureImage, "repeat")
        if (!pattern) {
          throw new Error("Failed to create pattern from product texture")
        }

        // Fill the entire canvas with the product texture first
        ctx.fillStyle = pattern
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw the mockup image on top
        ctx.drawImage(mockupImage, 0, 0, canvas.width, canvas.height)

        setLoading(false)
      } catch (err) {
        console.error("Error creating visualization:", err)
        setError(err instanceof Error ? err.message : "Failed to create visualization")
        setLoading(false)
      }
    }

    createVisualization()
  }, [productImage])

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6">Product Visualizer</h2>

      <div className="border rounded-lg overflow-hidden bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-[600px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#194a95]"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[600px] p-4 text-center">
            <p className="text-red-500">
              Failed to generate visualization: {error}
              <br />
              <span className="text-sm text-gray-500 mt-2">
                Please try again or contact support if the issue persists.
              </span>
            </p>
          </div>
        ) : (
          <div className="relative">
            <canvas ref={canvasRef} className="w-full h-auto" style={{ maxHeight: "600px", objectFit: "contain" }} />
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500 mt-4 text-center">
        This is a visualization of how {productName} might look in a bathroom setting.
      </p>
    </div>
  )
}

