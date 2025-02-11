"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import axiosInstance from "../../../axiosconfig";
import logo from '../../../assets/logo.png';

const ResetPassword = () => {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Get token from URL query parameters
  const searchParams = new URLSearchParams(location.search)
  const token = searchParams.get("token")

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      const response = await axiosInstance.post("/password_reset/confirm/", {
        token: token,
        password: password,
      })
      setSuccess(true)
      setTimeout(() => {
        navigate("/login")
      }, 3000)
    } catch (err) {
      setError("Failed to reset password. Please try again.")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="Uniformis Shoppe Logo"
            className="mx-auto mb-6 h-12"
          />
          <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm the password"
              className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && <p className="text-red-600 text-center">{error}</p>}
          {success && <p className="text-green-600 text-center">Password reset successful! Redirecting to login...</p>}

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            Reset password
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword

