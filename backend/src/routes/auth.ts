import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"
import { env } from "../config/env.js"

const router = express.Router()
const prisma = new PrismaClient()

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["FARMER", "DISTRIBUTOR", "RETAILER", "CONSUMER"]),
})

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = registerSchema.parse(req.body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: "7d" })

    res.status(201).json({
      message: "User registered successfully",
      token,
      user,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message })
    }
    console.error("Registration error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: "7d" })

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message })
    }
    console.error("Login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
