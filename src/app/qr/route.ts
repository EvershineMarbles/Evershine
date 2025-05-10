import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// Hardcoded URLs for testing
const AGENT_APP_URL = "https://evershine-agent.vercel.app"
const ADMIN_APP_URL = "https://evershine-agent.vercel.app"
const PUBLIC_APP_URL = "https://evershine-two.vercel.app"

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

    // For testing purposes, let's log the role and product ID
    console.log(`Routing user with role: ${userRole} to product: ${productId}`)

    // Redirect based on user role
    if (userRole === "admin") {
      // Admin URL format: /admin/dashboard/product/{productId}
      return NextResponse.redirect(`${ADMIN_APP_URL}/admin/dashboard/product/${productId}`)
    } else if (userRole === "agent") {
      // Agent URL format: /client-dashboard/{clientId}/product/{productId}
      // Using a hardcoded clientId for testing
      const clientId = "1745776105921559"
      return NextResponse.redirect(`${AGENT_APP_URL}/client-dashboard/${clientId}/product/${productId}`)
    } else {
      // Public URL format: /product/{productId}
      return NextResponse.redirect(`${PUBLIC_APP_URL}/product/${productId}`)
    }
  } catch (error) {
    console.error("QR routing error:", error)
    return NextResponse.json({ success: false, message: "Error processing QR code" }, { status: 500 })
  }
}
