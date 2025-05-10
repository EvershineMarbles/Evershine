"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import SimpleQRGenerator from "@/components/SimpleQRGenerator"

export default function QRTestPage() {
  const [productId, setProductId] = useState("")
  const [showGenerator, setShowGenerator] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (productId) {
      setShowGenerator(true)
    }
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">QR Code Routing Test</h1>

        {!showGenerator ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-1">
                Product ID
              </label>
              <Input
                id="productId"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Enter product ID"
                className="w-full"
                required
              />
            </div>

            <Button type="submit" className="w-full bg-[#194a95] hover:bg-[#0f3a7a]">
              Continue
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <SimpleQRGenerator productId={productId} />

            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-lg font-medium mb-2">Testing Instructions</h2>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Generate and scan the QR code with your phone</li>
                <li>It will redirect to the appropriate URL based on your role</li>
                <li>
                  <strong>For testing different roles:</strong>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Admin: Set a cookie named "auth_token" with value "admin-token"</li>
                    <li>Agent: Set a cookie named "auth_token" with value "agent-token"</li>
                    <li>Public: Don't set any cookie or clear cookies</li>
                  </ul>
                </li>
              </ol>
            </div>

            <Button onClick={() => setShowGenerator(false)} variant="outline" className="w-full">
              Try Another Product ID
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
