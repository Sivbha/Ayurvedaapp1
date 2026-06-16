export const APP_NAME = 'Ayurveda Assessment';
export const APP_DESCRIPTION = 'Ayurvedic Prakriti/Vikriti assessment, food diary, and wellness report generation';
export const RED_FLAG_LABELS: Record<string, string> = {
  chest_pain: 'Chest pain or discomfort',
  shortness_of_breath: 'Shortness of breath',
  severe_abdominal_pain: 'Severe abdominal pain',
  blood_in_stool: 'Blood in stool',
  unexplained_weight_loss: 'Unexplained weight loss (>5kg)',
  persistent_fever: 'Persistent fever (>3 days)',
  severe_headache: 'Severe or sudden headache',
  vision_changes: 'Sudden vision changes',
  numbness_weakness: 'Numbness or weakness in limbs',
  suicidal_thoughts: 'Thoughts of self-harm',
  severe_depression: 'Severe depression or anxiety',
  other: 'Other concerning symptoms',
};

export const STEP_LABELS = [
  { step: 1, label: 'Basic Details', href: '/intake/basic-details' },
  { step: 2, label: 'Safety', href: '/intake/safety' },
  { step: 3, label: 'Prakriti', href: '/intake/prakriti/physical' },
  { step: 4, label: 'Vikriti', href: '/intake/vikriti/digestive' },
  { step: 5, label: 'Food Diary', href: '/intake/food-diary/day-1' },
  { step: 6, label: 'Symptoms', href: '/intake/symptoms-lifestyle' },
  { step: 7, label: 'Review & Submit', href: '/intake/review-submit' },
];

export const DIETARY_PREFERENCE_OPTIONS = [
  { value: 'vegan', label: 'Vegan' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'dairy_free', label: 'Dairy-Free' },
  { value: 'gluten_free', label: 'Gluten-Free' },
  { value: 'nut_free', label: 'Nut-Free' },
  { value: 'soy_free', label: 'Soy-Free' },
  { value: 'egg_free', label: 'Egg-Free' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
];
