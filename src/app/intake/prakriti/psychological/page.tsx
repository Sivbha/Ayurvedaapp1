'use client';

import { useState, useEffect } from 'react';
import { proxyFetch, proxyUpsert, proxyDelete } from '@/lib/proxy-db';
import { useWizard } from '../../layout';
import prakritiRules from '@/lib/rules/prakriti-weights.json';
import { useRouter } from 'next/navigation';

export default function PrakritiPsychologicalPage() {
  const { assessmentId } = useWizard();
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const questions = (prakritiRules.questions as any).psychological;

  useEffect(() => {
    if (!assessmentId) return;
    (async () => {
      try {
        const { data } = await proxyFetch('prakriti_answers', { assessment_id: assessmentId, category: 'psychological' }, { select: 'question_key, answer_value' });
        if (data) {
          const loaded: Record<string, string> = {};
          data.forEach((a: any) => loaded[a.question_key] = a.answer_value);
          setAnswers(prev => ({ ...prev, ...loaded }));
        }
      } catch (err) { console.error(err); }
    })();
  }, [assessmentId]);

  const handleSingleSelect = async (questionKey: string, answerValue: string) => {
    setAnswers(prev => ({ ...prev, [questionKey]: answerValue }));
    const question = questions[questionKey as keyof typeof questions];
    const option = (question as any).options[answerValue];
    try {
      await proxyDelete('prakriti_answers', { assessment_id: assessmentId, question_key: questionKey });
      await proxyUpsert('prakriti_answers', {
        assessment_id: assessmentId, category: 'psychological',
        question_key: questionKey, answer_value: answerValue,
        answer_label: option?.label || '',
        dosha_scores: option?.dosha || { vata: 0, pitta: 0, kapha: 0 },
      });
    } catch (err) { console.error(err); }
  };

  const allAnswered = Object.keys(questions).every(q => answers[q]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-amber-700">Your lifelong psychological and emotional tendencies</p>
      
      {/* Temperature preference - single select */}
      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="font-medium text-gray-900 mb-3">{(questions as any).temperature_preference?.label}</h3>
        <div className="space-y-2">
          {Object.entries((questions as any).temperature_preference?.options || {}).map(([optValue, opt]: [string, any]) => (
            <button key={optValue} type="button" onClick={() => handleSingleSelect('temperature_preference', optValue)}
              className={`w-full text-left rounded-lg border px-4 py-3 text-sm transition-colors ${
                answers['temperature_preference'] === optValue
                  ? 'bg-amber-100 border-amber-500 text-amber-900'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-amber-300'
              }`}>{opt.label}</button>
          ))}
        </div>
      </div>

      {/* Emotional tendencies - multi select */}
      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="font-medium text-gray-900 mb-3">{(questions as any).emotional_tendencies?.label}</h3>
        <p className="text-xs text-gray-500 mb-3">Select all that apply to you</p>
        <div className="space-y-2">
          {Object.entries((questions as any).emotional_tendencies?.options || {}).map(([optValue, opt]: [string, any]) => {
            const current = Array.isArray(answers['emotional_tendencies']) ? answers['emotional_tendencies'] : [];
            const isSelected = current.includes(optValue);
            return (
              <button key={optValue} type="button"
                onClick={async () => {
                  const updated = isSelected ? current.filter((v: string) => v !== optValue) : [...current, optValue];
                  setAnswers(prev => ({ ...prev, emotional_tendencies: updated }));
                  try {
                    await proxyDelete('prakriti_answers', { assessment_id: assessmentId, question_key: 'emotional_tendencies' });
                    await proxyUpsert('prakriti_answers', {
                      assessment_id: assessmentId, category: 'psychological',
                      question_key: 'emotional_tendencies', answer_value: updated.join(','),
                      answer_label: updated.join(', '),
                      dosha_scores: opt.dosha || { vata: 0, pitta: 0, kapha: 0 },
                    });
                  } catch (err) { console.error(err); }
                }}
                className={`w-full text-left rounded-lg border px-4 py-3 text-sm transition-colors ${
                  isSelected ? 'bg-amber-100 border-amber-500 text-amber-900' : 'bg-white border-gray-200 text-gray-700 hover:border-amber-300'
                }`}>{opt.label}</button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => router.push('/intake/prakriti/behavioral')} className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">Previous</button>
        <button onClick={() => router.push('/intake/prakriti/review')} disabled={!allAnswered}
          className="flex-1 rounded-lg bg-amber-700 px-4 py-2 text-white hover:bg-amber-800 disabled:opacity-50">Review Answers</button>
      </div>
    </div>
  );
}
