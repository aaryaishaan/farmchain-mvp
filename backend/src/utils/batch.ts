export const BATCH_ACTIONS = {
  CREATED: "CREATED",
  PICKED_UP: "PICKED_UP",
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
  PRICE_SET: "PRICE_SET",
  QUALITY_CHECK: "QUALITY_CHECK",
  VERIFIED_ON_CHAIN: "VERIFIED_ON_CHAIN",
} as const

export type BatchAction = keyof typeof BATCH_ACTIONS

export const getActionDisplayName = (action: string): string => {
  const actionMap: Record<string, string> = {
    CREATED: "Batch Created",
    PICKED_UP: "Picked Up",
    IN_TRANSIT: "In Transit",
    DELIVERED: "Delivered",
    PRICE_SET: "Price Updated",
    QUALITY_CHECK: "Quality Checked",
    VERIFIED_ON_CHAIN: "Blockchain Verified",
  }
  return actionMap[action] || action
}

export const getActionColor = (action: string): string => {
  const colorMap: Record<string, string> = {
    CREATED: "bg-blue-100 text-blue-800",
    PICKED_UP: "bg-yellow-100 text-yellow-800",
    IN_TRANSIT: "bg-orange-100 text-orange-800",
    DELIVERED: "bg-green-100 text-green-800",
    PRICE_SET: "bg-purple-100 text-purple-800",
    QUALITY_CHECK: "bg-indigo-100 text-indigo-800",
    VERIFIED_ON_CHAIN: "bg-emerald-100 text-emerald-800",
  }
  return colorMap[action] || "bg-gray-100 text-gray-800"
}
