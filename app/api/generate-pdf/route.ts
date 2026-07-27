import { NextRequest } from "next/server";
import Groq from "groq-sdk";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { PdfDocument } from "@/lib/PdfDocument";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return Response.json({ message: "Topic is required" }, { status: 400 });
    }

    // 1. Get AI content
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a professional educational writer.",
        },
        {
          role: "user",
          content: `
Write a detailed structured article about "${topic}".
You are an expert academic writer and textbook author.

Write a VERY DETAILED, LONG, structured educational article.
Use clear headings and subheadings.

The article MUST include:
1. Title explanation
2. Introduction (deep and detailed)
3. Background / History (if applicable)
4. Core Concepts (very detailed explanation)
5. Real-world Examples (at least 3)
6. Advantages
7. Disadvantages / Limitations
8. Case studies or use cases
9. Common mistakes or misconceptions
10. Conclusion (deep summary)

Make it feel like a university-level lecture note or eBook chapter.
`,
        },
      ],
    });

    const article =
      completion.choices[0]?.message?.content || "No content generated.";

    // 2. Convert React PDF → Buffer
    const pdfBuffer = await renderToBuffer(
      React.createElement(PdfDocument as React.ComponentType<any>, {
        topic,
        content: article,
      }),
    );

    // 3. Return file
    return new Response(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${topic}.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { message: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
