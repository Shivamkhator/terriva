import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { searchUserData } from "@/lib/embeddings"
import { genAI } from "@/lib/gemini"

function sanitizePlainText(text: string) {
  return text
    .replace(/[*_`#>-]/g, "")     // remove markdown symbols
    .replace(/\n{3,}/g, "\n\n")   // normalize spacing
    .trim()
}


export async function POST(req: Request) {
  try {
    console.log("=== AI Chat Request Started ===")

    const session = await getServerSession(authOptions)
    console.log("Session:", session?.user?.email)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { question, conversationHistory } = await req.json()
    console.log("Question:", question)
    console.log("Conversation History Length:", conversationHistory?.length || 0)

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Invalid question" }, { status: 400 })
    }

    if (conversationHistory && conversationHistory.length >= 10) {
      return NextResponse.json({
        error: "Maximum conversation limit reached (5 questions)",
        limitReached: true
      }, { status: 400 })
    }

    // Search for relevant data
    console.log("Searching user data...")
    const results = await searchUserData(user.id, question, 7)
    console.log("Found results:", results.length)

    const context = results.length > 0
      ? results.map(r => `- ${r.content} (${r.source})`).join("\n")
      : "No relevant data found."

    console.log("Context:", context)

    if (results.length === 0) {
      return NextResponse.json({
        answer:
          "I don’t have enough of your cycle data yet to answer that. Try logging more period or flow information first.",
        sources: [],
      });
    }

    let conversationContext = ""
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext = "\n\nPrevious Conversation:\n" + 
        conversationHistory.map((msg: any) => 
          `${msg.role === 'user' ? 'User' : 'Terriva'}: ${msg.content}`
        ).join("\n")
    }

    // Generate answer with Gemini 2.5 Flash
    console.log("Calling Gemini API...")
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    })

    const result = await model.generateContent(`
You are Terriva, a calm, warm, and human-like menstrual health assistant and also a general guide for women's overall well-being.

STRICT OUTPUT RULES (VERY IMPORTANT):
- Respond ONLY in plain text and in perfect English.
- Do NOT use markdown
- Do NOT use *, **, _, #, -
- Do NOT bold, italicize, or format text in any way
- Write in natural conversational sentences, like a caring human would
- Keep the tone gentle, reassuring, and clear
- Short paragraphs or sentences are preferred
- Keep the answer concise and to the point

BEHAVIOR RULES:
- Use ONLY the user's health data provided below
- Reference previous questions and answers when relevant (from conversation history)
- If the data is insufficient, clearly say you do not have enough information but make sure to give general advice if possible
- Do NOT diagnose or give medical prescriptions
- You may suggest gentle next steps (e.g., tracking more data or consulting a doctor for serious concerns)
- Write as if you are speaking to one person who may be a little worried.
- Acknowledge the user's concern brieflly before answering if they seem very worried
- Always encourage the user to seek professional medical advice for serious or persistent issues
- Be open about the various questions like cycle irregularities, symptoms, mood changes, sex and lifestyle impacts


User's Health Data:
${context}
${conversationContext}

User's Question:
${question}

Now reply in plain, friendly human language.
`)

    const rawAnswer = result.response.text()
    const answer = sanitizePlainText(rawAnswer)
    console.log("Answer generated successfully")
    console.log("=== AI Chat Request Complete ===")

    return NextResponse.json({
      answer,
      sources: results.map(r => ({
        source: r.source,
        content: r.content,
        similarity: Number(r.similarity.toFixed(4))
      }))
    })

  } catch (error: any) {
    console.error("=== AI Chat Error ===")
    console.error(error)

    if (error?.status === 429 || error?.message?.includes("quota")) {
      return NextResponse.json(
        {
          answer:
            "I’m getting a little too many questions right now. Please wait a moment and try again.",
          retryAfter: 40,
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        error: "Failed to process question",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}