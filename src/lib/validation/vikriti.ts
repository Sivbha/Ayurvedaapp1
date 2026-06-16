import { z } from 'zod';

export const vikritiAnswerSchema = z.object({
  category: z.enum(['digestive', 'energy_mood', 'physical', 'reproductive']),
  questionKey: z.string(),
  severity: z.number().int().min(0).max(3),
  durationWeeks: z.number().int().min(1).max(52).optional(),
  doshaImpact: z.object({ vata: z.number().int().min(0).max(3), pitta: z.number().int().min(0).max(3), kapha: z.number().int().min(0).max(3) }),
});

export const vikritiCategoryAnswersSchema = z.object({
  digestive: z.array(vikritiAnswerSchema),
  energy_mood: z.array(vikritiAnswerSchema),
  physical: z.array(vikritiAnswerSchema),
  reproductive: z.array(vikritiAnswerSchema).optional(),
});

export type VikritiCategoryAnswersInput = z.infer<typeof vikritiCategoryAnswersSchema>;
