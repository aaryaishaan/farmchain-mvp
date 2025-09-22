import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import { authenticateToken } from "../middleware/auth.js"
import type { AuthRequest } from "../types/index.js"
import type { Express } from "express"

const router = express.Router()

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"))
    }
  },
})

// Upload single image
router.post("/image", authenticateToken, upload.single("image"), (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    const fileUrl = `/uploads/${req.file.filename}`

    res.json({
      message: "File uploaded successfully",
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      url: fileUrl,
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({ error: "Failed to upload file" })
  }
})

// Upload multiple images
router.post("/images", authenticateToken, upload.array("images", 5), (req: AuthRequest, res) => {
  try {
    const files = req.files as Express.Multer.File[]

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" })
    }

    const uploadedFiles = files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: `/uploads/${file.filename}`,
    }))

    res.json({
      message: "Files uploaded successfully",
      files: uploadedFiles,
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({ error: "Failed to upload files" })
  }
})

// Delete uploaded file
router.delete("/:filename", authenticateToken, (req: AuthRequest, res) => {
  try {
    const filename = req.params.filename
    const filePath = path.join(uploadsDir, filename)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" })
    }

    fs.unlinkSync(filePath)

    res.json({ message: "File deleted successfully" })
  } catch (error) {
    console.error("Delete error:", error)
    res.status(500).json({ error: "Failed to delete file" })
  }
})

export default router
