'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { safetySchema, SafetyInput } from '@/lib/validation/safety';
import { createClient } from '@/lib/supabase/client';
import { useWizard } from '../layout';
import { RED_FLAG_LABELS } from '@/lib/utils/constants';
import { useState, useEffect } from 'react';

export default function SafetyPage() {
  const { assessmentId, setSaveStatus, handleNext } = useWizard();
  const supabase = createClient();
  const [loaded, setLoaded] = useState(false);
  const [showRedFlagWarning, setShowRedFlagWarning] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SafetyInput>({
    resolver: zodResolver(safetySchema),
    defaultValues: { isPregnant: false, isBreastfeeding: false, medications: [], healthConditions: [], allergies: [], redFlags: [] },
  });

  const redFlags = watch('redFlags');
  const [medInput, setMedInput] = useState('');
  const [medItems, setMedItems] = useState<string[]>([]);
  const [condInput, setCondInput] = useState('');
  const [condItems, setCondItems] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [allergyItems, setAllergyItems] = useState<string[]>([]);

  useEffect(() => {
    if (!assessmentId || loaded) return;
    supabase.from('assessments').select('*').eq('id', assessmentId).single().then(({ data }) => {
      if (data) {
        setValue('isPregnant', data.is_pregnant || false);
        setValue('isBreastfeeding', data.is_breastfeeding || false);
        setMedItems(data.medications || []);
        setCondItems(data.health_conditions || []);
        setAllergyItems(data.allergies || []);
        setValue('redFlags', data.red_flags || []);
      }
      setLoaded(true);
    });
  }, [assessmentId, loaded]);

  useEffect(() => {
    setValue('medications', medItems);
  }, [medItems]);
  useEffect(() => {
    setValue('healthConditions', condItems);
  }, [condItems]);
  useEffect(() => {
    setValue('allergies', allergyItems);
  }, [allergyItems]);

  const addTag = (input: string, items: string[], setter: (v: string[]) => void) => {
    if (input.trim() && !items.includes(input.trim())) setter([...items, input.trim()]);
  };

  const onSubmit = async (data: SafetyInput) => {
    setSaveStatus('saving');
    if (data.redFlags.length > 0) setShowRedFlagWarning(true);
    await supabase.from('assessments').update({
      is_pregnant: data.isPregnant, is_breastfeeding: data.isBreastfeeding,
      medications: data.medications, health_conditions: data.healthConditions,
      allergies: data.allergies, red_flags: data.redFlags,
    }).eq('id', assessmentId);
    setSaveStatus('saved');
    handleNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Health & Safety Information</h2>
        <p className="mt-1 text-sm text-gray-500">This helps us provide appropriate recommendations</p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('isPregnant')} className="h-4 w-4 rounded border-gray-300 text-amber-700" />
            <span className="text-sm">Pregnant</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('isBreastfeeding')} className="h-4 w-4 rounded border-gray-300 text-amber-700" />
            <span className="text-sm">Breastfeeding</span>
          </label>
        </div>

        {/* Medications tag input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Medications</label>
          <div className="mt-1 flex flex-wrap gap-2 mb-2">
            {medItems.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                {item}
                <button type="button" onClick={() => setMedItems(medItems.filter((_, j) => j !== i))} className="text-blue-600 hover:text-blue-800">&times;</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={medInput} onChange={(e) => setMedInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(medInput, medItems, setMedItems); setMedInput(''); } }}
              placeholder="Type a medication and press Enter" className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none" />
            <button type="button" onClick={() => { addTag(medInput, medItems, setMedItems); setMedInput(''); }}
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">Add</button>
          </div>
        </div>

        {/* Health conditions tag input - same pattern */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Health Conditions</label>
          <div className="mt-1 flex flex-wrap gap-2 mb-2">
            {condItems.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-800">
                {item}
                <button type="button" onClick={() => setCondItems(condItems.filter((_, j) => j !== i))} className="text-orange-600">&times;</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={condInput} onChange={(e) => setCondInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(condInput, condItems, setCondItems); setCondInput(''); } }}
              placeholder="Type a condition and press Enter" className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none" />
            <button type="button" onClick={() => { addTag(condInput, condItems, setCondItems); setCondInput(''); }}
              className="rounded-lg bg-orange-600 px-3 py-2 text-sm text-white hover:bg-orange-700">Add</button>
          </div>
        </div>

        {/* Allergies tag input - same pattern */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Allergies</label>
          <div className="mt-1 flex flex-wrap gap-2 mb-2">
            {allergyItems.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">
                {item}
                <button type="button" onClick={() => setAllergyItems(allergyItems.filter((_, j) => j !== i))} className="text-red-600">&times;</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={allergyInput} onChange={(e) => setAllergyInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(allergyInput, allergyItems, setAllergyItems); setAllergyInput(''); } }}
              placeholder="Type an allergy and press Enter" className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none" />
            <button type="button" onClick={() => { addTag(allergyInput, allergyItems, setAllergyItems); setAllergyInput(''); }}
              className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700">Add</button>
          </div>
        </div>

        {/* Red flags */}
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <label className="block text-sm font-medium text-red-800 mb-2">Red Flag Symptoms</label>
          <p className="text-xs text-red-600 mb-3">Check any symptoms you are currently experiencing. If any apply, we will recommend seeking professional medical care.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(RED_FLAG_LABELS).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2">
                <input type="checkbox" value={key} checked={(redFlags || []).includes(key)}
                  onChange={(e) => {
                    const updated = e.target.checked ? [...(redFlags || []), key] : (redFlags || []).filter(f => f !== key);
                    setValue('redFlags', updated);
                  }}
                  className="h-4 w-4 rounded border-red-400 text-red-600 focus:ring-red-500" />
                <span className="text-sm text-red-800">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {showRedFlagWarning && (
          <div className="rounded-lg border border-amber-400 bg-amber-50 p-4">
            <h4 className="font-medium text-amber-800">Medical Attention Recommended</h4>
            <p className="mt-1 text-sm text-amber-700">You have selected one or more red flag symptoms. Please consult a qualified healthcare provider before proceeding with dietary or lifestyle changes.</p>
          </div>
        )}
      </div>

      <button type="submit" className="w-full rounded-lg bg-amber-700 px-4 py-2 text-white hover:bg-amber-800">
        Save & Continue
      </button>
    </form>
  );
}
