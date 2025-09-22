"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { QrCode, Search, Package, Shield } from "lucide-react"
import { Link } from "react-router-dom"
import axios from "axios"
import BatchCard from "../BatchCard"
import type { Batch } from "../../types"

const ConsumerDashboard: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchBatches = async () => {
    try {
      const response = await axios.get("/api/batches")
      setBatches(response.data.batches)
    } catch (error) {
      console.error("Failed to fetch batches:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBatches()
  }, [])

  const filteredBatches = batches.filter(
    (batch) =>
      batch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.variety?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Consumer Dashboard</h1>
        <p className="text-gray-600">Track your food's journey from farm to table</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/scanner" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="bg-primary-100 rounded-full p-3">
              <QrCode className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Scan QR Code</h3>
              <p className="text-gray-600">Scan a product QR code to trace its journey</p>
            </div>
          </div>
        </Link>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-accent-100 rounded-full p-3">
              <Shield className="h-6 w-6 text-accent-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Verified Products</h3>
              <p className="text-gray-600">
                {batches.filter((b) => b.events?.some((e) => e.txHash)).length} blockchain verified
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product name, batch ID, or variety..."
            className="flex-1 border-none outline-none text-gray-900 placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Available Products */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Products</h2>
        {filteredBatches.length === 0 ? (
          <div className="card text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No products found" : "No products available"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Check back later for new products"}
            </p>
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="btn-outline">
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBatches.map((batch) => (
              <BatchCard key={batch.id} batch={batch} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ConsumerDashboard
