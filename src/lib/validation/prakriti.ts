import { z } from 'zod';

export const prakritiAnswerSchema = z.object({
  category: z.enum(['physical', 'metabolic', 'behavioral', 'psychological']),
  questionKey: z.string(),
  answerValue: z.string(),
  answerLabel: z.string(),
  doshaScores: z.object({ vata: z.number().int().min(0).max(3), pitta: z.number().int().min(0).max(3), kapha: z.number().int().min(0).max(3) }),
});

export const prakritiCategoryAnswersSchema = z.object({
  physical: z.array(prakritiAnswerSchema),
  metabolic: z.array(prakritiAnswerSchema),
  behavioral: z.array(prakritiAnswerSchema),
  psychological: z.array(prakritiAnswerSchema),
});

export type PrakritiCategoryAnswersInput = z.infer<typeof prakritiCategoryAnswersSchema>;
