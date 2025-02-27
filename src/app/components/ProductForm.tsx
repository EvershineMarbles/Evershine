"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Plus, Loader2, Download, X } from 'lucide-react'
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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

type Category = typeof CATEGORIES[number]
type ApplicationArea = typeof APPLICATION_AREAS[number]

interface MessageState {
  text: string
  type: 'error' | 'success'
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

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

const formSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  category: z.string().min(1, "Please select a category"),
  price: z.string().min(1, "Price is required"),
  quantityAvailable: z.string().min(1, "Quantity is required"),
  applicationAreas: z.string().min(1, "Please select an application area"),
  description: z.string().optional(),
})

export default function ProductForm() {
  const router = useRouter()
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<MessageState | null>(null)
  const [postId, setPostId] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      price: "",
      quantityAvailable: "",
      applicationAreas: "",
      description: "",
    },
  })

  const validateImage = (file: File): boolean => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setMessage({ text: "Invalid file type. Only JPG, PNG and WebP are allowed", type: 'error' })
      return false
    }

    if (file.size > MAX_FILE_SIZE) {
      setMessage({ text: "File size too large. Maximum size is 5MB", type: 'error' })
      return false
    }

    return true
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files)
      
      if (fileArray.length > 4) {
        setMessage({ text: "You can only upload up to 4 images", type: 'error' })
        return
      }

      // Validate each file
      const validFiles = fileArray.filter(validateImage)
      if (validFiles.length !== fileArray.length) return

      setImages(validFiles)

      // Create preview URLs
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file))
      setPreviews((prev) => {
        prev.forEach((url) => URL.revokeObjectURL(url))
        return newPreviews
      })
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
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
      setPostId(null)
      setQrCodeUrl("")

      if (images.length === 0) {
        throw new Error("You must upload at least one image")
      }

      const formData = new FormData()

      Object.entries(values).forEach(([key, value]) => {
        if (value) formData.append(key, value.toString())
      })

      images.forEach((image) => {
        formData.append("images", image)
      })

      const response = await axios.post<ApiResponse>(
        `${API_URL}/api/create-post`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      )

      if (response.data.success && response.data.data?.postId) {
        const newPostId = response.data.data.postId
        setPostId(newPostId)
        const qrCode = await generateQRCode(newPostId)
        setQrCodeUrl(qrCode)
        setMessage({ text: "Product created successfully!", type: 'success' })
        
        form.reset()
        setImages([])
        setPreviews([])
      } else {
        throw new Error(response.data.msg || "Failed to create product")
      }
    } catch (error) {
      let errorMessage = "Error creating product"
      
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.msg || error.message
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
      setMessage({ text: errorMessage, type: 'error' })
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto bg-white min-h-screen">
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
                        <SelectTrigger 
                          className="rounded-md border-[#e3e3e3] h-12 focus:ring-[#194a95]"
                        >
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
            <div className="form-field relative z-30">
              <FormLabel className="text-[#181818] font-bold block mb-2">Application Areas</FormLabel>
              <FormField
                control={form.control}
                name="applicationAreas"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger 
                          className="rounded-md border-[#e3e3e3] h-12 focus:ring-[#194a95]"
                        >
                          <SelectValue placeholder="Select application area" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent
                        className="bg-white border rounded-md shadow-lg z-50"
                        position="popper"
                        sideOffset={5}
                      >
                        {APPLICATION_AREAS.map((area) => (
                          <SelectItem
                            key={area}
                            value={area}
                            className="px-3 py-2 focus:bg-gray-100 cursor-pointer hover:bg-gray-50"
                          >
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
            {postId && qrCodeUrl && (
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
                type="submit"
                disabled={loading}
                className="w-full bg-[#194a95] hover:bg-[#0f3a7a] text-white font-medium h-12 rounded-[20px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Product"
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full border-[#e3e3e3] text-[#181818] font-medium h-12 rounded-[20px] hover:bg-gray-50"
              >
                Draft
              </Button>
            </div>

            {/* Message Display */}
            {message && !qrCodeUrl && (
              <div className={`text-center mt-4 ${
                message.type === 'error' ? 'text-red-500' : 'text-green-500'
              }`}>
                {message.text}
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  )
}