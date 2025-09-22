"use client"

import type React from "react"
import { useAuth } from "../contexts/AuthContext"
import FarmerDashboard from "../components/dashboards/FarmerDashboard"
import DistributorDashboard from "../components/dashboards/DistributorDashboard"
import RetailerDashboard from "../components/dashboards/RetailerDashboard"
import ConsumerDashboard from "../components/dashboards/ConsumerDashboard"
import Header from "../components/Header"

const DashboardPage: React.FC = () => {
  const { user } = useAuth()

  const renderDashboard = () => {
    switch (user?.role) {
      case "FARMER":
        return <FarmerDashboard />
      case "DISTRIBUTOR":
        return <DistributorDashboard />
      case "RETAILER":
        return <RetailerDashboard />
      case "CONSUMER":
        return <ConsumerDashboard />
      default:
        return <div>Unknown role</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">{renderDashboard()}</div>
      </main>
    </div>
  )
}

export default DashboardPage
