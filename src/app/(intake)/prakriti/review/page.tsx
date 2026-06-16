'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useWizard } from '../../layout';
import { useRouter } from 'next/navigation';
import prakritiRules from '@/lib/rules/prakriti-weights.json';

export default function PrakritiReviewPage() {
  const { assessmentId } = useWizard();
  const supabase = createClient();
  const router = useRouter();
  const [answersByCategory, setAnswersByCategory] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!assessmentId) return;
    supabase.from('prakriti_answers').select('*').eq('assessment_id', assessmentId)
      .then(({ data }) => {
        if (data) {
          const grouped: Record<string, any[]> = {};
          data.forEach((a: any) => {
            if (!grouped[a.category]) grouped[a.category] = [];
            grouped[a.category].push(a);
          });
          setAnswersByCategory(grouped);
        }
        setLoading(false);
      });
  }, [assessmentId]);

  const allCategories = ['physical', 'metabolic', 'behavioral', 'psychological'];
  const categoryLabels: Record<string, string> = { physical: 'Physical', metabolic: 'Metabolic', behavioral: 'Behavioral', psychological: 'Psychological' };
  const categoryRoutes: Record<string, string> = { physical: '/intake/prakriti/physical', metabolic: '/intake/prakriti/metabolic', behavioral: '/intake/prakriti/behavioral', psychological: '/intake/prakriti/psychological' };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Review Your Prakriti Answers</h3>
      {allCategories.map(cat => {
        const catAnswers = answersByCategory[cat] || [];
        const questions = (prakritiRules.questions as any)[cat] || {};
        return (
          <div key={cat} className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-amber-800">{categoryLabels[cat]}</h4>
              <button onClick={() => router.push(categoryRoutes[cat])} className="text-sm text-amber-700 hover:text-amber-800">Edit</button>
            </div>
            {catAnswers.length === 0 ? (
              <p className="text-sm text-gray-400">No answers yet</p>
            ) : (
              <ul className="space-y-2">
                {catAnswers.map((a: any) => (
                  <li key={a.question_key} className="text-sm">
                    <span className="text-gray-500">{questions[a.question_key]?.label || a.question_key}:</span>{' '}
                    <span className="text-gray-900">{a.answer_label || a.answer_value}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
      <button onClick={() => router.push('/intake/vikriti/digestive')}
        className="w-full rounded-lg bg-amber-700 px-4 py-2 text-white hover:bg-amber-800">
        Continue to Vikriti Assessment
      </button>
    </div>
  );
}
