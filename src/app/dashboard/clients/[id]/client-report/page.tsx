'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ClientReportPage() {
  const params = useParams();
  const supabase = createClient();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('reports').select('content').eq('assessment_id', params.id).eq('type', 'client').single()
      .then(({ data }) => { setReport(data?.content); setLoading(false); });
  }, [params.id]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!report) return <div className="text-center py-8 text-gray-500">Client report not yet released.</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Your Wellness Report</h1>
        <p className="text-sm text-gray-500 mt-1">Personalized insights based on your assessment</p>
      </div>

      <div className="rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 p-6 text-center border border-amber-200">
        <p className="text-sm text-amber-700">Your likely constitution</p>
        <p className="text-3xl font-bold text-amber-800 capitalize mt-1">{report.likelyConstitution?.type || 'Balanced'}</p>
        <p className="mt-2 text-sm text-amber-700">{report.likelyConstitution?.description || ''}</p>
      </div>

      <div className="rounded-lg border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900">Current Pattern</h2>
        <p className="mt-1 text-gray-600">{report.currentImbalance?.description || ''}</p>
        {report.currentImbalance?.mainSymptoms?.length > 0 && (
          <div className="mt-3">
            <p className="text-sm text-gray-500">Noticed patterns:</p>
            <div className="mt-1 flex flex-wrap gap-2">{report.currentImbalance.mainSymptoms.map((s: string, i: number) => (
              <span key={i} className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-800">{s}</span>
            ))}</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h3 className="font-medium text-green-800">Foods to Favour</h3>
          <ul className="mt-2 space-y-1">
            {report.foodsToFavour?.map((f: any, i: number) => (
              <li key={i} className="text-sm text-green-700">✦ {f.name}</li>
            )) || <li className="text-sm text-green-600">See practitioner for details</li>}
          </ul>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="font-medium text-red-800">Foods to Reduce</h3>
          <ul className="mt-2 space-y-1">
            {report.foodsToReduce?.map((f: any, i: number) => (
              <li key={i} className="text-sm text-red-700">✧ {f.name}</li>
            )) || <li className="text-sm text-red-600">See practitioner for details</li>}
          </ul>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-900">Gentle Movement</h2>
        <p className="mt-1 text-sm text-gray-600">{report.gentleMovement?.durationMinutes || 30} min, {report.gentleMovement?.frequencyPerWeek || 5}x/week</p>
      </div>

      <div className="rounded-lg border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-900">Breathwork</h2>
        {report.breathwork?.techniques?.map((t: any, i: number) => (
          <div key={i} className="mt-2">
            <p className="font-medium text-sm">{t.name}</p>
            <p className="text-xs text-gray-500 italic">{t.sanskritName}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <strong>When to seek help:</strong>
        <p className="mt-1">{report.whenToSeekHelp?.disclaimer || 'This is an educational tool. Consult your doctor for medical advice.'}</p>
      </div>

      <div className="rounded-lg bg-gray-50 p-4 text-xs text-gray-500">
        {report.disclaimer || 'This report is for educational purposes only. Not medical advice.'}
      </div>
    </div>
  );
}
