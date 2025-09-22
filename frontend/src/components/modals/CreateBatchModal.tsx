"use client"

import type React from "react"
import { useState } from "react"
import { X, Upload } from "lucide-react"
import axios from "axios"

interface CreateBatchModalProps {
  onClose: () => void
  onSuccess: () => void
}

const CreateBatchModal: React.FC<CreateBatchModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    variety: "",
    quantity: "",
    unit: "kg",
    harvestDate: "",
    location: "",
  })
  const [images, setImages] = useState<string[]>([]) // Added images state
  const [uploading, setUploading] = useState(false) // Added uploading state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await axios.post("/api/batches", {
        ...formData,
        quantity: Number.parseInt(formData.quantity),
        images, // Include images in batch creation
      })
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create batch")
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError("")

    try {
      const formData = new FormData()
      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i])
      }

      const response = await axios.post("/api/upload/images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      const newImageUrls = response.data.files.map((file: any) => file.url)
      setImages((prev) => [...prev, ...newImageUrls])
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to upload images")
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Create New Batch</h2>
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
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Batch Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="input"
              placeholder="e.g., Organic Tomatoes Lot A"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="variety" className="block text-sm font-medium text-gray-700 mb-1">
              Variety
            </label>
            <input
              type="text"
              id="variety"
              name="variety"
              className="input"
              placeholder="e.g., Cherry, Roma, Beefsteak"
              value={formData.variety}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                required
                min="1"
                className="input"
                placeholder="100"
                value={formData.quantity}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                Unit *
              </label>
              <select id="unit" name="unit" className="input" value={formData.unit} onChange={handleChange}>
                <option value="kg">Kilograms (kg)</option>
                <option value="lbs">Pounds (lbs)</option>
                <option value="tons">Tons</option>
                <option value="boxes">Boxes</option>
                <option value="crates">Crates</option>
                <option value="pieces">Pieces</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="harvestDate" className="block text-sm font-medium text-gray-700 mb-1">
              Harvest Date *
            </label>
            <input
              type="date"
              id="harvestDate"
              name="harvestDate"
              required
              className="input"
              value={formData.harvestDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              className="input"
              placeholder="Farm address or coordinates"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
            <div className="space-y-3">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </div>

              {uploading && (
                <div className="flex items-center justify-center py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Uploading...</span>
                </div>
              )}

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-20 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={loading || uploading} className="btn-primary">
              {loading ? "Creating..." : "Create Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateBatchModal
