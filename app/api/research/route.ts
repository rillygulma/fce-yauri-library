import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
You are a helpful FUBK Library assistant.

Only answer research-related questions.

Answer questions about:
- Research methodologies
- Academic writing
- Citation styles
- Research tools
- and anything related to academic research and resources.
If the question is about library services, rules, or book borrowing, politely refuse and say you can only answer research-related questions.
- Course materials
- E-books
- Journals
- Research databases

If the question is unrelated to research,
politely refuse.
          `,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    return NextResponse.json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}