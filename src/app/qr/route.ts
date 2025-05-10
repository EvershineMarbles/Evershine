import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// Hardcoded URLs for testing - both pointing to the same agent app
const AGENT_APP_URL = "https://evershine-agent.vercel.app"
const ADMIN_APP_URL = "https://evershine-agent.vercel.app"

// Simplified role check for testing
function getUserRole(token: string | undefined): string {
  // In a real implementation, you would verify the JWT token
  // For now, we'll use a simple check based on the token value
  if (!token) return "public"

  // Mock logic - in reality, you would decode the JWT
  if (token.includes("admin")) return "admin"
  if (token.includes("agent")) return "agent"
  return "public"
}

export async function GET(request: Request) {
  try {
    // Get the product ID from the URL
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ success: false, message: "Product ID is required" }, { status: 400 })
    }

    // Get the authentication token from cookies - using await since cookies() is now async
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    // Get user role (simplified for testing)
    const userRole = getUserRole(token)

    console.log(`Routing user with role: ${userRole} to product: ${productId}`)

    // Determine the redirect URL based on user role
    let redirectUrl

    if (userRole === "admin") {
      // Admin URL format: /admin/dashboard/product/{productId}
      redirectUrl = `${ADMIN_APP_URL}/admin/dashboard/product/${productId}`
    } else if (userRole === "agent") {
      // Agent URL format: /client-dashboard/{clientId}/product/{productId}
      const clientId = "1745776105921559"
      redirectUrl = `${AGENT_APP_URL}/client-dashboard/${clientId}/product/${productId}`
    } else {
      // Public URL - add ?qr=true to indicate it came from a QR code
      redirectUrl = `${request.headers.get("origin") || "https://evershine-two.vercel.app"}/product/${productId}?qr=true`
    }

    console.log(`Redirecting to: ${redirectUrl}`)
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error("QR routing error:", error)
    return NextResponse.json({ success: false, message: "Error processing QR code" }, { status: 500 })
  }
}
