"use client"

import { useState } from "react"
import Image from "next/image"

interface ProductVisualizerProps {
  productImage: string
  productName: string
}

export default function ProductVisualizer({ productImage, productName }: ProductVisualizerProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6">Product Visualizer</h2>

      {/* Visualization Area */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="relative aspect-[4/3] w-full">
          {/* Base Bathroom Mockup Image */}
          <Image
            src="/assets/mockups/bathroom-mockup.png"
            alt="Bathroom mockup"
            fill
            className="object-cover"
            onLoad={() => setImageLoaded(true)}
          />

          {/* Product Texture Overlay - Applied to the wall area behind the tub */}
          <div
            className="absolute z-10"
            style={{
              top: "50%",
              left: "0",
              width: "100%",
              height: "50%",
              backgroundImage: `url(${productImage})`,
              backgroundRepeat: "repeat",
              backgroundSize: "200px 200px",
              mixBlendMode: "multiply",
              opacity: 0.9,
            }}
          />
        </div>
      </div>

      {/* Simple Instruction */}
      <p className="text-sm text-gray-500 mt-4 text-center">
        This is a visualization of how {productName} might look in a bathroom setting.
      </p>
    </div>
  )
}
