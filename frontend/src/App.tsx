"use client"
import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import DashboardPage from "./pages/DashboardPage"
import LandingPage from "./pages/LandingPage"
import TracePage from "./pages/TracePage"
import ScannerPage from "./pages/ScannerPage"
import LoadingSpinner from "./components/LoadingSpinner"

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
        <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
        <Route path="/trace/:batchId" element={<TracePage />} />
        <Route path="/scanner" element={<ScannerPage />} />
      </Routes>
    </div>
  )
}

export default App
