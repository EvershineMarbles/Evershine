"use client"

import { useState } from "react"
import Image from "next/image"

interface ProductVisualizerProps {
  productImage: string
  productName: string
}

// Define mockup rooms
const MOCKUPS = [
  {
    id: "bathroom",
    name: "Bathroom",
    src: "/assets/mockups/bathroom-mockup.png",
  },
  {
    id: "living-room",
    name: "Living Room",
    src: "/assets/mockups/living-room-mockup.jpeg",
  },
]

// Overlay positions for wall and floor in each mockup
const OVERLAY_POSITIONS = {
  bathroom: [
    { id: "wall", top: "0", left: "0", width: "100%", height: "60%", opacity: 0.5 },
    { id: "floor", top: "60%", left: "0", width: "100%", height: "40%", opacity: 0.7 },
  ],
  "living-room": [
    { id: "wall", top: "0", left: "0", width: "100%", height: "70%", opacity: 0.3 },
    { id: "floor", top: "70%", left: "0", width: "100%", height: "30%", opacity: 0.7 },
  ],
}

export default function ProductVisualizer({ productImage, productName }: ProductVisualizerProps) {
  const [activeTab, setActiveTab] = useState<string>(MOCKUPS[0].id)
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6">Product Visualizer</h2>

      {/* Tab Headers */}
      <div className="flex border-b mb-6">
        {MOCKUPS.map((mockup) => (
          <button
            key={mockup.id}
            onClick={() => setActiveTab(mockup.id)}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === mockup.id
                ? "border-b-2 border-[#194a95] text-[#194a95]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {mockup.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {MOCKUPS.map((mockup) => (
        <div key={mockup.id} className={activeTab === mockup.id ? "block" : "hidden"}>
          <div className="border rounded-lg p-4 bg-gray-50">
            {/* Visualization Area */}
            <div className="relative rounded-lg overflow-hidden bg-white border">
              <div className="relative aspect-[4/3] w-full">
                {/* Base Mockup Image */}
                <Image
                  src={mockup.src || "/placeholder.svg"}
                  alt={`${mockup.name} mockup`}
                  fill
                  className="object-cover"
                  onLoad={() => setImageLoaded(true)}
                />

                {/* Product Texture Overlays - Apply to both wall and floor */}
                {imageLoaded &&
                  OVERLAY_POSITIONS[mockup.id as keyof typeof OVERLAY_POSITIONS].map((overlay) => (
                    <div
                      key={overlay.id}
                      className="absolute z-10"
                      style={{
                        top: overlay.top,
                        left: overlay.left,
                        width: overlay.width,
                        height: overlay.height,
                        opacity: overlay.opacity,
                        backgroundImage: `url(${productImage})`,
                        backgroundRepeat: "repeat",
                        backgroundSize: "200px 200px",
                        mixBlendMode: "multiply",
                      }}
                    />
                  ))}
              </div>
            </div>

            {/* Simple Instruction */}
            <p className="text-sm text-gray-500 mt-4 text-center">
              This is a visualization of how {productName} might look in this space.
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
