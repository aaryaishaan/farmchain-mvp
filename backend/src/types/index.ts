export interface User {
  id: string
  name: string
  email: string
  role: "FARMER" | "DISTRIBUTOR" | "RETAILER" | "CONSUMER"
  createdAt: Date
}

export interface Batch {
  id: string
  batchId: string
  title: string
  variety?: string
  quantity: number
  unit: string
  harvestDate: Date
  location?: string
  images: string[]
  farmerId: string
  createdAt: Date
  updatedAt: Date
}

export interface Event {
  id: string
  batchId: string
  actorId: string
  actorRole: "FARMER" | "DISTRIBUTOR" | "RETAILER" | "CONSUMER"
  action: string
  details: any
  txHash?: string
  confirmed: boolean
  timestamp: Date
}

export interface MockTransaction {
  id: string
  txHash: string
  batchId: string
  action: string
  status: "pending" | "confirmed" | "failed"
  createdAt: Date
  confirmedAt?: Date
}

export interface AuthRequest extends Request {
  user?: User
}
