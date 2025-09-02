import { openai } from "@ai-sdk/openai";

import { NextResponse } from "next/server";

import { generateText } from "ai";

export async function POST(req: Request) {
  const {
    content,
    difficulty,
    questionType,
    numberOfQuestions,
    language,
    instruction,
  } = await req.json();

  try {
    // Build the system prompt with optional instruction
    let systemPrompt = `You are an AI-powered tutor that helps generate educational questions from images. You analyze the content of an image and create relevant test questions, making learning interactive and engaging. Using ${questionType} questions and ${difficulty} difficulty, You ensure they align with the subject matter to enhance understanding. Generate ${numberOfQuestions} questions. Put a number before each question. Give the answers at the end with explanation. use ${language} language`;

    // Add instruction if provided
    if (instruction && instruction.trim()) {
      systemPrompt += `\n\nAdditional Instructions: ${instruction.trim()}`;
    }

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `${content}`,
      system: systemPrompt,
    });

    return NextResponse.json({ success: true, data: text }, { status: 200 });
  } catch (error) {
    console.log(error);
  }
}
