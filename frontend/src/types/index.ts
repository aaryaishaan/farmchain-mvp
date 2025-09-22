export interface User {
  id: string
  name: string
  email: string
  role: "FARMER" | "DISTRIBUTOR" | "RETAILER" | "CONSUMER"
  createdAt: string
}

export interface Batch {
  id: string
  batchId: string
  title: string
  variety?: string
  quantity: number
  unit: string
  harvestDate: string
  location?: string
  images: string[]
  farmerId: string
  createdAt: string
  updatedAt: string
  farmer?: User
  events?: Event[]
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
  timestamp: string
  actor: User
}

export interface MockTransaction {
  id: string
  txHash: string
  batchId: string
  action: string
  status: "pending" | "confirmed" | "failed"
  createdAt: string
  confirmedAt?: string
}
