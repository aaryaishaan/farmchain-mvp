import express from "express"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"
import { authenticateToken } from "../middleware/auth.js"
import type { AuthRequest } from "../types/index.js"

const router = express.Router()
const prisma = new PrismaClient()

const createTxSchema = z.object({
  batchId: z.string().min(1, "Batch ID is required"),
  action: z.string().min(1, "Action is required"),
})

// Generate mock transaction hash
const generateTxHash = (): string => {
  const chars = "0123456789abcdef"
  let hash = "0x"
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)]
  }
  return hash
}

// Submit transaction to mock blockchain
router.post("/tx", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { batchId, action } = createTxSchema.parse(req.body)

    // Verify batch exists
    const batch = await prisma.batch.findUnique({
      where: { batchId },
    })

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" })
    }

    const txHash = generateTxHash()

    // Create mock transaction record
    const mockTx = await prisma.mockTransaction.create({
      data: {
        txHash,
        batchId,
        action,
        status: "pending",
      },
    })

    // Simulate network delay and random confirmation
    setTimeout(
      async () => {
        try {
          const shouldConfirm = Math.random() > 0.1 // 90% success rate
          await prisma.mockTransaction.update({
            where: { id: mockTx.id },
            data: {
              status: shouldConfirm ? "confirmed" : "failed",
              confirmedAt: shouldConfirm ? new Date() : undefined,
            },
          })
        } catch (error) {
          console.error("Mock confirmation error:", error)
        }
      },
      Math.random() * 10000 + 5000,
    ) // 5-15 seconds

    res.status(201).json({
      txHash,
      status: "pending",
      explorerUrl: `https://mockchain.local/tx/${txHash}`,
      submittedAt: new Date().toISOString(),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message })
    }
    console.error("Mock blockchain error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get transaction status
router.get("/tx/:txHash", async (req, res) => {
  try {
    const mockTx = await prisma.mockTransaction.findUnique({
      where: { txHash: req.params.txHash },
    })

    if (!mockTx) {
      return res.status(404).json({ error: "Transaction not found" })
    }

    res.json({
      txHash: mockTx.txHash,
      status: mockTx.status,
      batchId: mockTx.batchId,
      action: mockTx.action,
      createdAt: mockTx.createdAt,
      confirmedAt: mockTx.confirmedAt,
      explorerUrl: `https://mockchain.local/tx/${mockTx.txHash}`,
    })
  } catch (error) {
    console.error("Get transaction error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Force confirm transaction (dev only)
router.post("/tx/:txHash/confirm", async (req, res) => {
  try {
    const mockTx = await prisma.mockTransaction.findUnique({
      where: { txHash: req.params.txHash },
    })

    if (!mockTx) {
      return res.status(404).json({ error: "Transaction not found" })
    }

    const updatedTx = await prisma.mockTransaction.update({
      where: { txHash: req.params.txHash },
      data: {
        status: "confirmed",
        confirmedAt: new Date(),
      },
    })

    res.json({
      message: "Transaction confirmed",
      transaction: updatedTx,
    })
  } catch (error) {
    console.error("Force confirm error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get all transactions (dev only)
router.get("/tx", async (req, res) => {
  try {
    const transactions = await prisma.mockTransaction.findMany({
      orderBy: { createdAt: "desc" },
    })

    res.json({ transactions })
  } catch (error) {
    console.error("Get transactions error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
