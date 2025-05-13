"use client"

import { useState } from "react"
import Image from "next/image"

interface SimpleMockupVisualizerProps {
  productImage: string
  productName: string
}

export default function SimpleMockupVisualizer({ productImage, productName }: SimpleMockupVisualizerProps) {
  const [scale, setScale] = useState(1)
  const [loading, setLoading] = useState(true)

  // Define the area where the product image should be displayed (white wall area)
  const productArea = {
    top: 0,
    left: 0,
    width: "100%",
    height: "58%", // The white wall area is approximately 58% of the image height
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">{productName} Visualization</h2>

      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="relative aspect-[16/9] w-full">
          {/* Product image as background for the top section */}
          <div
            className="absolute z-10"
            style={{
              top: productArea.top,
              left: productArea.left,
              width: productArea.width,
              height: productArea.height,
              backgroundImage: `url(${productImage})`,
              backgroundSize: `${scale * 100}%`,
              backgroundRepeat: "repeat",
            }}
          />

          {/* Mockup overlay with transparent background */}
          <Image
            src="/assets/mockups/bathroom-mockup-clean.png"
            alt="Bathroom mockup"
            fill
            className="object-cover z-20"
            onLoad={() => setLoading(false)}
            priority
          />

          {/* Loading indicator */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-30">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#194a95]"></div>
            </div>
          )}
        </div>
      </div>

      {/* Simple scale control */}
      <div className="mt-4 flex items-center gap-4">
        <label htmlFor="scale-slider" className="text-sm font-medium">
          Texture Scale:
        </label>
        <input
          id="scale-slider"
          type="range"
          min="0.5"
          max="3"
          step="0.1"
          value={scale}
          onChange={(e) => setScale(Number.parseFloat(e.target.value))}
          className="w-full max-w-xs"
        />
      </div>

      <p className="text-sm text-gray-500 mt-4">
        This visualization shows how {productName} would look when installed in this bathroom.
      </p>
    </div>
  )
}
