export type FrontendOrderStatus =
  | 'in_review'
  | 'in_production'
  | 'shipped'
  | 'delivered'
  | 'canceled'

type OrderStatusSource = {
  status?: string | null
  order_status?: string | null
  frontend_status?: string | null
  frontend_label?: string | null
  frontend_order_status?: string | null
  frontend_order_status_label?: string | null
  label?: string | null
  fulfillment?: {
    status?: string | null
    label?: string | null
    frontend_status?: string | null
    frontend_label?: string | null
  } | null
}

const frontendStatusLabels: Record<FrontendOrderStatus, string> = {
  in_review: 'In Review',
  in_production: 'In Production',
  shipped: 'Shipped',
  delivered: 'Delivered',
  canceled: 'Canceled',
}

const backendToFrontendStatus: Record<string, FrontendOrderStatus> = {
  received: 'in_review',
  processing: 'in_production',
  order_done: 'in_production',
  shipped: 'shipped',
  done: 'delivered',
  cancelled: 'canceled',
  canceled: 'canceled',
}

export const normalizeOrderStatus = (value?: unknown) => {
  return String(value ?? '').replace(/-/g, '_').toLowerCase()
}

export const formatOrderStatusLabel = (value?: unknown) => {
  const normalized = normalizeOrderStatus(value)

  if (!normalized) {
    return 'Pending'
  }

  return normalized
    .split('_')
    .filter(Boolean)
    .map(part => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

const isFrontendStatus = (value?: unknown): value is FrontendOrderStatus => {
  return normalizeOrderStatus(value) in frontendStatusLabels
}

const firstString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

export const getOrderFulfillmentStatus = (source?: OrderStatusSource | null) => {
  const frontendStatus = firstString(
    source?.frontend_order_status,
    source?.frontend_status,
    source?.fulfillment?.frontend_status,
  )

  if (isFrontendStatus(frontendStatus)) {
    return {
      status: normalizeOrderStatus(frontendStatus) as FrontendOrderStatus,
      label: firstString(
        source?.frontend_order_status_label,
        source?.frontend_label,
        source?.fulfillment?.frontend_label,
      ) || frontendStatusLabels[normalizeOrderStatus(frontendStatus) as FrontendOrderStatus],
    }
  }

  const backendStatus = normalizeOrderStatus(firstString(
    source?.order_status,
    source?.status,
    source?.fulfillment?.status,
  ))
  const mappedStatus = backendToFrontendStatus[backendStatus]

  if (mappedStatus) {
    return {
      status: mappedStatus,
      label: frontendStatusLabels[mappedStatus],
    }
  }

  return {
    status: backendStatus,
    label: firstString(source?.label, source?.fulfillment?.label) || formatOrderStatusLabel(backendStatus),
  }
}
