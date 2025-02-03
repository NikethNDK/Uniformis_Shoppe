import { useState, useEffect } from "react"
import { authApi } from "../../../axiosconfig"
import { toast } from "react-toastify"

const OTPVerificationModal = ({ userId, onSuccess, onCancel }) => {
  const [otp, setOtp] = useState("")
  const [timeLeft, setTimeLeft] = useState(60) // 1 minutes in seconds
  const [error, setError] = useState("")

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const handleVerify = async () => {
    try {
      const response = await authApi.post("/verify-otp/", {
        user_id: userId,
        otp_code: otp,
      })
      onSuccess(response.data)
    } catch (error) {
      setError(error.response?.data?.error || "Verification failed")
      toast.error(error.response?.data?.error || "Verification failed")
    }
  }

  const handleResend = async () => {
    try {
      await authApi.post("/resend-otp/", { user_id: userId })
      setTimeLeft(120)
      setError("")
      toast.success("OTP resent successfully")
    } catch (error) {
      setError("Failed to resend OTP")
      toast.error("Failed to resend OTP")
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
        <p className="mb-4">Enter the OTP sent to your email</p>

        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="w-full p-2 border rounded mb-4"
          maxLength="6"
        />

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="mb-4">
          Time remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(1, "0")}
        </div>

        <div className="flex gap-4">
          <button onClick={handleVerify} className="bg-blue-500 text-white px-4 py-2 rounded">
            Verify
          </button>

          <button
            onClick={handleResend}
            disabled={timeLeft > 0}
            className={`px-4 py-2 rounded ${timeLeft > 0 ? "bg-gray-300" : "bg-green-500 text-white"}`}
          >
            Resend OTP
          </button>

          <button onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default OTPVerificationModal

