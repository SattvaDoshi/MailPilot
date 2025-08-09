import React from 'react'
import { ClipLoader } from 'react-spinners'

const LoadingSpinner = ({ size = 35, color = "#3b82f6", loading = true }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <ClipLoader
        color={color}
        loading={loading}
        size={size}
        aria-label="Loading Spinner"
      />
    </div>
  )
}

export default LoadingSpinner
