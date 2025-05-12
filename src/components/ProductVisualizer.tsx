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
  {
    id: "bathroom-marble",
    name: "Bathroom Marble",
    src: "/assets/mockups/bathroom-marble-mockup.png",
    areas: [
      { id: "floor", name: "Floor" },
      { id: "wall", name: "Wall" },
    ],
  },
]

// Define overlay positions and styles for each mockup and area
const OVERLAY_STYLES = {
  bathroom: {
    wall: {
      position: "absolute",
      top: "0%",
      left: "0%",
      width: "100%",
      height: "60%",
      backgroundImage: "",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      opacity: 0.85,
      mixBlendMode: "multiply",
      zIndex: 10,
    },
    floor: {
      position: "absolute",
      top: "60%",
      left: "0%",
      width: "100%",
      height: "40%",
      backgroundImage: "",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      opacity: 0.7,
      mixBlendMode: "overlay",
      zIndex: 10,
    },
  },
  "living-room": {
    wall: {
      position: "absolute",
      top: "0%",
      left: "0%",
      width: "100%",
      height: "70%",
      backgroundImage: "",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      opacity: 0.3,
      mixBlendMode: "overlay",
      zIndex: 10,
    },
    floor: {
      position: "absolute",
      top: "70%",
      left: "0%",
      width: "100%",
      height: "30%",
      backgroundImage: "",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      opacity: 0.8,
      mixBlendMode: "overlay",
      zIndex: 10,
    },
  },
  "bathroom-marble": {
    wall: {
      position: "absolute",
      top: "0%",
      left: "0%",
      width: "100%",
      height: "65%",
      backgroundImage: "",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      opacity: 0.9,
      mixBlendMode: "multiply",
      zIndex: 10,
    },
    floor: {
      position: "absolute",
      top: "65%",
      left: "0%",
      width: "100%",
      height: "35%",
      backgroundImage: "",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      opacity: 0.8,
      mixBlendMode: "overlay",
      zIndex: 10,
    },
  },
}

export default function ProductVisualizer({ productImage, productName }: ProductVisualizerProps) {
  const [activeTab, setActiveTab] = useState<string>("bathroom")
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

  // Get style for current overlay
  const getOverlayStyle = (mockupId: string, areaId: string) => {
    if (!OVERLAY_STYLES[mockupId as keyof typeof OVERLAY_STYLES]) return {}

    const baseStyle =
      OVERLAY_STYLES[mockupId as keyof typeof OVERLAY_STYLES][
        areaId as keyof (typeof OVERLAY_STYLES)[keyof typeof OVERLAY_STYLES]
      ]

    return {
      ...baseStyle,
      backgroundImage: `url(${productImage})`,
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6">Product Visualizer</h2>

      {/* Tab Headers */}
      <div className="flex border-b mb-6 overflow-x-auto">
        {MOCKUPS.map((mockup) => (
          <button
            key={mockup.id}
            onClick={() => setActiveTab(mockup.id)}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
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
                  priority
                />

                {/* Product Texture Overlay */}
                {imageLoaded && selectedArea[mockup.id] && (
                  <div style={getOverlayStyle(mockup.id, selectedArea[mockup.id])} />
                )}
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
