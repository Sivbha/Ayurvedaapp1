'use client';

import { useEffect, useState } from 'react';
import { proxyFetch } from '@/lib/proxy-db';
import { useWizard } from '../../layout';
import { useRouter } from 'next/navigation';
import vikritiRules from '@/lib/rules/vikriti-weights.json';

export default function VikritiReviewPage() {
  const { assessmentId } = useWizard();
  const router = useRouter();
  const [answersByCategory, setAnswersByCategory] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!assessmentId) return;
    (async () => {
      try {
        const { data } = await proxyFetch('vikriti_answers', { assessment_id: assessmentId });
        if (data) {
          const grouped: Record<string, any[]> = {};
          data.forEach((a: any) => {
            if (!grouped[a.category]) grouped[a.category] = [];
            grouped[a.category].push(a);
          });
          setAnswersByCategory(grouped);
        }
        setLoading(false);
      } catch (err) { console.error(err); }
    })();
  }, [assessmentId]);

  const categoryLabels: Record<string, string> = { digestive: 'Digestive', energy_mood: 'Energy & Mood', physical: 'Physical', reproductive: 'Reproductive' };
  const severityLabels = ['None', 'Mild', 'Moderate', 'Severe'];

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Review Your Vikriti Answers</h3>
      {Object.entries(categoryLabels).map(([cat, label]) => {
        const catAnswers = answersByCategory[cat] || [];
        const questions = (vikritiRules.categories as any)[cat]?.questions || {};
        if (cat === 'reproductive' && catAnswers.length === 0) return null;
        return (
          <div key={cat} className="rounded-lg border border-gray-200 p-4">
            <h4 className="font-medium text-amber-800 mb-3">{label}</h4>
            {catAnswers.length === 0 ? (
              <p className="text-sm text-gray-400">No symptoms reported</p>
            ) : (
              <ul className="space-y-2">
                {catAnswers.map((a: any) => (
                  <li key={a.question_key} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{questions[a.question_key]?.label || a.question_key}</span>
                    <span className={`font-medium ${
                      a.severity <= 1 ? 'text-green-600' : a.severity === 2 ? 'text-yellow-600' : 'text-red-600'
                    }`}>{severityLabels[a.severity]}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
      <button onClick={() => router.push('/intake/food-diary/1')}
        className="w-full rounded-lg bg-amber-700 px-4 py-2 text-white hover:bg-amber-800">
        Continue to Food Diary
      </button>
    </div>
  );
}
