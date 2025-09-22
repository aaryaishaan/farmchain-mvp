"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Store, Package, CheckCircle, DollarSign } from "lucide-react"
import axios from "axios"
import BatchCard from "../BatchCard"
import AddEventModal from "../modals/AddEventModal"
import type { Batch } from "../../types"

const RetailerDashboard: React.FC = () => {
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

  const getIncomingBatches = () => {
    return batches.filter((batch) => {
      const latestEvent = batch.events?.[0]
      return latestEvent?.action === "IN_TRANSIT"
    })
  }

  const getInventoryBatches = () => {
    return batches.filter((batch) => {
      const latestEvent = batch.events?.[0]
      return latestEvent?.action === "DELIVERED" && latestEvent.actorRole === "DISTRIBUTOR"
    })
  }

  const getSoldBatches = () => {
    return batches.filter((batch) => {
      const latestEvent = batch.events?.[0]
      return latestEvent?.action === "DELIVERED" && latestEvent.actorRole === "RETAILER"
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
        <h1 className="text-2xl font-bold text-gray-900">Retailer Dashboard</h1>
        <p className="text-gray-600">Manage inventory and final delivery to consumers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-orange-100 rounded-full p-3">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Incoming</p>
              <p className="text-2xl font-bold text-gray-900">{getIncomingBatches().length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3">
              <Store className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Store</p>
              <p className="text-2xl font-bold text-gray-900">{getInventoryBatches().length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sold</p>
              <p className="text-2xl font-bold text-gray-900">{getSoldBatches().length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-full p-3">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Incoming Deliveries */}
      {getIncomingBatches().length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Incoming Deliveries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getIncomingBatches().map((batch) => (
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
                    Receive
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Store Inventory */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Store Inventory</h2>
        {getInventoryBatches().length === 0 ? (
          <div className="card text-center py-8">
            <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory</h3>
            <p className="text-gray-600">Receive deliveries to add items to your store inventory</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getInventoryBatches().map((batch) => (
              <div key={batch.id} className="relative">
                <BatchCard batch={batch} />
                <div className="absolute top-4 right-4 space-x-2">
                  <button
                    onClick={() => {
                      setSelectedBatch(batch)
                      setShowEventModal(true)
                    }}
                    className="btn-primary text-xs px-3 py-1"
                  >
                    Sell
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {showEventModal && selectedBatch && (
        <AddEventModal
          batch={selectedBatch}
          userRole="RETAILER"
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

export default RetailerDashboard
