"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface ProductVisualizerProps {
  productImage: string
  productName: string
}

export default function ProductVisualizer({ productImage, productName }: ProductVisualizerProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Handle image loading errors
  useEffect(() => {
    // Create a test image to check if the product image can be loaded
    const testImg = document.createElement("img")
    testImg.crossOrigin = "anonymous" // Add this to avoid CORS issues
    testImg.src = productImage

    testImg.onload = () => {
      setImageLoaded(true)
      setImageError(false)
    }

    testImg.onerror = () => {
      console.warn("Product image failed to load, using fallback visualization")
      setImageError(true)
      setImageLoaded(true) // Still set to true so we show the visualization without the product texture
    }

    return () => {
      testImg.onload = null
      testImg.onerror = null
    }
  }, [productImage])

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6">Product Visualizer</h2>

      {/* Visualization Area */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="relative aspect-[4/3] w-full">
          {/* Product Texture Background - This will be visible through transparent areas of the mockup */}
          {imageLoaded && !imageError && (
            <div
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: `url(${productImage})`,
                backgroundRepeat: "repeat",
                backgroundSize: "300px 300px",
              }}
            />
          )}

          {/* Base Bathroom Mockup Image - With transparent areas where product should show */}
          <Image
            src="/assets/mockups/bathroom-mockup.png"
            alt="Bathroom mockup"
            fill
            className="object-cover z-10 relative"
            priority
          />
        </div>
      </div>

      {/* Simple Instruction */}
      <p className="text-sm text-gray-500 mt-4 text-center">
        This is a visualization of how {productName} might look in a bathroom setting.
        {imageError && " (Using default visualization due to image loading error)"}
      </p>
    </div>
  )
}
