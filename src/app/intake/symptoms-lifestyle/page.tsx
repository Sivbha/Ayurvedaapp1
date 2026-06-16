'use client';

import { useState, useEffect } from 'react';
import { proxyFetch, proxyUpsert, proxyDelete } from '@/lib/proxy-db';
import { useWizard } from '../layout';
import { useRouter } from 'next/navigation';

const SYMPTOM_CATEGORIES = [
  { key: 'digestion', label: 'Digestion', symptoms: ['bloating_gas', 'acidity_heartburn', 'heavy_after_meals', 'indigestion', 'burping', 'slow_digestion', 'irregular_appetite'] },
  { key: 'energy', label: 'Energy', symptoms: ['fatigue', 'low_stamina', 'afternoon_slump', 'restlessness', 'sudden_energy_crashes'] },
  { key: 'sleep', label: 'Sleep', symptoms: ['difficulty_falling_asleep', 'waking_frequently', 'vivid_dreams', 'waking_tired', 'sleep_apnea', 'oversleeping'] },
  { key: 'mood', label: 'Mood', symptoms: ['anxiety', 'irritability', 'sadness', 'mood_swings', 'apathy', 'feeling_overwhelmed'] },
  { key: 'skin', label: 'Skin', symptoms: ['dryness', 'oiliness', 'acne', 'rash', 'itching', 'dullness', 'early_wrinkles'] },
  { key: 'hair', label: 'Hair', symptoms: ['hair_loss', 'dryness', 'premature_graying', 'dandruff', 'excessive_oil'] },
  { key: 'joints_muscles', label: 'Joints & Muscles', symptoms: ['stiffness', 'pain', 'swelling', 'weakness', 'cramping', 'muscle_aches'] },
  { key: 'urination', label: 'Urination', symptoms: ['frequent', 'burning_sensation', 'dark_urine', 'cloudy_urine', 'scanty'] },
  { key: 'bowel_movements', label: 'Bowel Movements', symptoms: ['constipation', 'loose_stools', 'irregular', 'urgency', 'incomplete_evacuation', 'mucus'] },
  { key: 'weight_changes', label: 'Weight Changes', symptoms: ['unexplained_gain', 'unexplained_loss', 'difficulty_losing', 'fluctuations', 'fluid_retention'] },
  { key: 'food_cravings', label: 'Food Cravings', symptoms: ['sweet', 'salty', 'sour', 'spicy', 'oily', 'carbohydrates', 'chocolate'] },
  { key: 'stress', label: 'Stress', symptoms: ['work_stress', 'relationship_stress', 'financial_worry', 'burnout', 'overwhelm'] },
  { key: 'temperature_sensitivity', label: 'Temperature Sensitivity', symptoms: ['feeling_cold', 'feeling_hot', 'cold_hands_feet', 'hot_flashes', 'intolerance_to_heat', 'intolerance_to_cold'] },
  { key: 'immunity', label: 'Immunity', symptoms: ['frequent_colds', 'slow_recovery', 'seasonal_allergies', 'frequent_infections', 'autoimmune_issues'] },
  { key: 'pain', label: 'Pain', symptoms: ['headache', 'body_aches', 'back_pain', 'neck_shoulder_tension', 'nerve_pain', 'menstrual_pain'] },
  { key: 'other', label: 'Other Notes', symptoms: [] },
];

const SYMPTOM_LABELS: Record<string, string> = {
  bloating_gas: 'Bloating / Gas', acidity_heartburn: 'Acidity / Heartburn',
  heavy_after_meals: 'Heaviness after meals', indigestion: 'Indigestion',
  slow_digestion: 'Slow digestion', irregular_appetite: 'Irregular appetite',
  fatigue: 'Fatigue / Low energy', low_stamina: 'Low stamina',
  afternoon_slump: 'Afternoon energy slump', restlessness: 'Restlessness',
  sudden_energy_crashes: 'Sudden energy crashes',
  difficulty_falling_asleep: 'Difficulty falling asleep', waking_frequently: 'Waking frequently',
  vivid_dreams: 'Vivid / disturbing dreams', waking_tired: 'Waking up tired',
  oversleeping: 'Oversleeping / hard to wake', sleep_apnea: 'Sleep apnea symptoms',
  anxiety: 'Anxiety / nervousness', irritability: 'Irritability',
  sadness: 'Sadness / low mood', mood_swings: 'Mood swings',
  apathy: 'Apathy / lack of interest', feeling_overwhelmed: 'Feeling overwhelmed',
};

export default function SymptomsLifestylePage() {
  const { assessmentId } = useWizard();
  const router = useRouter();
  const [expandedCategory, setExpandedCategory] = useState('digestion');
  const [entries, setEntries] = useState<Record<string, { symptoms: string[]; severity: string; notes: string }>>({});

  useEffect(() => {
    if (!assessmentId) return;
    (async () => {
      try {
        const { data } = await proxyFetch('symptom_entries', { assessment_id: assessmentId });
        if (data) {
          const loaded: Record<string, any> = {};
          data.forEach((e: any) => { loaded[e.category] = { symptoms: e.symptoms || [], severity: e.severity || 'mild', notes: e.notes || '' }; });
          setEntries(prev => ({ ...prev, ...loaded }));
        }
      } catch (err) { console.error(err); }
    })();
  }, [assessmentId]);

  const toggleSymptom = async (category: string, symptom: string) => {
    const current = entries[category]?.symptoms || [];
    const updated = current.includes(symptom) ? current.filter((s: string) => s !== symptom) : [...current, symptom];
    const newEntry = { ...entries[category], symptoms: updated };
    setEntries(prev => ({ ...prev, [category]: newEntry }));
    try {
      await proxyDelete('symptom_entries', { assessment_id: assessmentId, category });
      await proxyUpsert('symptom_entries', {
        assessment_id: assessmentId, category, symptoms: updated,
        severity: newEntry.severity || 'mild', notes: newEntry.notes || '',
      });
    } catch (err) { console.error(err); }
  };

  const updateField = async (category: string, field: string, value: string) => {
    const newEntry = { ...entries[category], [field]: value };
    setEntries(prev => ({ ...prev, [category]: newEntry }));
    try {
      await proxyDelete('symptom_entries', { assessment_id: assessmentId, category });
      await proxyUpsert('symptom_entries', {
        assessment_id: assessmentId, category,
        symptoms: newEntry.symptoms || [],
        severity: newEntry.severity || 'mild',
        notes: field === 'notes' ? value : newEntry.notes || '',
      });
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
        <p className="text-sm text-amber-800">
          Many people notice small body patterns before they become bigger issues.
          Please share anything you are currently experiencing. This helps us understand
          your current pattern, not judge your health.
        </p>
      </div>

      {SYMPTOM_CATEGORIES.map(cat => (
        <div key={cat.key} className="rounded-lg border border-gray-200">
          <button type="button" onClick={() => setExpandedCategory(expandedCategory === cat.key ? '' : cat.key)}
            className="flex w-full items-center justify-between px-4 py-3 text-left">
            <span className="font-medium text-gray-900">{cat.label}</span>
            <span className="text-xs text-gray-400">
              {(entries[cat.key]?.symptoms?.length || 0) > 0 ? `${entries[cat.key].symptoms.length} selected` : ''}
            </span>
          </button>
          {expandedCategory === cat.key && (
            <div className="border-t border-gray-200 px-4 py-3 space-y-3">
              {cat.symptoms.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {cat.symptoms.map(sym => (
                    <label key={sym} className="flex items-center gap-2">
                      <input type="checkbox" checked={(entries[cat.key]?.symptoms || []).includes(sym)}
                        onChange={() => toggleSymptom(cat.key, sym)}
                        className="h-4 w-4 rounded border-gray-300 text-amber-700" />
                      <span className="text-sm">{SYMPTOM_LABELS[sym] || sym}</span>
                    </label>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3">
                <select value={entries[cat.key]?.severity || 'mild'} onChange={e => updateField(cat.key, 'severity', e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm">
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>
              <textarea placeholder="Additional notes..." value={entries[cat.key]?.notes || ''}
                onChange={e => updateField(cat.key, 'notes', e.target.value)}
                className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" rows={2} />
            </div>
          )}
        </div>
      ))}

      <button onClick={() => router.push('/intake/review-submit')}
        className="w-full rounded-lg bg-amber-700 px-4 py-2 text-white hover:bg-amber-800">
        Continue to Review & Submit
      </button>
    </div>
  );
}
