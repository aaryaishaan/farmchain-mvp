import request from "supertest"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import app from "../app" // Declare the app variable

const prisma = new PrismaClient()

describe("Auth Routes", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "Password123",
        role: "FARMER",
      }

      const response = await request(app).post("/api/auth/register").send(userData).expect(201)

      expect(response.body).toHaveProperty("token")
      expect(response.body.user.email).toBe(userData.email)
      expect(response.body.user.role).toBe(userData.role)
    })

    it("should not register user with existing email", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "Password123",
        role: "FARMER",
      }

      // Create user first
      await prisma.user.create({
        data: {
          ...userData,
          password: await bcrypt.hash(userData.password, 12),
        },
      })

      const response = await request(app).post("/api/auth/register").send(userData).expect(400)

      expect(response.body.error).toContain("already exists")
    })
  })

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "Password123",
        role: "FARMER",
      }

      // Create user
      await prisma.user.create({
        data: {
          ...userData,
          password: await bcrypt.hash(userData.password, 12),
        },
      })

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200)

      expect(response.body).toHaveProperty("token")
      expect(response.body.user.email).toBe(userData.email)
    })

    it("should not login with invalid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "wrongpassword",
        })
        .expect(401)

      expect(response.body.error).toContain("Invalid email or password")
    })
  })
})
