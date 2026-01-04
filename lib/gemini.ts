// lib/gemini.ts
import "server-only"
import { GoogleGenerativeAI } from "@google/generative-ai"

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set")
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Export the model for reuse
export const getDefaultModel = () => genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
})