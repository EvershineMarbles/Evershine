import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")

  console.log("Image proxy request for:", url)

  if (!url) {
    console.error("No URL provided to image proxy")
    // Return a simple SVG placeholder if no URL is provided
    return new NextResponse(
      `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="#f0f0f0"/>
        <text x="50" y="50" font-family="Arial" font-size="10" text-anchor="middle" fill="#999">No image URL</text>
      </svg>`,
      {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=86400",
          "Access-Control-Allow-Origin": "*",
        },
      },
    )
  }

  try {
    console.log("Fetching image from:", url)

    const response = await fetch(url, {
      headers: {
        Accept: "image/*",
      },
      // Add a longer timeout for large images
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.statusText} (${response.status})`)
      // Return a placeholder SVG on error
      return new NextResponse(
        `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
          <rect width="100" height="100" fill="#f0f0f0"/>
          <text x="50" y="50" font-family="Arial" font-size="10" text-anchor="middle" fill="#999">Error ${response.status}</text>
        </svg>`,
        {
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, max-age=86400",
            "Access-Control-Allow-Origin": "*",
          },
        },
      )
    }

    const blob = await response.blob()
    console.log("Image fetched successfully, size:", blob.size, "bytes, type:", blob.type)

    // Return the image with appropriate headers
    return new NextResponse(blob, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("Error proxying image:", error)
    // Return a placeholder SVG on error
    return new NextResponse(
      `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="#f0f0f0"/>
        <text x="50" y="50" font-family="Arial" font-size="10" text-anchor="middle" fill="#999">Proxy error</text>
      </svg>`,
      {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=86400",
          "Access-Control-Allow-Origin": "*",
        },
      },
    )
  }
}
