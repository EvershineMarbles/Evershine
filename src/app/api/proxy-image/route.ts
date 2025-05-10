import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")

  if (!url) {
    return new NextResponse("Missing URL parameter", { status: 400 })
  }

  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      return new NextResponse(`Failed to fetch image: ${response.statusText}`, { 
        status: response.status 
      })
    }
    
    const blob = await response.blob()

    // Return the image with appropriate headers
    return new NextResponse(blob, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch (error) {
    console.error("Error proxying image:", error)
    return new NextResponse("Failed to fetch image", { status: 500 })
  }
}
