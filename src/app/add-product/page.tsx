"use client"

import ProductForm from "@/app/components/ProductForm"
import ProtectedRoute from "@/components/ProtectedRoute"
import FeederLayout from "@/components/FeederLayout"

function AddProduct() {
  return (
    <main className="min-h-screen bg-white">
      <ProductForm />
    </main>
  )
}

export default function ProtectedAddProductPage() {
  return (
    <ProtectedRoute>
      <FeederLayout>
        <AddProduct />
      </FeederLayout>
    </ProtectedRoute>
  )
}
