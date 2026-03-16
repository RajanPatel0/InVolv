import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useSearchStore } from '../api/stores/searchStore'

const ProtectedRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const checkAuthStatus = useSearchStore(state => state.checkAuthStatus)

  useEffect(() => {
    // Use the store's auth check method which validates token
    const isAuth = checkAuthStatus()
    setIsAuthenticated(isAuth)
    setIsChecking(false)
  }, [checkAuthStatus])

  if (isChecking) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/userSignIn" replace />
  }

  return children
}

export default ProtectedRoute
