import { z } from 'zod';

export const safetySchema = z.object({
  isPregnant: z.boolean(),
  isBreastfeeding: z.boolean(),
  medications: z.array(z.string().max(200)),
  healthConditions: z.array(z.string().max(200)),
  allergies: z.array(z.string().max(200)),
  redFlags: z.array(z.string()),
});

export type SafetyInput = z.infer<typeof safetySchema>;
