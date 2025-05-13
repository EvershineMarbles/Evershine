"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
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
    src: "/assets/mockups/bathroom.png",
  },
  {
    id: "bedroom-green",
    name: "Bedroom (Green)",
    src: "/assets/mockups/bedroom-green.png",
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
    id: "modern-bedroom",
    name: "Modern Bedroom",
    src: "/assets/mockups/modern-bedroom.png",
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
                    {/* Container with fixed dimensions */}
                    <div
                      className="relative"
                      style={{
                        width: "400px",
                        height: "550px",
                        maxWidth: "100%",
                      }}
                    >
                      {/* Base mockup image */}
                      <Image
                        src={mockup.src || "/placeholder.svg"}
                        alt={`${mockup.name} mockup`}
                        fill
                        className="object-contain"
                        style={{ objectFit: "contain" }}
                      />

                      {/* Product texture overlay - will be masked by the mockup's transparent areas */}
                      <div
                        className="absolute inset-0 z-[-1]"
                        style={{
                          backgroundImage: `url(${productImage})`,
                          backgroundRepeat: "repeat",
                          backgroundSize: "200px 200px",
                        }}
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
