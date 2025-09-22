"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Truck, Package, Clock, CheckCircle } from "lucide-react"
import axios from "axios"
import BatchCard from "../BatchCard"
import AddEventModal from "../modals/AddEventModal"
import type { Batch } from "../../types"

const DistributorDashboard: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)

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

  const handleEventAdded = () => {
    fetchBatches()
    setShowEventModal(false)
    setSelectedBatch(null)
  }

  const getAvailableBatches = () => {
    return batches.filter((batch) => {
      const latestEvent = batch.events?.[0]
      return !latestEvent || ["CREATED", "PICKED_UP", "IN_TRANSIT"].includes(latestEvent.action)
    })
  }

  const getInTransitBatches = () => {
    return batches.filter((batch) => {
      const latestEvent = batch.events?.[0]
      return latestEvent?.action === "IN_TRANSIT"
    })
  }

  const getDeliveredBatches = () => {
    return batches.filter((batch) => {
      const latestEvent = batch.events?.[0]
      return latestEvent?.action === "DELIVERED"
    })
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Distributor Dashboard</h1>
        <p className="text-gray-600">Manage batch pickups and distribution</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">{getAvailableBatches().length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-orange-100 rounded-full p-3">
              <Truck className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Transit</p>
              <p className="text-2xl font-bold text-gray-900">{getInTransitBatches().length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">{getDeliveredBatches().length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-full p-3">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Handled</p>
              <p className="text-2xl font-bold text-gray-900">{batches.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Batches */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available for Pickup</h2>
        {getAvailableBatches().length === 0 ? (
          <div className="card text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No batches available</h3>
            <p className="text-gray-600">Check back later for new batches ready for pickup</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getAvailableBatches().map((batch) => (
              <div key={batch.id} className="relative">
                <BatchCard batch={batch} />
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => {
                      setSelectedBatch(batch)
                      setShowEventModal(true)
                    }}
                    className="btn-primary text-xs px-3 py-1"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* In Transit Batches */}
      {getInTransitBatches().length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">In Transit</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getInTransitBatches().map((batch) => (
              <div key={batch.id} className="relative">
                <BatchCard batch={batch} />
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => {
                      setSelectedBatch(batch)
                      setShowEventModal(true)
                    }}
                    className="btn-primary text-xs px-3 py-1"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showEventModal && selectedBatch && (
        <AddEventModal
          batch={selectedBatch}
          userRole="DISTRIBUTOR"
          onClose={() => {
            setShowEventModal(false)
            setSelectedBatch(null)
          }}
          onSuccess={handleEventAdded}
        />
      )}
    </div>
  )
}

export default DistributorDashboard
