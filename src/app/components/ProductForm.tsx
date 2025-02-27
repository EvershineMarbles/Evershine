"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ArrowLeft, Plus, Loader2, Download, X } from "lucide-react"
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
    applicationAreas: string[]
    description?: string
    image: string[]
  }
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_IMAGES = 10 // Updated to 10 images
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

const formSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  category: z.string().min(1, "Please select a category"),
  price: z.string().min(1, "Price is required"),
  quantityAvailable: z.string().min(1, "Quantity is required"),
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
  const [selectedAreas, setSelectedAreas] = useState<string[]>(initialData?.applicationAreas || [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      category: initialData?.category || "",
      price: initialData?.price || "",
      quantityAvailable: initialData?.quantityAvailable || "",
      applicationAreas: initialData?.applicationAreas || [],
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
      const totalImages = previews.length + fileArray.length

      if (totalImages > MAX_IMAGES) {
        setMessage({ text: `You can only upload up to ${MAX_IMAGES} images`, type: "error" })
        return
      }

      const validFiles = fileArray.filter(validateImage)
      if (validFiles.length !== fileArray.length) return

      setImages((prev) => [...prev, ...validFiles])

      const newPreviews = validFiles.map((file) => URL.createObjectURL(file))
      setPreviews((prev) => [...prev, ...newPreviews])
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

  const handleAreaToggle = (area: string) => {
    setSelectedAreas((prev) => {
      const newAreas = prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
      form.setValue("applicationAreas", newAreas)
      return newAreas
    })
  }

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      setMessage(null)

      if (previews.length === 0) {
        throw new Error("You must have at least one image")
      }

      const formData = new FormData()

      Object.entries(values).forEach(([key, value]) => {
        if (key === "applicationAreas") {
          formData.append(key, JSON.stringify(value))
        } else if (value) {
          formData.append(key, value.toString())
        }
      })

      if (mode === "edit") {
        formData.append("existingImages", JSON.stringify(previews))
        if (images.length > 0) {
          images.forEach((image) => formData.append("newImages", image))
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
          setSelectedAreas([])
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

  const generateQRCode = async (text: string) => {
    try {
      return await QRCode.toDataURL(text)
    } catch (err) {
      console.error(err)
      return ""
    }
  }

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement("a")
      link.href = qrCodeUrl
      link.download = "qrcode.png"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
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
                    <Input
                      className="rounded-md border-[#e3e3e3] h-12 focus:ring-[#194a95]"
                      placeholder="Enter product name"
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Category */}
            <div className="form-field">
              <FormLabel className="text-[#181818] font-bold block mb-2">Category</FormLabel>
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
                          <SelectItem key={category} value={category}>
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

            {/* Price */}
            <div className="form-field">
              <FormLabel className="text-[#181818] font-bold block mb-2">Price</FormLabel>
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <Input
                      type="number"
                      className="rounded-md border-[#e3e3e3] h-12 focus:ring-[#194a95]"
                      placeholder="Enter price"
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Quantity Available */}
            <div className="form-field">
              <FormLabel className="text-[#181818] font-bold block mb-2">Quantity Available</FormLabel>
              <FormField
                control={form.control}
                name="quantityAvailable"
                render={({ field }) => (
                  <FormItem>
                    <Input
                      type="number"
                      className="rounded-md border-[#e3e3e3] h-12 focus:ring-[#194a95]"
                      placeholder="Enter quantity available"
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Image Upload */}
            <div className="form-field">
              <FormLabel className="text-[#181818] font-bold block mb-2">
                Upload Product Images ({previews.length}/{MAX_IMAGES})
              </FormLabel>
              <div className="flex gap-4 flex-wrap items-start">
                {previews.length < MAX_IMAGES && (
                  <label className="block border-2 border-[#383535] rounded-md w-full max-w-[100px] aspect-square cursor-pointer hover:border-[#194a95] transition-colors shrink-0">
                    <div className="flex items-center justify-center h-full">
                      <Plus className="w-8 h-8 text-[#383535]" />
                    </div>
                    <input type="file" onChange={handleImageChange} multiple accept="image/*" className="hidden" />
                  </label>
                )}

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

            {/* Application Areas Multi-Select */}
            <div className="form-field relative z-30">
              <FormLabel className="text-[#181818] font-bold block mb-2">Application Areas</FormLabel>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {APPLICATION_AREAS.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => handleAreaToggle(area)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      selectedAreas.includes(area)
                        ? "border-[#194a95] bg-[#194a95]/10 text-[#194a95]"
                        : "border-gray-200 hover:border-[#194a95]/50"
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
              {form.formState.errors.applicationAreas && (
                <p className="text-sm text-red-500 mt-2">{form.formState.errors.applicationAreas.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="form-field">
              <FormLabel className="text-[#181818] font-bold block mb-2">Description</FormLabel>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <Textarea
                      className="rounded-md border-[#e3e3e3] h-24 focus:ring-[#194a95]"
                      placeholder="Enter product description"
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4">
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
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/products")}
                className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 font-medium h-12 rounded-[20px]"
              >
                Cancel
              </Button>
            </div>

            {message && (
              <Card
                className={`p-4 mt-4 ${message.type === "error" ? "bg-red-100 border-red-500 text-red-700" : "bg-green-100 border-green-500 text-green-700"}`}
              >
                {message.text}
              </Card>
            )}

            {mode === "create" && postId && qrCodeUrl && (
              <div className="mt-6 p-4 border rounded-md">
                <h2 className="text-lg font-semibold mb-2">QR Code</h2>
                <Image
                  src={qrCodeUrl || "/placeholder.svg"}
                  alt="QR Code"
                  width={128}
                  height={128}
                  className="mx-auto mb-4"
                />
                <div className="flex justify-center">
                  <Button
                    onClick={handleDownloadQR}
                    disabled={loading}
                    className="bg-[#194a95] hover:bg-[#0f3a7a] text-white font-medium h-10 rounded-[20px]"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download QR Code
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  )
}

