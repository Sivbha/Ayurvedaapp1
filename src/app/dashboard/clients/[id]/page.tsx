'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('assessments').select('*').eq('id', params.id).single()
      .then(({ data }) => { setAssessment(data); setLoading(false); });
  }, [params.id]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!assessment) return <div className="text-center py-8 text-red-600">Assessment not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{assessment.full_name || 'Client Assessment'}</h1>
          <p className="text-sm text-gray-500">{assessment.email} &middot; {assessment.status}</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/dashboard/clients/${params.id}/practitioner-report`}
            className="rounded-lg bg-amber-700 px-4 py-2 text-white text-sm hover:bg-amber-800">Practitioner Report</Link>
          {assessment.status === 'submitted' && (
            <button onClick={async () => {
              await fetch(`/api/assessments/${params.id}/release`, { method: 'POST' });
              router.refresh();
            }} className="rounded-lg bg-green-700 px-4 py-2 text-white text-sm hover:bg-green-800">Release to Client</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-3">Client Details</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Age</dt><dd>{assessment.age || '-'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Sex</dt><dd>{assessment.sex || '-'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Country</dt><dd>{assessment.country || '-'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Occupation</dt><dd>{assessment.occupation || '-'}</dd></div>
          </dl>
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-3">Safety Flags</h3>
          {assessment.red_flag_detected && (
            <div className="mb-2 rounded-lg bg-red-50 p-2 text-sm text-red-700">Red flags detected</div>
          )}
          {assessment.is_pregnant && <div className="text-sm text-amber-700">Pregnant</div>}
          {assessment.medications?.length > 0 && (
            <div className="mt-2"><span className="text-xs text-gray-500">Medications:</span>
              <p className="text-sm">{assessment.medications.join(', ')}</p></div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Link href={`/dashboard/clients/${params.id}/practitioner-report`}
          className="rounded-lg border border-amber-300 px-4 py-2 text-amber-700 text-sm hover:bg-amber-50">View Practitioner Report</Link>
        <Link href={`/dashboard/clients/${params.id}/client-report`}
          className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 text-sm hover:bg-gray-50">View Client Report</Link>
        <Link href={`/dashboard/clients/${params.id}/notes`}
          className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 text-sm hover:bg-gray-50">Notes</Link>
      </div>
    </div>
  );
}
