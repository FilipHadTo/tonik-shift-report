// Gemini behind the per-IP rate limit (ticket 14), shared by the AI routes. Counted only when Gemini is
// really asked; over the limit counts as a failed call, so the route falls back like on any other failure.

import "server-only"
import { takeAiCall } from "../db"
import type { ReportModel } from "../report"
import { geminiModel } from "./gemini"

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  return forwarded || request.headers.get("x-real-ip") || "unknown"
}

export function rateLimitedGemini(request: Request): ReportModel {
  const ip = clientIp(request)
  const take = async () => {
    if (!(await takeAiCall(ip))) throw new Error("Rate limited")
  }
  return {
    extract: async (req) => (await take(), geminiModel.extract(req)),
    enhance: async (req) => (await take(), geminiModel.enhance(req)),
  }
}
