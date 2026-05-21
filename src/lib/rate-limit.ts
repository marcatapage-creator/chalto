import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// 10 requêtes par minute par IP
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "chalto",
})

// 20 requêtes par heure par IP — pour les routes publiques sensibles (validation token)
const strictRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 h"),
  analytics: true,
  prefix: "chalto:strict",
})

function getIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ??
    request.headers.get("x-real-ip") ??
    "anonymous"
  )
}

export async function checkRateLimit(request: Request): Promise<boolean> {
  if (process.env.NODE_ENV === "development") return true
  try {
    const { success } = await ratelimit.limit(getIp(request))
    return success
  } catch {
    return true
  }
}

export async function checkStrictRateLimit(request: Request): Promise<boolean> {
  if (process.env.NODE_ENV === "development") return true
  try {
    const { success } = await strictRatelimit.limit(getIp(request))
    return success
  } catch {
    return true
  }
}
