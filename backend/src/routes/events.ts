import express from "express"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"
import { authenticateToken } from "../middleware/auth.js"
import type { AuthRequest } from "../types/index.js"

const router = express.Router()
const prisma = new PrismaClient()

const createEventSchema = z.object({
  action: z.string().min(1, "Action is required"),
  details: z.any().optional(),
})

// Create event for a batch
router.post("/:batchId/events", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { action, details } = createEventSchema.parse(req.body)

    // Find the batch
    const batch = await prisma.batch.findUnique({
      where: { batchId: req.params.batchId },
    })

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" })
    }

    // Create the event
    const event = await prisma.event.create({
      data: {
        batchId: batch.id,
        actorId: req.user!.id,
        actorRole: req.user!.role,
        action,
        details: JSON.stringify(details || {}),
      },
      include: {
        actor: {
          select: { id: true, name: true, role: true },
        },
      },
    })

    res.status(201).json({
      message: "Event created successfully",
      event,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message })
    }
    console.error("Create event error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get events for a batch
router.get("/:batchId/events", async (req, res) => {
  try {
    const batch = await prisma.batch.findUnique({
      where: { batchId: req.params.batchId },
    })

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" })
    }

    const events = await prisma.event.findMany({
      where: { batchId: batch.id },
      include: {
        actor: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { timestamp: "asc" },
    })

    res.json({ events })
  } catch (error) {
    console.error("Get events error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
