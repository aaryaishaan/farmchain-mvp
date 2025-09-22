import express from "express"
import cors from "cors"
import path from "path"
import { env } from "./config/env.js"
import authRoutes from "./routes/auth.js"
import batchRoutes from "./routes/batches.js"
import eventRoutes from "./routes/events.js"
import mockBlockchainRoutes from "./routes/mock-blockchain.js"
import qrRoutes from "./routes/qr.js"
import seedRoutes from "./routes/seed.js"
import uploadRoutes from "./routes/upload.js" // Added upload routes

const app = express()

// Middleware
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static files for uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/batches", batchRoutes)
app.use("/api/events", eventRoutes)
app.use("/api/mock", mockBlockchainRoutes)
app.use("/api/qr", qrRoutes)
app.use("/api/seed", seedRoutes)
app.use("/api/upload", uploadRoutes) // Added upload routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err)
  res.status(500).json({ error: "Internal server error" })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

const PORT = env.PORT || 4000

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 Environment: ${env.NODE_ENV}`)
})
