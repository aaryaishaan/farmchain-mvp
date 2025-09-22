"use client"

import type React from "react"
import { useState } from "react"
import { X } from "lucide-react"
import axios from "axios"
import type { Batch } from "../../types"

interface AddEventModalProps {
  batch: Batch
  userRole: "DISTRIBUTOR" | "RETAILER"
  onClose: () => void
  onSuccess: () => void
}

const AddEventModal: React.FC<AddEventModalProps> = ({ batch, userRole, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    action: "",
    notes: "",
    location: "",
    price: "",
    quality: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const getAvailableActions = () => {
    const latestEvent = batch.events?.[0]
    const currentStatus = latestEvent?.action || "CREATED"

    if (userRole === "DISTRIBUTOR") {
      switch (currentStatus) {
        case "CREATED":
          return [{ value: "PICKED_UP", label: "Pick Up from Farm" }]
        case "PICKED_UP":
          return [{ value: "IN_TRANSIT", label: "Mark as In Transit" }]
        case "IN_TRANSIT":
          return [{ value: "DELIVERED", label: "Deliver to Retailer" }]
        default:
          return []
      }
    } else if (userRole === "RETAILER") {
      switch (currentStatus) {
        case "IN_TRANSIT":
          return [{ value: "DELIVERED", label: "Receive Delivery" }]
        case "DELIVERED":
          if (latestEvent?.actorRole === "DISTRIBUTOR") {
            return [
              { value: "PRICE_SET", label: "Set Retail Price" },
              { value: "QUALITY_CHECK", label: "Quality Check" },
              { value: "DELIVERED", label: "Sell to Consumer" },
            ]
          }
          return []
        default:
          return []
      }
    }

    return []
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const details: any = {
        notes: formData.notes,
      }

      if (formData.location) details.location = formData.location
      if (formData.price) details.price = Number.parseFloat(formData.price)
      if (formData.quality) details.quality = formData.quality

      await axios.post(`/api/events/${batch.batchId}/events`, {
        action: formData.action,
        details,
      })

      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add event")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const availableActions = getAvailableActions()

  if (availableActions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">No Actions Available</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-gray-600 mb-4">No actions are available for this batch at the current stage.</p>
          <button onClick={onClose} className="btn-primary w-full">
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Update Batch Status</h2>
            <p className="text-sm text-gray-600">
              {batch.title} ({batch.batchId})
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-1">
              Action *
            </label>
            <select
              id="action"
              name="action"
              required
              className="input"
              value={formData.action}
              onChange={handleChange}
            >
              <option value="">Select an action</option>
              {availableActions.map((action) => (
                <option key={action.value} value={action.value}>
                  {action.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="input"
              placeholder="Add any relevant notes about this update..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          {(formData.action === "PICKED_UP" || formData.action === "IN_TRANSIT" || formData.action === "DELIVERED") && (
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Current Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                className="input"
                placeholder="Enter current location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          )}

          {formData.action === "PRICE_SET" && (
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price per {batch.unit}
              </label>
              <input
                type="number"
                id="price"
                name="price"
                step="0.01"
                min="0"
                className="input"
                placeholder="0.00"
                value={formData.price}
                onChange={handleChange}
              />
            </div>
          )}

          {formData.action === "QUALITY_CHECK" && (
            <div>
              <label htmlFor="quality" className="block text-sm font-medium text-gray-700 mb-1">
                Quality Rating
              </label>
              <select id="quality" name="quality" className="input" value={formData.quality} onChange={handleChange}>
                <option value="">Select quality rating</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Updating..." : "Update Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddEventModal
