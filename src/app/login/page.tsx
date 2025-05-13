"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Feeder login page
 *
 * This page renders a form for the feeder to input their email and password.
 * Upon submission, the form makes a POST request to the /api/feeder/login endpoint
 * with the input credentials. If the request is successful, the page redirects
 * to the feeder dashboard. If the request is not successful, the page displays
 * an error message.
 *
 * The page also includes a link to the feeder registration page.
 *
 * @returns A JSX element representing the feeder login page
 */
/*******  4432a5e3-a902-42ef-8d0c-c8869c67c5a0  *******/
export default function FeederLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Make API call to authenticate feeder
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://evershinebackend-2.onrender.com"}/api/feeder/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        },
      )

      const data = await response.json()

      if (response.ok) {
        // Store authentication state in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("isFeederAuthenticated", "true")
          localStorage.setItem("feederToken", data.data.accessToken)
          localStorage.setItem("feederRefreshToken", data.data.refreshToken)
          localStorage.setItem("feederName", data.data.feeder.name)
        }

        toast({
          title: "Login successful",
          description: `Welcome back, ${data.data.feeder.name}!`,
          variant: "default",
        })

        // Redirect to feeder dashboard
        router.push("/feeder/dashboard")
      } else {
        toast({
          title: "Login failed",
          description: data.message || "Invalid email or password.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-6">
            <Image src="/logo.png" alt="Evershine Logo" width={180} height={100} priority />
          </div>
          <CardTitle className="text-2xl font-bold text-blue">Feeder Login</CardTitle>
          <CardDescription>Enter your credentials to access the feeder dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button variant="link" className="p-0 h-auto text-xs text-blue" type="button">
                  Forgot password?
                </Button>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full bg-blue hover:bg-blue/90 text-white" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Button variant="link" className="p-0 h-auto text-blue" onClick={() => router.push("/feeder/register")}>
              Register
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
