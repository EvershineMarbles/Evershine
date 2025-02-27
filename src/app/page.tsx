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
        <div className="w-full space-y-3">
          <button
            onClick={() => router.push("/admin-panel")}
            className="w-full py-4 bg-black text-white text-lg rounded hover:bg-black/90 transition-colors"
          >
            Admin Panel
          </button>

          <button className="w-full py-4 bg-black text-white text-lg rounded opacity-90 cursor-not-allowed">
            Feeder
          </button>

          <button className="w-full py-4 bg-black text-white text-lg rounded opacity-90 cursor-not-allowed">
            Client Advisor
          </button>
        </div>
      </div>
    </div>
  )
}

