import { z } from "zod";

export const ImageSchema = z.object({
  image: z.object({
    name: z.string(),
    url: z.string(),
  }),
  numberOfQuestions: z.string(),
  questionType: z.string(),
  difficulty: z.string(),
  question: z.string(),
});
