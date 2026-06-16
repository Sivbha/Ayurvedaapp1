'use client';

import { useState, useEffect } from 'react';
import { useWizard } from '../../layout';
import prakritiRules from '@/lib/rules/prakriti-weights.json';
import { useRouter } from 'next/navigation';
import { proxyFetch, proxyUpsert } from '@/lib/proxy-db';

export default function PrakritiMetabolicPage() {
  const { assessmentId } = useWizard();
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions = (prakritiRules.questions as any).metabolic;

  useEffect(() => {
    if (!assessmentId) return;
    (async () => {
      try {
        const { data } = await proxyFetch('prakriti_answers', { assessment_id: assessmentId, category: 'metabolic' });
        if (data) {
          const loaded: Record<string, string> = {};
          data.forEach((a: any) => loaded[a.question_key] = a.answer_value);
          setAnswers(prev => ({ ...prev, ...loaded }));
        }
      } catch (err) {
        console.error('Load metabolic answers error:', err);
      }
    })();
  }, [assessmentId]);

  const handleSelect = async (questionKey: string, answerValue: string) => {
    setAnswers(prev => ({ ...prev, [questionKey]: answerValue }));
    const question = questions[questionKey as keyof typeof questions];
    const option = (question as any).options[answerValue];
    try {
      await proxyUpsert('prakriti_answers', {
        assessment_id: assessmentId, category: 'metabolic',
        question_key: questionKey, answer_value: answerValue,
        answer_label: option?.label || '',
        dosha_scores: option?.dosha || { vata: 0, pitta: 0, kapha: 0 },
      }, 'assessment_id, question_key');
    } catch (err) {
      console.error('Save metabolic answer error:', err);
    }
  };

  const allAnswered = Object.keys(questions).every(q => answers[q]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-amber-700">Your lifelong metabolic and energy patterns</p>
      {Object.entries(questions).map(([key, q]: [string, any]) => (
        <div key={key} className="rounded-lg border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-3">{q.label}</h3>
          <div className="space-y-2">
            {Object.entries(q.options).map(([optValue, opt]: [string, any]) => (
              <button key={optValue} type="button" onClick={() => handleSelect(key, optValue)}
                className={`w-full text-left rounded-lg border px-4 py-3 text-sm transition-colors ${
                  answers[key] === optValue
                    ? 'bg-amber-100 border-amber-500 text-amber-900'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-amber-300'
                }`}>{opt.label}</button>
            ))}
          </div>
        </div>
      ))}
      <div className="flex gap-3">
        <button onClick={() => router.push('/intake/prakriti/physical')} className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">Previous</button>
        <button onClick={() => router.push('/intake/prakriti/behavioral')} disabled={!allAnswered}
          className="flex-1 rounded-lg bg-amber-700 px-4 py-2 text-white hover:bg-amber-800 disabled:opacity-50">Continue to Behavioral</button>
      </div>
    </div>
  );
}
