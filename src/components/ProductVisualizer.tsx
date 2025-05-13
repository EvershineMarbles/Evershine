"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

interface ProductVisualizerProps {
  productImage: string
  productName: string
}

export default function ProductVisualizer({ productImage, productName }: ProductVisualizerProps) {
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Set a timeout to simulate loading and ensure the DOM is ready
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6">Product Visualizer</h2>

      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="relative rounded-lg overflow-hidden bg-white border">
          {loading ? (
            <div className="flex items-center justify-center h-[450px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#194a95]"></div>
            </div>
          ) : (
            <div
              ref={containerRef}
              className="relative aspect-[4/3] w-full"
              style={{
                backgroundImage: `url(${productImage})`,
                backgroundRepeat: "repeat",
                backgroundSize: "200px 200px",
              }}
            >
              {/* Bathroom mockup with transparent areas */}
              <Image
                src="/assets/mockups/bathroom-mockup.png"
                alt={`Bathroom mockup with ${productName}`}
                fill
                className="object-contain"
                style={{ objectFit: "contain" }}
              />
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500 mt-4 text-center">
          This is a visualization of how {productName} might look in this space.
        </p>
      </div>
    </div>
  )
}
