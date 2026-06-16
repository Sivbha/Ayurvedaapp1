import { z } from 'zod';

const mealEntrySchema = z.object({
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
  food: z.string().max(500).optional(),
  categories: z.array(z.string()).default([]),
});

export const foodDiaryDaySchema = z.object({
  dayNumber: z.number().int().min(1).max(7),
  date: z.string(),
  wakeTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  breakfast: mealEntrySchema.optional(),
  lunch: mealEntrySchema.optional(),
  dinner: mealEntrySchema.optional(),
  snacks: mealEntrySchema.optional(),
  caffeine: z.boolean().default(false),
  sugarSweets: z.boolean().default(false),
  friedFoods: z.boolean().default(false),
  spicyFoods: z.boolean().default(false),
  fermentedFoods: z.boolean().default(false),
  dairy: z.boolean().default(false),
  glutenWheat: z.boolean().default(false),
  beansLegumes: z.boolean().default(false),
  rawSalads: z.boolean().default(false),
  leftovers: z.boolean().default(false),
  eatingOut: z.boolean().default(false),
  mealSize: z.enum(['small', 'medium', 'large']),
  eatingSpeed: z.enum(['slow', 'moderate', 'fast']),
  hungerBeforeMeals: z.enum(['low', 'normal', 'high']),
  symptomsAfterMeals: z.array(z.string()).default([]),
});

export type FoodDiaryDayInput = z.infer<typeof foodDiaryDaySchema>;
