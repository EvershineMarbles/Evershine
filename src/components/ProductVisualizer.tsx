"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

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
    id: "bedroom-green",
    name: "Bedroom (Green)",
    src: "/assets/mockups/bedroom-green-mockup.png",
  },
  {
    id: "living-room",
    name: "Living Room",
    src: "/assets/mockups/living-room-mockup.png",
  },
  {
    id: "luxury-living",
    name: "Luxury Living",
    src: "/assets/mockups/luxury-living-mockup.png",
  },
  {
    id: "modern-bedroom",
    name: "Modern Bedroom",
    src: "/assets/mockups/modern-bedroom-mockup.png",
  },
  {
    id: "minimalist",
    name: "Minimalist",
    src: "/assets/mockups/minimalist-mockup.png",
  },
]

export default function ProductVisualizer({ productImage, productName }: ProductVisualizerProps) {
  const [activeTab, setActiveTab] = useState<string>(MOCKUPS[0].id)
  const [loading, setLoading] = useState(true)
  const [imageDimensions, setImageDimensions] = useState<Record<string, { width: number; height: number }>>({})

  useEffect(() => {
    // Set a timeout to simulate loading and ensure the DOM is ready
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    // Preload images to get their dimensions
    MOCKUPS.forEach((mockup) => {
      const img = document.createElement("img")
      img.onload = () => {
        setImageDimensions((prev) => ({
          ...prev,
          [mockup.id]: {
            width: img.width,
            height: img.height,
          },
        }))
      }
      img.src = mockup.src
    })

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6">Product Visualizer</h2>

      <Tabs defaultValue={MOCKUPS[0].id} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-6">
          {MOCKUPS.map((mockup) => (
            <TabsTrigger key={mockup.id} value={mockup.id} className="text-sm">
              {mockup.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {MOCKUPS.map((mockup) => (
          <TabsContent key={mockup.id} value={mockup.id} className="mt-0">
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="relative rounded-lg overflow-hidden bg-white border">
                {loading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#194a95]"></div>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <div
                      className="relative"
                      style={{
                        backgroundImage: `url(${productImage})`,
                        backgroundRepeat: "repeat",
                        backgroundSize: "200px 200px",
                      }}
                    >
                      {/* Mockup image with transparent areas */}
                      <img
                        src={mockup.src || "/placeholder.svg"}
                        alt={`${mockup.name} mockup with ${productName}`}
                        className="max-w-full h-auto"
                        style={{ display: "block" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-500 mt-4 text-center">
                This is a visualization of how {productName} might look in this space.
              </p>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
