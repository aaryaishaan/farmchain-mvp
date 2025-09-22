"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Package, QrCode, Eye } from "lucide-react"
import axios from "axios"
import CreateBatchModal from "../modals/CreateBatchModal"
import BatchCard from "../BatchCard"
import type { Batch } from "../../types"

const FarmerDashboard: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

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

  const handleBatchCreated = () => {
    fetchBatches()
    setShowCreateModal(false)
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Farmer Dashboard</h1>
          <p className="text-gray-600">Manage your produce batches and track their journey</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Create Batch
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-primary-100 rounded-full p-3">
              <Package className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Batches</p>
              <p className="text-2xl font-bold text-gray-900">{batches.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-accent-100 rounded-full p-3">
              <QrCode className="h-6 w-6 text-accent-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">QR Codes Generated</p>
              <p className="text-2xl font-bold text-gray-900">{batches.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Batches</p>
              <p className="text-2xl font-bold text-gray-900">
                {batches.filter((b) => b.events?.[0]?.action !== "DELIVERED").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Batches Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Batches</h2>
        {batches.length === 0 ? (
          <div className="card text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No batches yet</h3>
            <p className="text-gray-600 mb-4">Create your first batch to start tracking your produce</p>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              Create Your First Batch
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((batch) => (
              <BatchCard key={batch.id} batch={batch} showActions={true} />
            ))}
          </div>
        )}
      </div>

      {/* Create Batch Modal */}
      {showCreateModal && <CreateBatchModal onClose={() => setShowCreateModal(false)} onSuccess={handleBatchCreated} />}
    </div>
  )
}

export default FarmerDashboard
