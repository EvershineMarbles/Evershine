"use client"

import Link from "next/link"
import { Plus } from 'lucide-react'

export default function AdminPanel() {
  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
      <div className="max-w-lg mx-auto space-y-6 sm:space-y-8">
        {/* Greeting */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-bold text-black">HELLO,</h1>
          <h2 className="text-3xl sm:text-4xl font-bold text-black">Feeder</h2>
        </div>

        {/* Navigation Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Link 
            href="/products" 
            className="bg-black text-white p-4 sm:p-6 rounded hover:bg-black/90 transition-colors flex items-center justify-center"
          >
            <span className="text-lg sm:text-xl font-medium">All Products</span>
          </Link>

          <Link 
            href="/agents" 
            className="bg-black text-white p-4 sm:p-6 rounded hover:bg-black/90 transition-colors flex items-center justify-center"
          >
            <span className="text-lg sm:text-xl font-medium"></span>
          </Link>
        </div>

        {/* Add Product Button */}
        <Link
          href="/add-product"
          className="bg-[#C41E3A] text-white p-4 sm:p-5 rounded hover:bg-[#a01830] transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-lg sm:text-xl font-medium">Add New Product</span>
        </Link>
      </div>
    </div>
  )
}