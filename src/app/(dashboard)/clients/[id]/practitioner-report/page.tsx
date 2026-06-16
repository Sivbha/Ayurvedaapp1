'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function PractitionerReportPage() {
  const params = useParams();
  const supabase = createClient();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('reports').select('content').eq('assessment_id', params.id).eq('type', 'practitioner').single()
      .then(({ data }) => { setReport(data?.content); setLoading(false); });
  }, [params.id]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!report) return <div className="text-center py-8">Report not generated yet. Submit the assessment first.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Practitioner Report</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prakriti Section */}
        {report.prakritiConclusion && (
          <div className="rounded-lg border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900">Prakriti (Constitution)</h2>
            <p className="text-3xl font-bold text-amber-700 mt-2 capitalize">{report.prakritiConclusion.constitution}</p>
            <p className="text-sm text-gray-500 mt-1">Confidence: {Math.round((report.prakritiConclusion.confidence || 0) * 100)}%</p>
            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-purple-500" /><span className="text-sm">Vata: {report.prakritiConclusion.scores?.vata ?? 0}%</span></div>
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500" /><span className="text-sm">Pitta: {report.prakritiConclusion.scores?.pitta ?? 0}%</span></div>
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-green-500" /><span className="text-sm">Kapha: {report.prakritiConclusion.scores?.kapha ?? 0}%</span></div>
            </div>
          </div>
        )}

        {/* Vikriti Section */}
        {report.vikritiConclusion && (
          <div className="rounded-lg border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900">Vikriti (Current Imbalance)</h2>
            <p className="text-3xl font-bold text-amber-700 mt-2 capitalize">{report.vikritiConclusion.imbalance}</p>
            <p className="text-sm text-gray-500 mt-1">Severity: <span className="font-medium capitalize">{report.vikritiConclusion.severity}</span></p>
            {report.vikritiConclusion.keySymptoms?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">Key symptoms:</p>
                <ul className="space-y-1">{report.vikritiConclusion.keySymptoms.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-gray-700">{s}</li>
                ))}</ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Agni & Ama */}
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-lg border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900">Agni (Digestive Fire)</h2>
          <p className="text-lg font-medium text-amber-700 mt-1 capitalize">{report.agniAssessment?.type || 'N/A'}</p>
          <p className="mt-2 text-sm text-gray-600">{report.agniAssessment?.description || ''}</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900">Ama (Toxins)</h2>
          <p className="text-lg font-medium text-amber-700 mt-1 capitalize">{report.amaIndicators?.level || 'N/A'}</p>
          {report.amaIndicators?.indicators?.length > 0 && (
            <div className="mt-2"><p className="text-xs text-gray-500">Indicators:</p>
              <ul className="text-sm">{report.amaIndicators.indicators.map((i: string, idx: number) => (
                <li key={idx}>{i}</li>
              ))}</ul>
            </div>
          )}
        </div>
      </div>

      {/* Food Pattern */}
      {report.foodPatternAnalysis && (
        <div className="rounded-lg border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900">Food Pattern Analysis</h2>
          <p className="text-sm text-gray-600 mt-1">Pattern: <span className="font-medium capitalize">{report.foodPatternAnalysis.patternType}</span></p>
          {report.foodPatternAnalysis.keyFindings?.length > 0 && (
            <ul className="mt-2 space-y-1">{report.foodPatternAnalysis.keyFindings.map((f: string, i: number) => (
              <li key={i} className="text-sm text-gray-700">&bull; {f}</li>
            ))}</ul>
          )}
        </div>
      )}

      {/* Medical Cautions */}
      {report.medicalCautions?.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h2 className="font-semibold text-red-800">Medical Cautions</h2>
          {report.medicalCautions.map((c: any, i: number) => (
            <p key={i} className="mt-1 text-sm text-red-700">{c.description}: {c.recommendation}</p>
          ))}
        </div>
      )}

      {/* Follow-up Questions */}
      {report.followUpQuestions?.length > 0 && (
        <div className="rounded-lg border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900">Follow-up Questions</h2>
          {report.followUpQuestions.map((q: any, i: number) => (
            <div key={i} className="mt-2">
              <p className="text-sm font-medium text-gray-800">{q.question}</p>
              <p className="text-xs text-gray-500">{q.context} &middot; Priority: {q.priority}</p>
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-lg bg-gray-50 p-4 text-xs text-gray-500">
        This report is for educational purposes only. Not a medical diagnosis.
      </div>
    </div>
  );
}
