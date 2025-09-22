"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Package,
  User,
  Shield,
  Clock,
  ExternalLink,
  CheckCircle,
  Truck,
  Store,
} from "lucide-react"
import axios from "axios"
import type { Batch, Event } from "../types"

const TracePage: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>()
  const [batch, setBatch] = useState<Batch | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchBatchData = async () => {
      if (!batchId) return

      try {
        const [batchResponse, eventsResponse] = await Promise.all([
          axios.get(`/api/batches/${batchId}`),
          axios.get(`/api/events/${batchId}/events`),
        ])

        setBatch(batchResponse.data.batch)
        setEvents(eventsResponse.data.events)
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load batch information")
      } finally {
        setLoading(false)
      }
    }

    fetchBatchData()
  }, [batchId])

  const handleVerifyOnChain = async () => {
    if (!batch) return

    try {
      const response = await axios.post("/api/mock/tx", {
        batchId: batch.batchId,
        action: "CONSUMER_VERIFY",
      })

      // Show verification result
      alert(`Verification submitted! Transaction Hash: ${response.data.txHash}`)
    } catch (error) {
      console.error("Failed to verify on chain:", error)
      alert("Failed to verify on blockchain. Please try again.")
    }
  }

  const getEventIcon = (action: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      CREATED: <Package className="h-5 w-5" />,
      PICKED_UP: <Truck className="h-5 w-5" />,
      IN_TRANSIT: <Clock className="h-5 w-5" />,
      DELIVERED: <Store className="h-5 w-5" />,
      PRICE_SET: <Package className="h-5 w-5" />,
      QUALITY_CHECK: <CheckCircle className="h-5 w-5" />,
      VERIFIED_ON_CHAIN: <Shield className="h-5 w-5" />,
    }
    return iconMap[action] || <Clock className="h-5 w-5" />
  }

  const getEventColor = (action: string) => {
    const colorMap: Record<string, string> = {
      CREATED: "bg-blue-500",
      PICKED_UP: "bg-yellow-500",
      IN_TRANSIT: "bg-orange-500",
      DELIVERED: "bg-green-500",
      PRICE_SET: "bg-purple-500",
      QUALITY_CHECK: "bg-indigo-500",
      VERIFIED_ON_CHAIN: "bg-emerald-500",
    }
    return colorMap[action] || "bg-gray-500"
  }

  const getEventTitle = (action: string) => {
    const titleMap: Record<string, string> = {
      CREATED: "Batch Created",
      PICKED_UP: "Picked Up by Distributor",
      IN_TRANSIT: "In Transit",
      DELIVERED: "Delivered",
      PRICE_SET: "Price Set",
      QUALITY_CHECK: "Quality Checked",
      VERIFIED_ON_CHAIN: "Blockchain Verified",
    }
    return titleMap[action] || action.replace(/_/g, " ")
  }

  const getTrustScore = () => {
    if (!events.length) return 0
    let score = 50 // Base score
    score += events.length * 10 // Points for each event
    score += events.filter((e) => e.txHash).length * 20 // Bonus for blockchain verification
    return Math.min(score, 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !batch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Batch Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "The requested batch could not be found."}</p>
          <Link to="/" className="btn-primary">
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
            <div className="text-sm text-gray-500">Batch Trace</div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Batch Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{batch.title}</h1>
              <p className="text-gray-600">Batch ID: {batch.batchId}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Trust Score</div>
              <div className="text-2xl font-bold text-primary-600">{getTrustScore()}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center">
              <Package className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <div className="text-sm text-gray-600">Quantity</div>
                <div className="font-medium">
                  {batch.quantity} {batch.unit}
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <div className="text-sm text-gray-600">Harvest Date</div>
                <div className="font-medium">{new Date(batch.harvestDate).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <div className="text-sm text-gray-600">Farmer</div>
                <div className="font-medium">{batch.farmer?.name}</div>
              </div>
            </div>
          </div>

          {batch.variety && (
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                Variety: {batch.variety}
              </span>
            </div>
          )}

          {batch.location && (
            <div className="flex items-center text-sm text-gray-600 mb-6">
              <MapPin className="h-4 w-4 mr-2" />
              Origin: {batch.location}
            </div>
          )}

          <button onClick={handleVerifyOnChain} className="btn-primary flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Verify on Blockchain
          </button>
        </div>

        {/* Supply Chain Timeline */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Supply Chain Journey</h2>

          {events.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No supply chain events recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((event, index) => (
                <div key={event.id} className="flex items-start space-x-4">
                  <div className={`rounded-full p-3 ${getEventColor(event.action)} text-white flex-shrink-0`}>
                    {getEventIcon(event.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-medium text-gray-900">{getEventTitle(event.action)}</h3>
                      <time className="text-sm text-gray-500">{new Date(event.timestamp).toLocaleString()}</time>
                    </div>
                    <p className="text-gray-600 mb-2">
                      By {event.actor.name} ({event.actor.role.toLowerCase()})
                    </p>
                    {event.details && (
                      <div className="bg-gray-50 rounded-md p-3 mb-2">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                          {typeof event.details === "string"
                            ? event.details
                            : JSON.stringify(JSON.parse(event.details), null, 2)}
                        </pre>
                      </div>
                    )}
                    {event.txHash && (
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-emerald-100 text-emerald-800">
                          <Shield className="h-3 w-3 mr-1" />
                          Blockchain Verified
                        </span>
                        <button
                          onClick={() => window.open(`https://mockchain.local/tx/${event.txHash}`, "_blank")}
                          className="text-xs text-primary-600 hover:text-primary-800 flex items-center"
                        >
                          View Transaction
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </button>
                      </div>
                    )}
                  </div>
                  {index < events.length - 1 && (
                    <div className="absolute left-6 mt-12 w-0.5 h-6 bg-gray-200" style={{ marginLeft: "1.5rem" }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Powered by FarmChain - Building trust in food supply chains</p>
        </div>
      </main>
    </div>
  )
}

export default TracePage
