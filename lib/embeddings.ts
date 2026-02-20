// lib/embeddings.ts
import "server-only"
import { prisma } from "./prisma"
import type { Period, DailyFlow } from "@prisma/client"
import { genAI } from "./gemini"

export async function createEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" })
  const result = await model.embedContent(text)
  return result.embedding.values
}

// Helper to embed period data
export async function embedPeriodData(period: Period) {
  const content = `Period from ${period.startDate.toDateString()}${
    period.endDate ? ` to ${period.endDate.toDateString()}` : ' (ongoing)'
  }`
  
  const vector = await createEmbedding(content)
  const vectorString = `[${vector.join(',')}]`
  
  await prisma.$queryRawUnsafe(
    `INSERT INTO "Embedding" ("id", "userId", "source", "sourceId", "content", "vector", "createdAt")
     VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5::vector, NOW())
     ON CONFLICT DO NOTHING`,
     period.userId,
    'period',
    period.id,
    content,
    vectorString
  )
}

// Helper to embed daily flow data
export async function embedDailyFlow(flow: DailyFlow) {
  const intensityText = ['None', 'Light', 'Medium', 'Heavy'][flow.intensity]
  const content = `Flow on ${flow.date.toDateString()}: ${intensityText} intensity`
  
  const vector = await createEmbedding(content)
  const vectorString = `[${vector.join(',')}]`
  
  await prisma.$queryRawUnsafe(
    `INSERT INTO "Embedding" ("id", "userId", "source", "sourceId", "content", "vector", "createdAt")
     VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5::vector, NOW())`,
      flow.userId,
    'flow',
    flow.id,
    content,
    vectorString
  )
}

// Semantic search function
export async function searchUserData(userId: string, query: string, limit = 5) {
  const vector = await createEmbedding(query)
  const vectorString = `[${vector.join(',')}]`
  
  return await prisma.$queryRawUnsafe<{
    id: string
    content: string
    source: string
    sourceId: string
    similarity: number
  }[]>(
    `SELECT 
      id, 
      content, 
      source,
      "sourceId",
      1 - (vector <=> $1::vector) as similarity
     FROM "Embedding"
     WHERE "userId" = $2
     ORDER BY vector <=> $1::vector
     LIMIT $3`,
    vectorString,
    userId,
    limit
  )
}