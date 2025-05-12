/**
 * Feeder authentication utility functions
 */

/**
 * Login a feeder
 */
export const loginFeeder = async (email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feeder/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Failed to login");
      }
  
      // Store tokens in localStorage
      localStorage.setItem("feederAccessToken", data.data.accessToken);
      localStorage.setItem("feederRefreshToken", data.data.refreshToken);
      
      // Store feeder info
      localStorage.setItem("feederInfo", JSON.stringify({
        feederId: data.data.feeder.feederId,
        name: data.data.feeder.name,
        email: data.data.feeder.email,
      }));
  
      return { success: true, data: data.data };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };
  
  /**
   * Register a new feeder
   */
  export const registerFeeder = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feeder/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Failed to register");
      }
  
      return { success: true, data: data.data };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };
  
  /**
   * Logout a feeder
   */
  export const logoutFeeder = () => {
    localStorage.removeItem("feederAccessToken");
    localStorage.removeItem("feederRefreshToken");
    localStorage.removeItem("feederInfo");
  };
  
  /**
   * Get feeder info from localStorage
   */
  export const getFeederInfo = () => {
    if (typeof window === "undefined") return null;
    
    const feederInfo = localStorage.getItem("feederInfo");
    return feederInfo ? JSON.parse(feederInfo) : null;
  };
  
  /**
   * Check if feeder is logged in
   */
  export const isFeederLoggedIn = () => {
    if (typeof window === "undefined") return false;
    
    return !!localStorage.getItem("feederAccessToken");
  };
  
  /**
   * Get feeder token
   */
  export const getFeederToken = () => {
    if (typeof window === "undefined") return null;
    
    return localStorage.getItem("feederAccessToken");
  };
  
  /**
   * Get feeder headers for authenticated requests
   */
  export const getFeederAuthHeaders = () => {
    const token = getFeederToken();
    return {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    };
  };
  
  /**
   * Refresh feeder token
   */
  export const refreshFeederToken = async () => {
    try {
      const refreshToken = localStorage.getItem("feederRefreshToken");
      
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feeder/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Failed to refresh token");
      }
  
      // Update tokens in localStorage
      localStorage.setItem("feederAccessToken", data.accessToken);
      
      if (data.refreshToken) {
        localStorage.setItem("feederRefreshToken", data.refreshToken);
      }
  
      return { success: true, accessToken: data.accessToken };
    } catch (error: any) {
      // If refresh fails, log the user out
      logoutFeeder();
      return { success: false, message: error.message };
    }
  };
  
  /**
   * Make authenticated API request with token refresh on 401
   */
  export const feederApiRequest = async (url: string, options: RequestInit = {}) => {
    try {
      // Add auth headers to the request
      const headers = {
        ...options.headers,
        ...getFeederAuthHeaders(),
      };
  
      // Make the request
      let response = await fetch(url, {
        ...options,
        headers,
      });
  
      // If unauthorized, try to refresh the token and retry
      if (response.status === 401) {
        const refreshResult = await refreshFeederToken();
        
        if (refreshResult.success) {
          // Retry the request with the new token
          response = await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              ...getFeederAuthHeaders(), // Get updated headers with new token
            },
          });
        } else {
          throw new Error("Session expired. Please login again.");
        }
      }
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }
  
      return { success: true, data };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };