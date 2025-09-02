import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";
import { generateText } from "ai";

export async function POST(req: Request) {
  const { content, detailLevel, format, language } = await req.json();

  try {
    // Configure detail level prompts
    const detailLevelPrompts = {
      "very-detailed":
        "Create an extremely detailed and comprehensive reviewer that covers all aspects of the content with thorough explanations and examples",
      thorough:
        "Create a thorough reviewer that covers important concepts in detail with clear explanations",
      medium:
        "Create a balanced reviewer with moderate detail, focusing on key concepts and supporting points",
      "main-ideas":
        "Focus only on the main ideas and core concepts, ignoring minor details",
      concise:
        "Create a concise, minimalist reviewer that captures only the absolute essential information",
    };

    // Configure format prompts
    const formatPrompts = {
      "bullet-points":
        "Format the content as organized bullet points with clear hierarchical structure",
      paragraphs:
        "Format the content as well-structured paragraphs with clear transitions",
      flashcards:
        "Format the content as question/answer pairs suitable for flashcard studying",
      "mind-map":
        "Format the content in a hierarchical structure similar to a mind map, with main concepts and supporting details",
      summary:
        "Format the content as a concise executive summary of the most important information",
      "terms-table": `Format the content as a simple two-column table with the following structure:
      **Term** | **Definition / Example**
      - Each row should contain a term in the first column, and its definition (plus example if applicable) in the second column
      - Keep the formatting in clean markdown table format`,
    };

    const selectedDetailLevel =
      detailLevelPrompts[detailLevel as keyof typeof detailLevelPrompts] ||
      detailLevelPrompts["medium"];
    const selectedFormat =
      formatPrompts[format as keyof typeof formatPrompts] ||
      formatPrompts["bullet-points"];

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `${content}`,
      system: `You are an AI-powered educational assistant that creates concise, effective study materials from text. 
      
Detail Level: ${selectedDetailLevel}.
Format: ${selectedFormat}.

Create a comprehensive study reviewer based on the following content. Focus on organizing the information in a way that helps with learning and retention. If the content appears to be from a textbook, lecture notes, or educational material, structure the reviewer to highlight key concepts, definitions, theories, and examples.

Use the ${language} language for the entire response.

Start with a brief overview of what the content covers, then organize the main body of the reviewer according to the specified format. Make sure to maintain academic accuracy while making the content more accessible for studying.

IMPORTANT FORMATTING INSTRUCTIONS:
- DO NOT use horizontal rules/thematic breaks (---, ___, ***) in your response
- DO NOT use HTML tags
- Use headings (# Title), bold (**text**), and italic (*text*) for formatting
- For lists, use proper markdown format with a space after the bullet point (- Item) or number (1. Item)
- For tables, use simple markdown tables with | separators`,
    });

    return NextResponse.json({ success: true, data: text }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, error: "Failed to generate reviewer content" },
      { status: 500 }
    );
  }
}
