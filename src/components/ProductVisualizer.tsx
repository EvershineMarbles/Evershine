"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface ProductVisualizerProps {
  productImage: string
  productName: string
}

// Define mockup rooms and their target areas
const MOCKUPS = [
  {
    id: "bathroom",
    name: "Bathroom",
    src: "/assets/mockups/bathroom-mockup.png",
    areas: [
      { id: "floor", name: "Floor" },
      { id: "wall", name: "Wall" },
    ],
  },
  {
    id: "living-room",
    name: "Living Room",
    src: "/assets/mockups/living-room-mockup.jpeg",
    areas: [
      { id: "floor", name: "Floor" },
      { id: "wall", name: "Wall" },
    ],
  },
]

// Simple overlay positions for each mockup and area
const OVERLAY_POSITIONS = {
  bathroom: {
    floor: { top: "60%", left: "0", width: "100%", height: "40%", opacity: 0.7 },
    wall: { top: "0", left: "0", width: "100%", height: "60%", opacity: 0.5 },
  },
  "living-room": {
    floor: { top: "70%", left: "0", width: "100%", height: "30%", opacity: 0.7 },
    wall: { top: "0", left: "0", width: "100%", height: "70%", opacity: 0.3 },
  },
}

export default function ProductVisualizer({ productImage, productName }: ProductVisualizerProps) {
  const [activeTab, setActiveTab] = useState<string>(MOCKUPS[0].id)
  const [selectedArea, setSelectedArea] = useState<Record<string, string>>({})
  const [imageLoaded, setImageLoaded] = useState(false)

  // Initialize selected areas
  useEffect(() => {
    const initialSelectedArea: Record<string, string> = {}
    MOCKUPS.forEach((mockup) => {
      initialSelectedArea[mockup.id] = mockup.areas[0].id
    })
    setSelectedArea(initialSelectedArea)
  }, [])

  // Handle area selection
  const handleAreaChange = (mockupId: string, areaId: string) => {
    setSelectedArea((prev) => ({ ...prev, [mockupId]: areaId }))
  }

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
            {/* Area Selection Buttons */}
            <div className="flex flex-wrap gap-3 mb-4">
              {mockup.areas.map((area) => (
                <Button
                  key={area.id}
                  variant={selectedArea[mockup.id] === area.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleAreaChange(mockup.id, area.id)}
                  className="capitalize"
                >
                  {area.name}
                </Button>
              ))}
            </div>

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

                {/* Product Texture Overlay */}
                {imageLoaded && selectedArea[mockup.id] && (
                  <div
                    className="absolute z-10"
                    style={{
                      top: OVERLAY_POSITIONS[mockup.id as keyof typeof OVERLAY_POSITIONS][
                        selectedArea[mockup.id] as keyof (typeof OVERLAY_POSITIONS)[keyof typeof OVERLAY_POSITIONS]
                      ].top,
                      left: OVERLAY_POSITIONS[mockup.id as keyof typeof OVERLAY_POSITIONS][
                        selectedArea[mockup.id] as keyof (typeof OVERLAY_POSITIONS)[keyof typeof OVERLAY_POSITIONS]
                      ].left,
                      width:
                        OVERLAY_POSITIONS[mockup.id as keyof typeof OVERLAY_POSITIONS][
                          selectedArea[mockup.id] as keyof (typeof OVERLAY_POSITIONS)[keyof typeof OVERLAY_POSITIONS]
                        ].width,
                      height:
                        OVERLAY_POSITIONS[mockup.id as keyof typeof OVERLAY_POSITIONS][
                          selectedArea[mockup.id] as keyof (typeof OVERLAY_POSITIONS)[keyof typeof OVERLAY_POSITIONS]
                        ].height,
                      opacity:
                        OVERLAY_POSITIONS[mockup.id as keyof typeof OVERLAY_POSITIONS][
                          selectedArea[mockup.id] as keyof (typeof OVERLAY_POSITIONS)[keyof typeof OVERLAY_POSITIONS]
                        ].opacity,
                      backgroundImage: `url(${productImage})`,
                      backgroundRepeat: "repeat",
                      backgroundSize: "200px 200px",
                      mixBlendMode: "multiply",
                    }}
                  />
                )}
              </div>
            </div>

            {/* Simple Instruction */}
            <p className="text-sm text-gray-500 mt-4 text-center">
              This is a simple visualization of how {productName} might look in this space.
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
