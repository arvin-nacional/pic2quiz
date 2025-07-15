import { z } from "zod";

export const ImageSchema = z.object({
  images: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
    })
  ),
  numberOfQuestions: z.string().min(1),
  questionType: z.string().min(1),
  difficulty: z.string().min(1),
  question: z.string(),
  language: z.string().min(1),
});
