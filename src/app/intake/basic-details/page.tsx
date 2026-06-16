'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { basicDetailsSchema, BasicDetailsInput } from '@/lib/validation/basic-details';
import { useWizard } from '../layout';
import { DIETARY_PREFERENCE_OPTIONS } from '@/lib/utils/constants';
import { useState, useEffect } from 'react';

export default function BasicDetailsPage() {
  const { assessmentId, setSaveStatus, handleNext } = useWizard();
  const [loaded, setLoaded] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<BasicDetailsInput>({
    resolver: zodResolver(basicDetailsSchema),
    defaultValues: { dietaryPreferences: [], consentGiven: false, disclaimerAccepted: false },
  });

  const dietaryPrefs = watch('dietaryPreferences');

  useEffect(() => {
    if (!assessmentId || loaded) return;
    (async () => {
      try {
        const res = await fetch(`/api/assessments/${assessmentId}`);
        if (res.ok) {
          const data = await res.json();
          setValue('fullName', data.full_name || '');
          setValue('email', data.email || '');
          setValue('phone', data.phone || '');
          setValue('age', data.age || undefined);
          setValue('sex', data.sex || undefined);
          setValue('country', data.country || '');
          setValue('occupation', data.occupation || '');
          setValue('dietaryPreferences', data.dietary_preferences || []);
          setValue('consentGiven', data.consent_given || false);
          setValue('disclaimerAccepted', data.disclaimer_accepted || false);
        }
      } catch (err) {
        console.error('Basic details load error:', err);
      }
      setLoaded(true);
    })();
  }, [assessmentId, loaded]);

  const saveToServer = async (data: BasicDetailsInput) => {
    await fetch(`/api/assessments/${assessmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: data.fullName, email: data.email, phone: data.phone, age: data.age,
        sex: data.sex, country: data.country, occupation: data.occupation,
        dietary_preferences: data.dietaryPreferences,
        consent_given: data.consentGiven, disclaimer_accepted: data.disclaimerAccepted,
        consent_timestamp: data.consentGiven ? new Date().toISOString() : null,
      }),
    });
  };

  const onSubmit = async (data: BasicDetailsInput) => {
    setSaveStatus('saving');
    await saveToServer(data);
    setSaveStatus('saved');
    handleNext();
  };

  const toggleDietaryPref = (value: string) => {
    const current = dietaryPrefs || [];
    const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    setValue('dietaryPreferences', updated);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Basic Details</h2>
        <p className="mt-1 text-sm text-gray-500">Let us get to know you</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name *</label>
          <input {...register('fullName')} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none" />
          {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email *</label>
          <input {...register('email')} type="email" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none" />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input {...register('phone')} type="tel" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Age *</label>
          <input {...register('age', { valueAsNumber: true })} type="number" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none" />
          {errors.age && <p className="mt-1 text-xs text-red-600">{errors.age.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Sex *</label>
          <select {...register('sex')} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none">
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_say">Prefer not to say</option>
          </select>
          {errors.sex && <p className="mt-1 text-xs text-red-600">{errors.sex.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Country *</label>
          <input {...register('country')} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none" />
          {errors.country && <p className="mt-1 text-xs text-red-600">{errors.country.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Occupation</label>
          <input {...register('occupation')} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preferences</label>
        <div className="flex flex-wrap gap-2">
          {DIETARY_PREFERENCE_OPTIONS.map(opt => (
            <button key={opt.value} type="button" onClick={() => toggleDietaryPref(opt.value)}
              className={`rounded-full px-3 py-1 text-sm border transition-colors ${
                (dietaryPrefs || []).includes(opt.value)
                  ? 'bg-amber-100 border-amber-500 text-amber-800'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-amber-300'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-lg bg-amber-50 p-4">
        <label className="flex items-start gap-3">
          <input type="checkbox" {...register('consentGiven')} className="mt-1 h-4 w-4 rounded border-gray-300 text-amber-700 focus:ring-amber-500" />
          <span className="text-sm text-gray-700">I consent to providing my health and wellness information for the purpose of this Ayurvedic assessment. I understand this is an educational tool only.</span>
        </label>
        {errors.consentGiven && <p className="text-xs text-red-600">{errors.consentGiven.message}</p>}

        <label className="flex items-start gap-3">
          <input type="checkbox" {...register('disclaimerAccepted')} className="mt-1 h-4 w-4 rounded border-gray-300 text-amber-700 focus:ring-amber-500" />
          <span className="text-sm text-gray-700">I acknowledge this is not a medical diagnosis. I understand that recommendations are general wellness suggestions and not a substitute for professional medical advice.</span>
        </label>
        {errors.disclaimerAccepted && <p className="text-xs text-red-600">{errors.disclaimerAccepted.message}</p>}
      </div>

      <button type="submit" className="w-full rounded-lg bg-amber-700 px-4 py-2 text-white hover:bg-amber-800">
        Save & Continue
      </button>
    </form>
  );
}
