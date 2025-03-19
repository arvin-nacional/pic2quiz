import { z } from "zod";

export const ImageSchema = z.object({
  images: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
    })
  ),
  numberOfQuestions: z.string(),
  questionType: z.string(),
  difficulty: z.string(),
  question: z.string(),
});
