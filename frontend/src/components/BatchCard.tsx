"use client"

import type React from "react"
import { useState } from "react"
import { Calendar, MapPin, Package, QrCode, Eye, User, ImageIcon } from "lucide-react"
import type { Batch } from "../types"
import BatchDetailModal from "./modals/BatchDetailModal"

interface BatchCardProps {
  batch: Batch
  showActions?: boolean
}

const BatchCard: React.FC<BatchCardProps> = ({ batch, showActions = false }) => {
  const [showDetail, setShowDetail] = useState(false)

  const getStatusColor = (action: string) => {
    const colorMap: Record<string, string> = {
      CREATED: "bg-blue-100 text-blue-800",
      PICKED_UP: "bg-yellow-100 text-yellow-800",
      IN_TRANSIT: "bg-orange-100 text-orange-800",
      DELIVERED: "bg-green-100 text-green-800",
      PRICE_SET: "bg-purple-100 text-purple-800",
      QUALITY_CHECK: "bg-indigo-100 text-indigo-800",
      VERIFIED_ON_CHAIN: "bg-emerald-100 text-emerald-800",
    }
    return colorMap[action] || "bg-gray-100 text-gray-800"
  }

  const getStatusText = (action: string) => {
    const textMap: Record<string, string> = {
      CREATED: "Created",
      PICKED_UP: "Picked Up",
      IN_TRANSIT: "In Transit",
      DELIVERED: "Delivered",
      PRICE_SET: "Price Set",
      QUALITY_CHECK: "Quality Checked",
      VERIFIED_ON_CHAIN: "Verified",
    }
    return textMap[action] || action
  }

  const latestEvent = batch.events?.[0]

  return (
    <>
      <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowDetail(true)}>
        {batch.images && batch.images.length > 0 && (
          <div className="mb-4">
            <img
              src={batch.images[0] || "/placeholder.svg"}
              alt={batch.title}
              className="w-full h-32 object-cover rounded-md"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
          </div>
        )}

        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{batch.title}</h3>
            <p className="text-sm text-gray-600">{batch.batchId}</p>
          </div>
          {latestEvent && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(latestEvent.action)}`}>
              {getStatusText(latestEvent.action)}
            </span>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Package className="h-4 w-4 mr-2" />
            {batch.quantity} {batch.unit}
            {batch.variety && <span className="ml-2">• {batch.variety}</span>}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            Harvested {new Date(batch.harvestDate).toLocaleDateString()}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-2" />
            {batch.farmer?.name || "Unknown Farmer"}
          </div>
          {batch.location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {batch.location}
            </div>
          )}
          {batch.images && batch.images.length > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <ImageIcon className="h-4 w-4 mr-2" />
              {batch.images.length} image{batch.images.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex space-x-2 pt-4 border-t">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowDetail(true)
              }}
              className="btn-outline flex-1 text-sm py-2"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                window.open(`/api/qr/${batch.batchId}`, "_blank")
              }}
              className="btn-primary flex-1 text-sm py-2"
            >
              <QrCode className="h-4 w-4 mr-1" />
              QR Code
            </button>
          </div>
        )}
      </div>

      {showDetail && <BatchDetailModal batch={batch} onClose={() => setShowDetail(false)} />}
    </>
  )
}

export default BatchCard
