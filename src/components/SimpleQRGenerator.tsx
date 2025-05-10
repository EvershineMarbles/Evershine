"use client"

import { useState } from "react"
import QRCode from "qrcode"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import Image from "next/image"

interface SimpleQRGeneratorProps {
  productId: string
}

export default function SimpleQRGenerator({ productId }: SimpleQRGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)

  const generateQRCode = async () => {
    try {
      setIsGenerating(true)

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
      setIsGenerating(false)
    } catch (error) {
      console.error("Error generating QR code:", error)
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!qrCodeUrl) return

    const link = document.createElement("a")
    link.href = qrCodeUrl
    link.download = `evershine-product-${productId}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col items-center">
      {!qrCodeUrl ? (
        <Button onClick={generateQRCode} className="bg-[#194a95] hover:bg-[#0f3a7a] text-white" disabled={isGenerating}>
          Generate QR Code
        </Button>
      ) : (
        <>
          <div className="mb-6 border rounded-lg overflow-hidden shadow-lg p-4 bg-white">
            <Image
              src={qrCodeUrl || "/placeholder.svg"}
              alt="Product QR Code"
              width={300}
              height={300}
              className="object-contain"
            />
            <p className="text-center mt-2 text-sm text-gray-500">Product ID: {productId}</p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={handleDownload}
              className="bg-[#194a95] hover:bg-[#0f3a7a] text-white flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download QR
            </Button>
            <Button onClick={() => setQrCodeUrl("")} variant="outline">
              Generate New
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
