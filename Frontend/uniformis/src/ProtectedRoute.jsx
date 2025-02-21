import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
    const user = localStorage.getItem('user')
    const navigate = useNavigate()

    useEffect(() => {
        if (!user) {
            navigate('/')  // Redirect to home if user is not logged in
        }
    }, [user, navigate])

    return user ? children : null
}

export default ProtectedRoute
