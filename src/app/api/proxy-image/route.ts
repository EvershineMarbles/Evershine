import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")

  if (!url) {
    // Return a simple SVG placeholder if no URL is provided
    return new NextResponse(
      `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="#f0f0f0"/>
        <path d="M30 40 L50 65 L70 40" stroke="#cccccc" stroke-width="2" fill="none"/>
        <circle cx="50" cy="30" r="10" fill="#cccccc"/>
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
    const response = await fetch(url, {
      headers: {
        Accept: "image/*",
      },
    })

    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.statusText} (${response.status})`)
      // Return a placeholder SVG on error
      return new NextResponse(
        `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
          <rect width="100" height="100" fill="#f0f0f0"/>
          <path d="M30 40 L50 65 L70 40" stroke="#cccccc" stroke-width="2" fill="none"/>
          <circle cx="50" cy="30" r="10" fill="#cccccc"/>
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
        <path d="M30 40 L50 65 L70 40" stroke="#cccccc" stroke-width="2" fill="none"/>
        <circle cx="50" cy="30" r="10" fill="#cccccc"/>
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
