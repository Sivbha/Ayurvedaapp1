'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useWizard } from '../layout';
import { useRouter } from 'next/navigation';

export default function ReviewSubmitPage() {
  const { assessmentId, setSaveStatus } = useWizard();
  const supabase = createClient();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [assessment, setAssessment] = useState<any>(null);
  const [scoringReady, setScoringReady] = useState(false);

  useEffect(() => {
    if (!assessmentId) return;
    supabase.from('assessments').select('*').eq('id', assessmentId).single()
      .then(({ data }) => setAssessment(data));

    supabase.from('scoring_results').select('id').eq('assessment_id', assessmentId).single()
      .then(({ data }) => setScoringReady(!!data));
  }, [assessmentId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSaveStatus('saving');

    await supabase.from('assessments').update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    }).eq('id', assessmentId);

    await fetch(`/api/assessments/${assessmentId}/score`, { method: 'POST' });

    await fetch(`/api/assessments/${assessmentId}/practitioner-report`, { method: 'POST' });

    setSubmitting(false);
    setSaveStatus('saved');
    router.push('/intake/submitted');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Review & Submit</h2>

      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Basic Details</h3>
            <a href="/intake/basic-details" className="text-sm text-amber-700">Edit</a>
          </div>
          {assessment && (
            <div className="mt-2 text-sm text-gray-600">
              <p>{assessment.full_name} &middot; {assessment.email} &middot; Age {assessment.age}</p>
              <p>{assessment.country}{assessment.occupation ? ` &middot; ${assessment.occupation}` : ''}</p>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Health & Safety</h3>
            <a href="/intake/safety" className="text-sm text-amber-700">Edit</a>
          </div>
          {assessment && (
            <div className="mt-2 text-sm text-gray-600">
              {assessment.red_flag_detected && <p className="text-red-600 font-medium">Red flags detected &mdash; medical attention recommended</p>}
              {assessment.is_pregnant && <p>Pregnant</p>}
              {assessment.medications?.length > 0 && <p>Medications: {assessment.medications.join(', ')}</p>}
              {!assessment.is_pregnant && !assessment.red_flag_detected && assessment.medications?.length === 0 && <p>No health concerns reported</p>}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Questionnaires</h3>
            <a href="/intake/prakriti/physical" className="text-sm text-amber-700">Edit</a>
          </div>
          <p className="mt-2 text-sm text-gray-500">Prakriti (constitution) and Vikriti (current symptoms) completed</p>
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Food Diary</h3>
            <a href="/intake/food-diary/day-1" className="text-sm text-amber-700">Edit</a>
          </div>
          <p className="mt-2 text-sm text-gray-500">7-day food diary completed</p>
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Symptoms & Lifestyle</h3>
            <a href="/intake/symptoms-lifestyle" className="text-sm text-amber-700">Edit</a>
          </div>
          <p className="mt-2 text-sm text-gray-500">Current symptoms recorded</p>
        </div>
      </div>

      <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
        <p className="text-sm text-amber-800">
          By submitting, you consent to having your information reviewed by an Ayurvedic practitioner.
          Your report will be generated and made available once reviewed.
        </p>
      </div>

      <button onClick={handleSubmit} disabled={submitting}
        className="w-full rounded-lg bg-amber-700 px-4 py-3 text-white font-medium hover:bg-amber-800 disabled:opacity-50">
        {submitting ? 'Submitting & Generating Report...' : 'Submit Assessment'}
      </button>
    </div>
  );
}
