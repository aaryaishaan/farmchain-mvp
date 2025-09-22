import express from "express"
import QRCode from "qrcode"
import { PrismaClient } from "@prisma/client"
import { env } from "../config/env.js"

const router = express.Router()
const prisma = new PrismaClient()

// Generate QR code for batch
router.get("/:batchId/qr", async (req, res) => {
  try {
    const batch = await prisma.batch.findUnique({
      where: { batchId: req.params.batchId },
    })

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" })
    }

    const traceUrl = `${env.FRONTEND_URL}/trace/${batch.batchId}`

    // Generate QR code as PNG
    const qrCodeBuffer = await QRCode.toBuffer(traceUrl, {
      type: "png",
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })

    res.setHeader("Content-Type", "image/png")
    res.setHeader("Content-Disposition", `inline; filename="batch-${batch.batchId}-qr.png"`)
    res.send(qrCodeBuffer)
  } catch (error) {
    console.error("QR generation error:", error)
    res.status(500).json({ error: "Failed to generate QR code" })
  }
})

// Generate QR code as SVG
router.get("/:batchId/qr.svg", async (req, res) => {
  try {
    const batch = await prisma.batch.findUnique({
      where: { batchId: req.params.batchId },
    })

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" })
    }

    const traceUrl = `${env.FRONTEND_URL}/trace/${batch.batchId}`

    // Generate QR code as SVG
    const qrCodeSvg = await QRCode.toString(traceUrl, {
      type: "svg",
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })

    res.setHeader("Content-Type", "image/svg+xml")
    res.setHeader("Content-Disposition", `inline; filename="batch-${batch.batchId}-qr.svg"`)
    res.send(qrCodeSvg)
  } catch (error) {
    console.error("QR generation error:", error)
    res.status(500).json({ error: "Failed to generate QR code" })
  }
})

export default router
