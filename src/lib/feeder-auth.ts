// API functions for feeder authentication

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://evershinebackend-2.onrender.com"

export interface FeederLoginData {
  email: string
  password: string
}

export interface FeederRegisterData {
  name: string
  email: string
  password: string
}

export interface FeederAuthResponse {
  success: boolean
  message: string
  data?: {
    feeder: {
      name: string
      email: string
      feederId: string
    }
    accessToken: string
    refreshToken: string
  }
}

/**
 * Login a feeder
 */
export async function loginFeeder(data: FeederLoginData): Promise<FeederAuthResponse> {
  try {
    const response = await fetch(`${API_URL}/api/feeder/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    return await response.json()
  } catch (error) {
    console.error("Error logging in feeder:", error)
    return {
      success: false,
      message: "An error occurred during login. Please try again.",
    }
  }
}

/**
 * Register a new feeder
 */
export async function registerFeeder(data: FeederRegisterData): Promise<FeederAuthResponse> {
  try {
    const response = await fetch(`${API_URL}/api/feeder/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    return await response.json()
  } catch (error) {
    console.error("Error registering feeder:", error)
    return {
      success: false,
      message: "An error occurred during registration. Please try again.",
    }
  }
}

/**
 * Get the current feeder's profile
 */
export async function getFeederProfile(): Promise<any> {
  try {
    // Get token from localStorage
    const token = localStorage.getItem("feederToken")

    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_URL}/api/feeder/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return await response.json()
  } catch (error) {
    console.error("Error getting feeder profile:", error)
    return {
      success: false,
      message: "Failed to get profile information.",
    }
  }
}

/**
 * Check if the user is authenticated as a feeder
 */
export function isFeederAuthenticated(): boolean {
  if (typeof window === "undefined") return false

  const isAuthenticated = localStorage.getItem("isFeederAuthenticated")
  const token = localStorage.getItem("feederToken")

  return isAuthenticated === "true" && !!token
}

/**
 * Logout the feeder
 */
export function logoutFeeder(): void {
  if (typeof window === "undefined") return

  localStorage.removeItem("isFeederAuthenticated")
  localStorage.removeItem("feederToken")
  localStorage.removeItem("feederRefreshToken")
  localStorage.removeItem("feederName")
}
