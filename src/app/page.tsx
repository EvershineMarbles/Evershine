"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg flex flex-col items-center px-4">
        {/* Logo */}
        <div className="mb-8">
          <div className="relative w-[292px] h-[266px]">
            <Image src="/assets/logo2.png" alt="Evershine Logo" fill className="object-contain" priority />
          </div>
        </div>

        {/* Button */}
        <div className="w-full space-y-5">
          <button
            onClick={() => router.push("https://evershine-agent.vercel.app/admin/login")}
            className="w-full py-5 bg-[rgb(25,74,149)] text-white text-lg font-medium rounded-[10px] hover:bg-[rgb(25,74,149)]/90 transition-all shadow-lg hover:shadow-xl"
          >
            Admin Panel
          </button>

          <button
            onClick={() => router.push("/products")}
            className="w-full py-5 bg-[rgb(25,74,149)] text-white text-lg font-medium rounded-[10px] hover:bg-[rgb(25,74,149)]/90 transition-all shadow-lg hover:shadow-xl"
          >
            Feeder
          </button>

          <button
            onClick={() => router.push("https://evershine-agent.vercel.app/agent-login")}
            className="w-full py-5 bg-[rgb(25,74,149)] text-white text-lg font-medium rounded-[10px] hover:bg-[rgb(25,74,149)]/90 transition-all shadow-lg hover:shadow-xl"
          >
            Advisor
          </button>
        </div>
      </div>
    </div>
  )
}
