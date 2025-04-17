"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="w-full max-w-lg flex flex-col items-center px-4">
        {/* Logo */}
        <div className="mb-8">
          <div className="relative w-[292px] h-[266px]">
            <Image src="/assets/logo2.png" alt="Evershine Logo" fill className="object-contain" priority />
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full space-y-4">
          <button
            onClick={() => router.push("https://evershine-agent.vercel.app/")}
            className="w-full py-4 bg-[#194a95] text-white text-lg font-medium rounded-md hover:bg-[#194a95]/90 transition-colors"
          >
            Admin Panel
          </button>

          <button
            onClick={() => router.push("/admin-panel")}
            className="w-full py-4 bg-[#194a95] text-white text-lg font-medium rounded-md hover:bg-[#194a95]/90 transition-colors"
          >
            Feeder
          </button>

          <button className="w-full py-4 bg-[#194a95] text-white text-lg font-medium rounded-md hover:bg-[#194a95]/90 transition-colors opacity-90 cursor-not-allowed">
            Advisor
          </button>
        </div>
      </div>
    </div>
  )
}
