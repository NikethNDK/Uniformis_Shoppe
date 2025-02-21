import axiosInstance from "../axiosconfig"
import { setAuthData, clearAuth } from "../../redux/auth/authSlice"

export const refreshAccessToken = async (dispatch) => {
  try {
    const response = await axiosInstance.post("/token/refresh/")
    if (response.data.access) {
      // Update the access token in the store
      dispatch(setAuthData({ user: response.data.user, isAuthenticated: true }))
      return true
    }
  } catch (error) {
    console.error("Error refreshing token:", error)
    dispatch(clearAuth())
    return false
  }
}

export const checkAuthStatus = async (dispatch) => {
  try {
    const response = await axiosInstance.get("/check-auth-status/")
    if (response.data.isAuthenticated) {
      dispatch(setAuthData({ user: response.data.user, isAuthenticated: true }))
      return true
    }
  } catch (error) {
    console.error("Error checking auth status:", error)
    dispatch(clearAuth())
    return false
  }
}

