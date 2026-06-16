import { z } from 'zod';

export const basicDetailsSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number too short').max(20).optional().or(z.literal('')),
  age: z.number({ message: 'Age is required' }).min(1, 'Age required').max(120, 'Invalid age'),
  sex: z.enum(['male', 'female', 'other', 'prefer_not_say']),
  country: z.string().min(2, 'Country required').max(100),
  occupation: z.string().max(100).optional().or(z.literal('')),
  dietaryPreferences: z.array(z.string()),
  consentGiven: z.boolean().refine((v) => v === true, 'You must provide consent to proceed'),
  disclaimerAccepted: z.boolean().refine((v) => v === true, 'You must accept the disclaimer to proceed'),
});

export type BasicDetailsInput = z.infer<typeof basicDetailsSchema>;
