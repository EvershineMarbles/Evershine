"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ArrowLeft, Plus, Loader2, Download, X } from 'lucide-react'
import { useRouter } from "next/navigation"
import axios, { AxiosError } from "axios"
import QRCode from "qrcode"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const CATEGORIES = [
  "Imported Marble",
  "Imported Granite",
  "Exotics",
  "Onyx",
  "Travertine",
  "Indian Marble",
  "Indian Granite",
  "Semi Precious Stone",
  "Quartzite",
  "Sandstone",
] as const

const APPLICATION_AREAS = ["Flooring", "Countertops", "Walls", "Exterior", "Interior"] as const

type Category = (typeof CATEGORIES)[number]
type ApplicationArea = (typeof APPLICATION_AREAS)[number]

interface MessageState {
  text: string
  type: "error" | "success"
}

interface FormValues extends z.infer<typeof formSchema> {
  images?: FileList
}

interface ApiResponse {
  success: boolean
  msg?: string
  data?: {
    postId: string
    [key: string]: any
  }
}

interface ProductFormProps {
  mode?: "create" | "edit"
  initialData?: {
    _id: string
    postId: string
    name: string
    category: string
    price: string
    quantityAvailable: string
    size?: string
    numberOfPieces?: string
    thickness?: string
    applicationAreas: string
    description?: string
    image: string[]
  }
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

const formSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  category: z.string().min(1, "Please select a category"),
  price: z.string().min(1, "Price is required"),
  quantityAvailable: z.string().min(1, "Quantity is required"),
  size: z.string().optional(),
  numberOfPieces: z.string().optional(),
  thickness: z.string().optional(),
  applicationAreas: z.array(z.string()).min(1, "Please select at least one application area"),
  description: z.string().optional(),
})

export default function ProductForm({ mode = "create", initialData }: ProductFormProps) {
  const router = useRouter()
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<MessageState | null>(null)
  const [postId, setPostId] = useState<string | null>(initialData?.postId || null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      category: initialData?.category || "",
      price: initialData?.price || "",
      quantityAvailable: initialData?.quantityAvailable || "",
      size: initialData?.size || "",
      numberOfPieces: initialData?.numberOfPieces || "",
      thickness: initialData?.thickness || "",
      applicationAreas: initialData?.applicationAreas ? initialData.applicationAreas.split(",") : [],
      description: initialData?.description || "",
    },
  })

  useEffect(() => {
    if (mode === "edit" && initialData?.image) {
      setPreviews(initialData.image)
    }
  }, [mode, initialData])

  const validateImage = (file: File): boolean => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setMessage({ text: "Invalid file type. Only JPG, PNG and WebP are allowed", type: "error" })
      return false
    }

    if (file.size > MAX_FILE_SIZE) {
      setMessage({ text: "File size too large. Maximum size is 5MB", type: "error" })
      return false
    }

    return true
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files)

      if (fileArray.length > 4) {
        setMessage({ text: "You can only upload up to 4 images", type: "error" })
        return
      }

      const validFiles = fileArray.filter(validateImage)
      if (validFiles.length !== fileArray.length) return

      setImages(validFiles)

      const newPreviews = validFiles.map((file) => URL.createObjectURL(file))
      setPreviews((prev) => {
        prev.forEach((url) => URL.revokeObjectURL(url))
        return newPreviews
      })
    }
  }

  const removeImage = (index: number) => {
    if (mode === "edit" && initialData?.image) {
      const newPreviews = [...previews]
      newPreviews.splice(index, 1)
      setPreviews(newPreviews)
    } else {
      setImages((prev) => prev.filter((_, i) => i !== index))
      setPreviews((prev) => {
        URL.revokeObjectURL(prev[index])
        return prev.filter((_, i) => i !== index)
      })
    }
  }

  const generateQRCode = async (postId: string): Promise<string> => {
    try {
      const url = `${window.location.origin}/product/${postId}`
      return await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })
    } catch (error) {
      console.error("Error generating QR code:", error)
      throw new Error("Failed to generate QR code")
    }
  }

  const handleDownloadQR = () => {
    if (!qrCodeUrl || !postId) return

    const link = document.createElement("a")
    link.href = qrCodeUrl
    link.download = `product-qr-${postId}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      setMessage(null)

      if (previews.length === 0) {
        throw new Error("You must have at least one image")
      }

      const formData = new FormData()

      // Convert applicationAreas array to string
      const formValues = {
        ...values,
        applicationAreas: values.applicationAreas.join(","),
      }

      Object.entries(formValues).forEach(([key, value]) => {
        if (value) formData.append(key, value.toString())
      })

      // Handle images based on mode
      if (mode === "edit") {
        formData.append("existingImages", JSON.stringify(previews))
        if (images.length > 0) {
          images.forEach((image) => formData.append("images", image))
        }
      } else {
        images.forEach((image) => formData.append("images", image))
      }

      const endpoint =
        mode === "edit" ? `${API_URL}/api/updateProduct/${initialData?.postId}` : `${API_URL}/api/create-post`

      const response = await axios.post<ApiResponse>(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      if (response.data.success) {
        if (mode === "create" && response.data.data?.postId) {
          const newPostId = response.data.data.postId
          setPostId(newPostId)
          const qrCode = await generateQRCode(newPostId)
          setQrCodeUrl(qrCode)
        }

        setMessage({
          text: mode === "edit" ? "Product updated successfully!" : "Product created successfully!",
          type: "success",
        })

        if (mode === "create") {
          form.reset()
          setImages([])
          setPreviews([])
        } else {
          setTimeout(() => router.push("/products"), 1500)
        }
      } else {
        throw new Error(response.data.msg || `Failed to ${mode} product`)
      }
    } catch (error) {
      let errorMessage = `Error ${mode === "edit" ? "updating" : "creating"} product`

      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.msg || error.message
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      setMessage({ text: errorMessage, type: "error" })
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white">
        <div className="p-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>

          <div className="text-center mt-4 mb-6">
            <h1 className="text-3xl font-bold text-[#181818]">
              {mode === "edit" ? "Edit Product" : "Add New Product"}
            </h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-6 pb-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Product Name */}
            <div className="form-field">
              <FormLabel className="text-[#181818] font-bold block mb-2">Product Name</FormLabel>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Enter product name"
                        className="rounded-md border-[#e3e3e3] h-12 focus-visible:ring-[#194a95]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Category */}
            <div className="form-field relative z-40">
              <FormLabel className="text-[#181818] font-bold block mb-2">Select Product Category</FormLabel>
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-md border-[#e3e3e3] h-12 focus:ring-[#194a95]">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent
                        className="bg-white border rounded-md shadow-lg z-50"
                        position="popper"
                        sideOffset={5}
                      >
                        {CATEGORIES.map((category) => (
                          <SelectItem
                            key={category}
                            value={category}
                            className="px-3 py-2 focus:bg-gray-100 cursor-pointer hover:bg-gray-50"
                          >
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Price and Quantity Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-field">
                <FormLabel className="text-[#181818] font-bold block mb-2">Price (per sqft)</FormLabel>
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="per sqft"
                          className="rounded-md border-[#e3e3e3] h-12 focus-visible:ring-[#194a95]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="form-field">
                <FormLabel className="text-[#181818] font-bold block mb-2">Quality Available (in sqft)</FormLabel>
                <FormField
                  control={form.control}
                  name="quantityAvailable"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="in sqft"
                          className="rounded-md border-[#e3e3e3] h-12 focus-visible:ring-[#194a95]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Size, Number of Pieces, and Thickness */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="form-field">
                <FormLabel className="text-[#181818] font-bold block mb-2">Size</FormLabel>
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="e.g., 60x60 cm" 
                          className="rounded-md border-[#e3e3e3] h-12 focus-visible:ring-[#194a95]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="form-field">
                <FormLabel className="text-[#181818] font-bold block mb-2">No. of Pieces</FormLabel>
                <FormField
                  control={form.control}
                  name="numberOfPieces"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter quantity" 
                          className="rounded-md border-[#e3e3e3] h-12 focus-visible:ring-[#194a95]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="form-field">
                <FormLabel className="text-[#181818] font-bold block mb-2">Thickness</FormLabel>
                <FormField
                  control={form.control}
                  name="thickness"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="e.g., 20mm" 
                          className="rounded-md border-[#e3e3e3] h-12 focus-visible:ring-[#194a95]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="form-field">
              <FormLabel className="text-[#181818] font-bold block mb-2">Upload Product Images</FormLabel>
              <div className="flex gap-4 flex-wrap items-start">
                <label className="block border-2 border-[#383535] rounded-md w-full max-w-[100px] aspect-square cursor-pointer hover:border-[#194a95] transition-colors shrink-0">
                  <div className="flex items-center justify-center h-full">
                    <Plus className="w-8 h-8 text-[#383535]" />
                  </div>
                  <input type="file" onChange={handleImageChange} multiple accept="image/*" className="hidden" />
                </label>

                {previews.length > 0 && (
                  <div className="flex gap-4 flex-wrap flex-1">
                    {previews.map((preview, index) => (
                      <div key={index} className="relative w-[100px] aspect-square">
                        <Image
                          src={preview || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          width={100}
                          height={100}
                          className="rounded-md object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Application Areas */}
            <div className="form-field relative z-50">
              <FormLabel className="text-[#181818] font-bold block mb-2">Application Areas</FormLabel>
              <FormField
                control={form.control}
                name="applicationAreas"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Select
                          onValueChange={(value) => {
                            const currentValues = field.value || []
                            const newValues = currentValues.includes(value)
                              ? currentValues.filter((v) => v !== value)
                              : [...currentValues, value]
                            field.onChange(newValues)
                          }}
                          value={field.value?.[field.value.length - 1] || ""}
                        >
                          <SelectTrigger className="w-full rounded-md border-[#e3e3e3] h-12 focus:ring-[#194a95] overflow-visible">
                            <SelectValue>
                              {field.value?.length
                                ? `${field.value.length} area${field.value.length > 1 ? "s" : ""} selected`
                                : "Select application areas"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="bg-white border rounded-md shadow-lg z-50">
                            {APPLICATION_AREAS.map((area) => (
                              <SelectItem
                                key={area}
                                value={area}
                                className={`px-3 py-2 cursor-pointer hover:bg-gray-50 ${
                                  field.value?.includes(area) ? "bg-[#194a95] text-white" : ""
                                }`}
                              >
                                {area}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </FormControl>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {field.value?.map((area) => (
                        <div
                          key={area}
                          className="bg-[#194a95] text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {area}
                          <button
                            type="button"
                            onClick={() => {
                              field.onChange(field.value?.filter((v) => v !== area))
                            }}
                            className="hover:bg-[#0f3a7a] rounded-full p-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <div className="form-field">
              <FormLabel className="text-[#181818] font-bold block mb-2">Description</FormLabel>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Type your description here (optional)"
                        className="min-h-[150px] rounded-md border-[#e3e3e3] focus-visible:ring-[#194a95]"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Success State with QR Code */}
            {postId && qrCodeUrl && mode === "create" && (
              <Card className="p-6 text-center space-y-4 border-green-200 bg-green-50">
                <h3 className="text-lg font-semibold text-green-600">Product Created Successfully!</h3>
                <div className="flex justify-center">
                  <Image
                    src={qrCodeUrl || "/placeholder.svg"}
                    alt="Product QR Code"
                    width={192}
                    height={192}
                    className="w-48 h-48"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleDownloadQR}
                  className="bg-[#194a95] hover:bg-[#0f3a7a] text-white rounded-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR Code
                </Button>
                <p className="text-sm text-gray-500">Scan this QR code to view the product details</p>
                <p className="text-sm font-medium">Product ID: {postId}</p>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="w-full h-12 rounded-[20px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#194a95] hover:bg-[#0f3a7a] text-white font-medium h-12 rounded-[20px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "edit" ? "Updating..." : "Saving..."}
                  </>
                ) : mode === "edit" ? (
                  "Update Product"
                ) : (
                  "Save Product"
                )}
              </Button>
            </div>

            {/* Message Display */}
            {message && (mode === "edit" || !qrCodeUrl) && (
              <div className={`text-center mt-4 ${message.type === "error" ? "text-red-500" : "text-green-500"}`}>
                {message.text}
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  )
}
