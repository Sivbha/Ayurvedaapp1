import { z } from 'zod';

export const symptomEntrySchema = z.object({
  category: z.string(),
  symptoms: z.array(z.string()).default([]),
  severity: z.enum(['mild', 'moderate', 'severe']).optional(),
  notes: z.string().max(2000).optional(),
});

export const symptomsSchema = z.object({
  entries: z.array(symptomEntrySchema),
});

export type SymptomsInput = z.infer<typeof symptomsSchema>;
