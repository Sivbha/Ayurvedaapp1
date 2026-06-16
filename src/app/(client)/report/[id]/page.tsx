'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ClientReportViewPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    supabase.from('reports').select('content').eq('assessment_id', params.id).eq('type', 'client').single()
      .then(({ data }) => {
        if (data?.content) setReport(data.content);
        else setReport({ error: 'Report not available yet' });
      });
  }, [params.id]);

  if (!report) return <div className="text-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent mx-auto" /></div>;
  if (report.error) return <div className="text-center py-12"><p className="text-gray-500">{report.error}</p></div>;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Your Wellness Report</h1>
        <p className="text-sm text-gray-500">Prepared just for you</p>
      </div>

      {report.likelyConstitution && (
        <div className="rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-6 text-center">
          <p className="text-sm text-amber-700">Your Likely Constitution</p>
          <p className="text-3xl font-bold text-amber-800 capitalize">{report.likelyConstitution.type}</p>
          <p className="mt-2 text-sm text-amber-700">{report.likelyConstitution.description}</p>
        </div>
      )}

      {report.currentImbalance && (
        <div className="rounded-lg border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900">Current Pattern</h2>
          <p className="mt-1 text-gray-600">{report.currentImbalance.description}</p>
        </div>
      )}

      {report.whenToSeekHelp?.items?.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h2 className="font-semibold text-red-800">When to Seek Help</h2>
          {report.whenToSeekHelp.items.map((item: any, i: number) => (
            <p key={i} className="mt-1 text-sm text-red-700">{item.symptom}: {item.action}</p>
          ))}
        </div>
      )}

      <div className="rounded-lg bg-gray-50 p-4 text-xs text-gray-500">
        {report.disclaimer || 'This report is for educational purposes only.'}
      </div>
    </div>
  );
}
