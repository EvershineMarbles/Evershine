"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import QRCode from "qrcode"
import Image from "next/image"

export default function QRTestCookiesPage() {
  const [productId, setProductId] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [role, setRole] = useState<"admin" | "agent" | "public">("public")

  const setCookie = (role: "admin" | "agent" | "public") => {
    if (role === "public") {
      // Clear the cookie
      document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    } else {
      // Set a cookie with the role
      const value = role === "admin" ? "admin-token" : "agent-token"
      document.cookie = `auth_token=${value}; path=/; max-age=3600`
    }
    setRole(role)
  }

  const generateQR = async () => {
    if (!productId) return

    try {
      // Generate QR code for the router endpoint
      const qrRouterUrl = `${window.location.origin}/api/qr?productId=${productId}`

      const qrCodeDataUrl = await QRCode.toDataURL(qrRouterUrl, {
        width: 300,
        margin: 10,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })

      setQrCodeUrl(qrCodeDataUrl)
    } catch (error) {
      console.error("Error generating QR code:", error)
    }
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">QR Routing Test with Cookies</h1>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">1. Set User Role</h2>
          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => setCookie("admin")}
              variant={role === "admin" ? "default" : "outline"}
              className={role === "admin" ? "bg-[#194a95]" : ""}
            >
              Admin
            </Button>
            <Button
              onClick={() => setCookie("agent")}
              variant={role === "agent" ? "default" : "outline"}
              className={role === "agent" ? "bg-[#194a95]" : ""}
            >
              Agent
            </Button>
            <Button
              onClick={() => setCookie("public")}
              variant={role === "public" ? "default" : "outline"}
              className={role === "public" ? "bg-[#194a95]" : ""}
            >
              Public
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Current role: <span className="font-medium">{role}</span>
          </p>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">2. Enter Product ID</h2>
          <div className="flex gap-2">
            <Input
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="Enter product ID"
              className="flex-1"
            />
            <Button onClick={generateQR} className="bg-[#194a95]">
              Generate
            </Button>
          </div>
        </Card>

        {qrCodeUrl && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">3. Scan QR Code</h2>
            <div className="flex justify-center mb-4">
              <div className="border rounded-lg p-2 bg-white">
                <Image
                  src={qrCodeUrl || "/placeholder.svg"}
                  alt="QR Code"
                  width={250}
                  height={250}
                  className="object-contain"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center">
              This QR code will redirect to the {role} view for product ID: {productId}
            </p>
            <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs text-gray-600">
              <p className="font-medium mb-1">Expected redirect:</p>
              {role === "admin" && (
                <p className="break-all">https://evershine-agent.vercel.app/admin/dashboard/product/{productId}</p>
              )}
              {role === "agent" && (
                <p className="break-all">
                  https://evershine-agent.vercel.app/client-dashboard/1745776105921559/product/{productId}
                </p>
              )}
              {role === "public" && (
                <p className="break-all">
                  {window.location.origin}/product/{productId}?qr=true
                </p>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
