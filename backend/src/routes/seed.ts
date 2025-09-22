import express from "express"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import { env } from "../config/env.js"
import seedData from "../../prisma/seed.json"

const router = express.Router()
const prisma = new PrismaClient()

// Seed demo data (dev only)
router.post("/demo", async (req, res) => {
  try {
    // Only allow in development
    if (env.NODE_ENV === "production") {
      return res.status(403).json({ error: "Seeding not allowed in production" })
    }

    console.log("🌱 Starting database seed...")

    // Clear existing data
    await prisma.event.deleteMany()
    await prisma.batch.deleteMany()
    await prisma.mockTransaction.deleteMany()
    await prisma.user.deleteMany()

    console.log("🗑️  Cleared existing data")

    // Create users
    const users = []
    for (const userData of seedData.users) {
      const hashedPassword = await bcrypt.hash(userData.password, 12)
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role as any,
        },
      })
      users.push(user)
      console.log(`👤 Created user: ${user.name} (${user.role})`)
    }

    // Create batches
    for (const batchData of seedData.batches) {
      const farmer = users.find((u) => u.email === batchData.farmerEmail)
      if (!farmer) continue

      const batch = await prisma.batch.create({
        data: {
          batchId: batchData.batchId,
          title: batchData.title,
          variety: batchData.variety,
          quantity: batchData.quantity,
          unit: batchData.unit,
          harvestDate: new Date(batchData.harvestDate),
          location: batchData.location,
          images: batchData.images,
          farmerId: farmer.id,
        },
      })

      // Create initial event
      await prisma.event.create({
        data: {
          batchId: batch.id,
          actorId: farmer.id,
          actorRole: "FARMER",
          action: "CREATED",
          details: JSON.stringify({
            message: "Batch created and ready for distribution",
            initialQuantity: batch.quantity,
            harvestDate: batch.harvestDate,
          }),
        },
      })

      console.log(`🌾 Created batch: ${batch.title} (${batch.batchId})`)
    }

    console.log("✅ Database seeded successfully!")

    res.json({
      message: "Database seeded successfully",
      users: users.length,
      batches: seedData.batches.length,
    })
  } catch (error) {
    console.error("❌ Seed failed:", error)
    res.status(500).json({ error: "Seeding failed" })
  }
})

export default router
