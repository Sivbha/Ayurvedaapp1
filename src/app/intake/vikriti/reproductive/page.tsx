'use client';

import { useState, useEffect } from 'react';
import { proxyFetch, proxyUpsert } from '@/lib/proxy-db';
import { useWizard } from '../../layout';
import vikritiRules from '@/lib/rules/vikriti-weights.json';
import { useRouter } from 'next/navigation';

export default function VikritiReproductivePage() {
  const { assessmentId } = useWizard();
  const router = useRouter();
  const [severities, setSeverities] = useState<Record<string, number>>({});
  const [showSection, setShowSection] = useState(false);

  const questions = (vikritiRules.categories as any).reproductive?.questions || {};

  useEffect(() => {
    if (!assessmentId) return;
    (async () => {
      try {
        const { data } = await proxyFetch('assessments', { id: assessmentId }, { select: 'sex' });
        if (data?.[0]?.sex === 'female') setShowSection(true);
        else setShowSection(false);
      } catch (err) { console.error(err); }
    })();
  }, [assessmentId]);

  const handleSeverityChange = async (questionKey: string, severity: number) => {
    setSeverities(prev => ({ ...prev, [questionKey]: severity }));
    const q = questions[questionKey as keyof typeof questions];
    try {
      await proxyUpsert('vikriti_answers', {
        assessment_id: assessmentId, category: 'reproductive',
        question_key: questionKey, severity,
        dosha_impact: (q as any).doshaImpact || { vata: 0, pitta: 0, kapha: 0 },
      }, 'assessment_id, question_key');
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      {showSection ? (
        <>
          <p className="text-sm text-amber-700">Rate any reproductive or menstrual symptoms (optional)</p>
          {Object.entries(questions).map(([key, q]: [string, any]) => (
            <div key={key} className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-3">{q.label}</h3>
              <div className="flex items-center gap-3">
                {[0, 1, 2, 3].map(level => (
                  <button key={level} type="button" onClick={() => handleSeverityChange(key, level)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium ${
                      severities[key] === level
                        ? level === 0 ? 'bg-gray-100 border-gray-400' :
                          level === 1 ? 'bg-green-100 border-green-500 text-green-800' :
                          level === 2 ? 'bg-yellow-100 border-yellow-500 text-yellow-800' :
                          'bg-red-100 border-red-500 text-red-800'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'
                    }`}>{level}</button>
                ))}
                <span className="text-xs text-gray-500">
                  {severities[key] === 0 ? 'None' : severities[key] === 1 ? 'Mild' : severities[key] === 2 ? 'Moderate' : 'Severe'}
                </span>
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className="rounded-lg bg-gray-50 p-6 text-center">
          <p className="text-gray-500">This section is optional and relevant for female reproductive health.</p>
          <p className="mt-2 text-sm text-gray-400">You can skip this section.</p>
        </div>
      )}
      <div className="flex gap-3">
        <button onClick={() => router.push('/intake/vikriti/physical')} className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">Previous</button>
        <button onClick={() => router.push('/intake/vikriti/review')}
          className="flex-1 rounded-lg bg-amber-700 px-4 py-2 text-white hover:bg-amber-800">Review Answers</button>
      </div>
    </div>
  );
}
