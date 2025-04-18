"use client"

import { useRef, useEffect, useState } from "react"
import Image from "next/image"
import QRCode from "qrcode"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QRCodeGeneratorProps {
  productId: string
  productName: string
  category?: string
  thickness?: string
  size?: string
}

export default function QRCodeGenerator({
  productId,
  productName,
  category = "",
  thickness = "",
  size = "",
}: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    generateQRCode()
  }, [productId])

  const generateQRCode = async () => {
    try {
      setIsGenerating(true)

      // Generate QR code for the product URL
      const productUrl = `${window.location.origin}/product/${productId}`
      const qrCodeDataUrl = await QRCode.toDataURL(productUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })

      // Create the branded QR code card
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Set canvas dimensions
      canvas.width = 600
      canvas.height = 900

      // Draw the template background
      ctx.fillStyle = "#221e1d"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw the Evershine logo area
      const logoX = canvas.width / 2 - 75
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 36px Arial"
      ctx.textAlign = "center"
      ctx.fillText("EVERSHINE", canvas.width / 2, 200)
      ctx.font = "16px Arial"
      ctx.fillText("MARBLE & EXPORTERS PVT. LTD.", canvas.width / 2, 230)

      // Draw the red strip with "SINCE 1986"
      ctx.fillStyle = "#9d292a"
      ctx.fillRect(canvas.width / 2 - 100, 250, 200, 30)
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 16px Arial"
      ctx.fillText("SINCE 1986", canvas.width / 2, 270)

      // Draw the white card for product details
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(100, 300, 400, 200)

      // Add product details
      ctx.fillStyle = "#000000"
      ctx.textAlign = "left"
      ctx.font = "bold 16px Arial"
      ctx.fillText(`Quality : ${category}`, 120, 330)
      ctx.fillText(`S. No. : ${productId.slice(-6)}     Thickness : ${thickness}`, 120, 360)
      ctx.fillText(`Size : ${size}`, 120, 390)
      ctx.fillText(`Code : ${productId}`, 120, 420)

      // Add the "Marble is Evershine" text
      ctx.fillStyle = "#000000"
      ctx.font = "italic 18px Arial"
      ctx.textAlign = "center"
      ctx.fillText("Marble is Evershine", canvas.width / 2, 460)

      // Add the contact info strip
      ctx.fillStyle = "#9d292a"
      ctx.fillRect(100, 520, 400, 30)
      ctx.fillStyle = "#ffffff"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"
      ctx.fillText("+91 9799909900 | WWW.EVERSHINEMARBLES.IN", canvas.width / 2, 540)

      // Add the "100% Natural" text
      ctx.fillStyle = "#ffe6a3"
      ctx.font = "bold 36px Arial"
      ctx.textAlign = "left"
      ctx.fillText("100%", 120, 590)
      ctx.fillText("Natural", 120, 630)

      // Draw social media icons placeholder
      const iconSize = 24
      const iconSpacing = 30
      const startX = 120
      const iconY = 650

      // Simple circles for social media icons
      const socialIcons = 5
      for (let i = 0; i < socialIcons; i++) {
        ctx.beginPath()
        ctx.arc(startX + i * iconSpacing, iconY, 12, 0, Math.PI * 2)
        ctx.fillStyle = "#ffe6a3"
        ctx.fill()
      }

      // Draw the QR code - Fix: Use HTMLImageElement instead of Image constructor
      const qrCode = document.createElement("img")
      qrCode.crossOrigin = "anonymous"
      qrCode.onload = () => {
        ctx.drawImage(qrCode, 400, 560, 150, 150)

        // Add the footer text
        ctx.fillStyle = "#9d292a"
        ctx.fillRect(100, 700, 400, 50)
        ctx.fillStyle = "#ffffff"
        ctx.font = "12px Arial"
        ctx.textAlign = "center"
        ctx.fillText("MINES OWNER | PROCESSOR | WHOLESALER", canvas.width / 2, 720)
        ctx.fillText("IMPORTER | EXPORTER", canvas.width / 2, 740)

        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL("image/png")
        setQrCodeUrl(dataUrl)
        setIsGenerating(false)
      }
      qrCode.src = qrCodeDataUrl
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
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {isGenerating ? (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#194a95] mb-4" />
          <p>Generating QR code...</p>
        </div>
      ) : (
        <>
          <div className="mb-6 border rounded-lg overflow-hidden shadow-lg">
            <Image
              src={qrCodeUrl || "/placeholder.svg"}
              alt="Product QR Code"
              width={300}
              height={450}
              className="object-contain"
            />
          </div>
          <Button
            onClick={handleDownload}
            className="bg-[#194a95] hover:bg-[#0f3a7a] text-white flex items-center gap-2 px-6 py-2"
          >
            <Download className="w-5 h-5" />
            Download QR Code
          </Button>
        </>
      )}
    </div>
  )
}
