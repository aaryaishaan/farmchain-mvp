import { PrismaClient } from "@prisma/client"
import { beforeAll, afterAll, beforeEach } from "@jest/globals"

const prisma = new PrismaClient()

beforeAll(async () => {
  // Setup test database
})

afterAll(async () => {
  await prisma.$disconnect()
})

beforeEach(async () => {
  // Clean database before each test
  await prisma.event.deleteMany()
  await prisma.batch.deleteMany()
  await prisma.mockTransaction.deleteMany()
  await prisma.user.deleteMany()
})
