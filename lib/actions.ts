"use server";

import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function uploadImage(file: File) {
  //   try {
  //     const blob = await put(`images/${Date.now()}-${file.name}`, file, {
  //       access: "public",
  //     });
  //     return blob.url;
  //   } catch (error) {
  //     console.error("Error uploading image:", error);
  //     throw new Error("Failed to upload image");
  //   }
}

export async function generateQuiz(imageUrl: string) {
  try {
    const prompt = `
      Analyze the image at this URL: ${imageUrl}
      
      Based on the content of this image, generate a quiz with 5 multiple-choice questions.
      Each question should have 4 options with exactly one correct answer.
      
      Return the result as a JSON array with this structure:
      [
        {
          "question": "Question text here",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0 // Index of the correct answer (0-3)
        },
        // more questions...
      ]
      
      Make sure the questions are directly related to what can be seen in the image.
      If the image doesn't contain enough recognizable content, return an empty array.
    `;

    const { text } = await generateText({
      model: openai("gpt-4-vision-preview"),
      prompt: prompt,
    });

    try {
      // Parse the JSON response
      const quizData = JSON.parse(text);
      return quizData;
    } catch (parseError) {
      console.error("Failed to parse quiz data:", parseError);
      return [];
    }
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz");
  }
}
