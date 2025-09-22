import express from "express"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"
import { authenticateToken, requireRole } from "../middleware/auth.js"
import type { AuthRequest } from "../types/index.js"

const router = express.Router()
const prisma = new PrismaClient()

const createBatchSchema = z.object({
  title: z.string().min(1, "Title is required"),
  variety: z.string().optional(),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  harvestDate: z.string().transform((str) => new Date(str)),
  location: z.string().optional(),
  images: z.array(z.string()).optional().default([]), // Added images array support
})

const updateBatchSchema = z.object({
  title: z.string().optional(),
  variety: z.string().optional(),
  quantity: z.number().positive().optional(),
  unit: z.string().optional(),
  harvestDate: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  location: z.string().optional(),
  images: z.array(z.string()).optional(), // Added images array support
})

// Generate unique batch ID
const generateBatchId = async (): Promise<string> => {
  const year = new Date().getFullYear()
  const count = await prisma.batch.count()
  return `FARM-${year}-${String(count + 1).padStart(4, "0")}`
}

// Create batch (farmers only)
router.post("/", authenticateToken, requireRole(["FARMER"]), async (req: AuthRequest, res) => {
  try {
    const data = createBatchSchema.parse(req.body)
    const batchId = await generateBatchId()

    const batch = await prisma.batch.create({
      data: {
        batchId,
        title: data.title,
        variety: data.variety,
        quantity: data.quantity,
        unit: data.unit,
        harvestDate: data.harvestDate,
        location: data.location,
        images: JSON.stringify(data.images || []), // Store images as JSON string
        farmerId: req.user!.id,
      },
      include: {
        farmer: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    })

    // Create initial event
    await prisma.event.create({
      data: {
        batchId: batch.id,
        actorId: req.user!.id,
        actorRole: "FARMER",
        action: "CREATED",
        details: JSON.stringify({
          message: "Batch created and ready for distribution",
          initialQuantity: batch.quantity,
          harvestDate: batch.harvestDate,
          imagesCount: data.images?.length || 0, // Track number of images
        }),
      },
    })

    res.status(201).json({
      message: "Batch created successfully",
      batch: {
        ...batch,
        images: JSON.parse(batch.images), // Parse images for response
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message })
    }
    console.error("Create batch error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get batches (role-aware filtering)
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { role } = req.user!
    let batches

    if (role === "FARMER") {
      // Farmers see only their own batches
      batches = await prisma.batch.findMany({
        where: { farmerId: req.user!.id },
        include: {
          farmer: {
            select: { id: true, name: true, email: true, role: true },
          },
          events: {
            orderBy: { timestamp: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
      })
    } else if (role === "CONSUMER") {
      // Consumers see all batches (for browsing)
      batches = await prisma.batch.findMany({
        include: {
          farmer: {
            select: { id: true, name: true, email: true, role: true },
          },
          events: {
            orderBy: { timestamp: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
      })
    } else {
      // Distributors and retailers see batches they can interact with
      batches = await prisma.batch.findMany({
        include: {
          farmer: {
            select: { id: true, name: true, email: true, role: true },
          },
          events: {
            orderBy: { timestamp: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
      })
    }

    const batchesWithImages = batches.map((batch) => ({
      ...batch,
      images: JSON.parse(batch.images),
    }))

    res.json({ batches: batchesWithImages })
  } catch (error) {
    console.error("Get batches error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get single batch with full details
router.get("/:batchId", async (req, res) => {
  try {
    const batch = await prisma.batch.findUnique({
      where: { batchId: req.params.batchId },
      include: {
        farmer: {
          select: { id: true, name: true, email: true, role: true },
        },
        events: {
          include: {
            actor: {
              select: { id: true, name: true, role: true },
            },
          },
          orderBy: { timestamp: "asc" },
        },
      },
    })

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" })
    }

    // Parse images JSON
    const batchWithImages = {
      ...batch,
      images: JSON.parse(batch.images),
    }

    res.json({ batch: batchWithImages })
  } catch (error) {
    console.error("Get batch error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Update batch (farmers only, their own batches)
router.put("/:batchId", authenticateToken, requireRole(["FARMER"]), async (req: AuthRequest, res) => {
  try {
    const data = updateBatchSchema.parse(req.body)

    const batch = await prisma.batch.findUnique({
      where: { batchId: req.params.batchId },
    })

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" })
    }

    if (batch.farmerId !== req.user!.id) {
      return res.status(403).json({ error: "You can only update your own batches" })
    }

    const updateData: any = { ...data }
    if (data.images) {
      updateData.images = JSON.stringify(data.images)
    }

    const updatedBatch = await prisma.batch.update({
      where: { batchId: req.params.batchId },
      data: updateData,
      include: {
        farmer: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    })

    res.json({
      message: "Batch updated successfully",
      batch: {
        ...updatedBatch,
        images: JSON.parse(updatedBatch.images), // Parse images for response
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message })
    }
    console.error("Update batch error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
