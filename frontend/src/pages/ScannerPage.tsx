"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Camera, Search, QrCode } from "lucide-react"
import QrScanner from "qr-scanner"

const ScannerPage: React.FC = () => {
  const [scanning, setScanning] = useState(false)
  const [manualInput, setManualInput] = useState("")
  const [error, setError] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const qrScannerRef = useRef<QrScanner | null>(null)
  const navigate = useNavigate()

  const startScanning = async () => {
    if (!videoRef.current) return

    try {
      setError("")
      setScanning(true)

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          handleScanResult(result.data)
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        },
      )

      await qrScannerRef.current.start()
    } catch (err: any) {
      setError("Failed to start camera. Please check permissions and try again.")
      setScanning(false)
    }
  }

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop()
      qrScannerRef.current.destroy()
      qrScannerRef.current = null
    }
    setScanning(false)
  }

  const handleScanResult = (data: string) => {
    stopScanning()

    // Extract batch ID from URL or use as-is
    let batchId = data
    const urlMatch = data.match(/\/trace\/([^/?]+)/)
    if (urlMatch) {
      batchId = urlMatch[1]
    }

    navigate(`/trace/${batchId}`)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualInput.trim()) {
      navigate(`/trace/${manualInput.trim()}`)
    }
  }

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

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
            <div className="text-sm text-gray-500">QR Scanner</div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <QrCode className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Scan QR Code</h1>
          <p className="text-gray-600">Scan a product QR code to trace its journey from farm to table</p>
        </div>

        {/* QR Scanner */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="text-center">
            {!scanning ? (
              <div>
                <div className="bg-gray-100 rounded-lg p-8 mb-4">
                  <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Position the QR code within the camera frame</p>
                  <button onClick={startScanning} className="btn-primary">
                    <Camera className="h-4 w-4 mr-2" />
                    Start Camera
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                  <video
                    ref={videoRef}
                    className="w-full h-64 object-cover"
                    playsInline
                    muted
                    style={{ transform: "scaleX(-1)" }}
                  />
                  <div className="absolute inset-0 border-2 border-primary-500 rounded-lg pointer-events-none">
                    <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-primary-500"></div>
                    <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-primary-500"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-primary-500"></div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-primary-500"></div>
                  </div>
                </div>
                <button onClick={stopScanning} className="btn-outline">
                  Stop Scanning
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Manual Input */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Or Enter Batch ID Manually</h2>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label htmlFor="batchId" className="block text-sm font-medium text-gray-700 mb-1">
                Batch ID
              </label>
              <input
                type="text"
                id="batchId"
                className="input"
                placeholder="e.g., FARM-2025-0001"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              <Search className="h-4 w-4 mr-2" />
              Trace Batch
            </button>
          </form>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p className="mb-2">
            <strong>How to use:</strong>
          </p>
          <ul className="space-y-1">
            <li>• Point your camera at the QR code on the product</li>
            <li>• Allow camera permissions when prompted</li>
            <li>• The code will be scanned automatically</li>
            <li>• Or enter the batch ID manually if you have it</li>
          </ul>
        </div>
      </main>
    </div>
  )
}

export default ScannerPage
