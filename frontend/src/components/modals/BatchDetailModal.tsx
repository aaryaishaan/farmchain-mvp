"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  X,
  Calendar,
  MapPin,
  Package,
  User,
  Clock,
  ExternalLink,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import axios from "axios"
import type { Batch, Event } from "../../types"

interface BatchDetailModalProps {
  batch: Batch
  onClose: () => void
}

const BatchDetailModal: React.FC<BatchDetailModalProps> = ({ batch, onClose }) => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0) // Added image carousel state

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`/api/events/${batch.batchId}/events`)
        setEvents(response.data.events)
      } catch (error) {
        console.error("Failed to fetch events:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [batch.batchId])

  const handleVerifyOnChain = async () => {
    try {
      const response = await axios.post("/api/mock/tx", {
        batchId: batch.batchId,
        action: "CONSUMER_VERIFY",
      })

      // Create verification event
      await axios.post(`/api/events/${batch.batchId}/events`, {
        action: "VERIFIED_ON_CHAIN",
        details: {
          txHash: response.data.txHash,
          explorerUrl: response.data.explorerUrl,
        },
      })

      // Refresh events
      const eventsResponse = await axios.get(`/api/events/${batch.batchId}/events`)
      setEvents(eventsResponse.data.events)
    } catch (error) {
      console.error("Failed to verify on chain:", error)
    }
  }

  const getEventIcon = (action: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      CREATED: <Package className="h-4 w-4" />,
      PICKED_UP: <User className="h-4 w-4" />,
      IN_TRANSIT: <Clock className="h-4 w-4" />,
      DELIVERED: <Package className="h-4 w-4" />,
      VERIFIED_ON_CHAIN: <Shield className="h-4 w-4" />,
    }
    return iconMap[action] || <Clock className="h-4 w-4" />
  }

  const getEventColor = (action: string) => {
    const colorMap: Record<string, string> = {
      CREATED: "bg-blue-500",
      PICKED_UP: "bg-yellow-500",
      IN_TRANSIT: "bg-orange-500",
      DELIVERED: "bg-green-500",
      VERIFIED_ON_CHAIN: "bg-emerald-500",
    }
    return colorMap[action] || "bg-gray-500"
  }

  const nextImage = () => {
    if (batch.images && batch.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % batch.images.length)
    }
  }

  const prevImage = () => {
    if (batch.images && batch.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + batch.images.length) % batch.images.length)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{batch.title}</h2>
            <p className="text-sm text-gray-600">{batch.batchId}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {batch.images && batch.images.length > 0 && (
            <div className="mb-6">
              <div className="relative">
                <img
                  src={batch.images[currentImageIndex] || "/placeholder.svg"}
                  alt={`${batch.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=192&width=400&text=Image+Not+Found"
                  }}
                />
                {batch.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                      {currentImageIndex + 1} / {batch.images.length}
                    </div>
                  </>
                )}
              </div>
              {batch.images.length > 1 && (
                <div className="flex justify-center mt-2 space-x-1">
                  {batch.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? "bg-primary-600" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Batch Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Package className="h-4 w-4 mr-2 text-gray-400" />
                <span className="font-medium">Quantity:</span>
                <span className="ml-2">
                  {batch.quantity} {batch.unit}
                </span>
              </div>
              {batch.variety && (
                <div className="flex items-center text-sm">
                  <span className="font-medium">Variety:</span>
                  <span className="ml-2">{batch.variety}</span>
                </div>
              )}
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <span className="font-medium">Harvest Date:</span>
                <span className="ml-2">{new Date(batch.harvestDate).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <User className="h-4 w-4 mr-2 text-gray-400" />
                <span className="font-medium">Farmer:</span>
                <span className="ml-2">{batch.farmer?.name}</span>
              </div>
              {batch.location && (
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="font-medium">Location:</span>
                  <span className="ml-2">{batch.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 mb-6">
            <button
              onClick={() => window.open(`/api/qr/${batch.batchId}`, "_blank")}
              className="btn-outline flex items-center"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View QR Code
            </button>
            <button onClick={handleVerifyOnChain} className="btn-primary flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Verify on Chain
            </button>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Supply Chain Timeline</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event, index) => (
                  <div key={event.id} className="flex items-start space-x-3">
                    <div className={`rounded-full p-2 ${getEventColor(event.action)} text-white`}>
                      {getEventIcon(event.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{event.action.replace(/_/g, " ")}</p>
                        <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
                      </div>
                      <p className="text-sm text-gray-600">By {event.actor.name}</p>
                      {event.details && (
                        <div className="mt-1 text-xs text-gray-500">
                          {typeof event.details === "string"
                            ? event.details
                            : JSON.stringify(JSON.parse(event.details), null, 2)}
                        </div>
                      )}
                      {event.txHash && (
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-emerald-100 text-emerald-800">
                            <Shield className="h-3 w-3 mr-1" />
                            Blockchain Verified
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BatchDetailModal
