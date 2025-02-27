"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  status: "pending" | "approved" | "draft"
}

const ProductsPage = () => {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Fetch products from API endpoint
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error("Could not fetch products:", error)
      }
    }

    fetchProducts()
  }, [])

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="container mx-auto p-8">
      <button
        onClick={() => router.push("/admin")}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>

      {/* Header with Search and Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-4xl font-bold text-[#181818]">All Products</h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search Product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 w-full md:w-[300px] rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#194a95] focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={() => router.push("/add-product")}
            className="px-6 py-3 rounded-lg bg-[#194a95] text-white w-full md:w-auto justify-center
                     hover:bg-[#0f3a7a] transition-colors active:transform active:scale-95"
          >
            Add New Product
          </button>
        </div>
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={product.imageUrl || "/placeholder.svg"} alt={product.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-800">{product.name}</h2>
              <p className="text-gray-600 text-sm">{product.description}</p>
              <p className="text-gray-900 font-bold">${product.price}</p>
              <p className="text-gray-500">Status: {product.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductsPage

