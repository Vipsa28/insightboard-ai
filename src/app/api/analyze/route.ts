import OpenAI from "openai";
import { NextResponse } from "next/server";

// 🧠 Log to verify environment variable
console.log(
  "🔍 OpenAI Key Loaded:",
  process.env.OPENAI_API_KEY
    ? `${process.env.OPENAI_API_KEY.slice(0, 7)}... (length: ${process.env.OPENAI_API_KEY.length})`
    : "❌ NOT FOUND"
);

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, data } = body;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ result: "❌ Missing OpenAI API Key" }, { status: 500 });
    }

    if (!prompt || !data) {
      return NextResponse.json({ result: "❌ Missing prompt or data" }, { status: 400 });
    }

    const sample = data.slice(0, 20);
    const text = `You are a data analyst. Analyze this CSV data and answer: ${prompt}. 
    Here is a sample of the data: ${JSON.stringify(sample)}`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: text }],
    });

    const answer = completion.choices[0]?.message?.content || "No response from AI.";
    return NextResponse.json({ result: answer });
  } catch (error: any) {
    console.error("Error in /api/analyze:", error);
    return NextResponse.json(
      { result: `❌ Server error: ${error.message || error}` },
      { status: 500 }
    );
  }
}
