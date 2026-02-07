import React from 'react'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
  // Check if accessToken exists in localStorage
  // The actual token is also in cookies (sent by backend)
  const accessToken = localStorage.getItem("accessToken")
  const isAuthenticated = accessToken && accessToken.trim().length > 0

  if (!isAuthenticated) {
    return <Navigate to="/userSignIn" replace />
  }

  return children
}

export default ProtectedRoute
