'use client';

import { useEffect, useState } from 'react';
import { proxyFetch } from '@/lib/proxy-db';
import { useWizard } from '../../layout';
import { useRouter } from 'next/navigation';

const DAY_LABELS = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

export default function FoodDiaryReviewPage() {
  const { assessmentId } = useWizard();
  const router = useRouter();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!assessmentId) return;
    (async () => {
      try {
        const { data } = await proxyFetch('food_diary_entries', { assessment_id: assessmentId }, { order: { column: 'day_number' } });
        setEntries(data || []);
        setLoading(false);
      } catch (err) { console.error(err); }
    })();
  }, [assessmentId]);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  const completedDays = entries.length;
  const missingDays = 7 - completedDays;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Food Diary Review</h3>
      <div className="rounded-lg bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          {completedDays} of 7 days recorded{missingDays > 0 ? ` (${missingDays} days remaining)` : ' — Complete!'}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-3 py-2 text-left font-medium text-gray-500">Day</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Breakfast</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Lunch</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Dinner</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Snacks</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 7 }, (_, i) => i + 1).map(day => {
              const entry = entries.find(e => e.day_number === day);
              return (
                <tr key={day} className={`border-b border-gray-100 ${entry ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-3 py-2 font-medium">{DAY_LABELS[day - 1]}</td>
                  <td className="px-3 py-2">{entry?.breakfast?.time ? `${entry.breakfast.time}${entry.breakfast.food ? ' - ' + entry.breakfast.food : ''}` : '-'}</td>
                  <td className="px-3 py-2">{entry?.lunch?.time ? `${entry.lunch.time}${entry.lunch.food ? ' - ' + entry.lunch.food : ''}` : '-'}</td>
                  <td className="px-3 py-2">{entry?.dinner?.time ? `${entry.dinner.time}${entry.dinner.food ? ' - ' + entry.dinner.food : ''}` : '-'}</td>
                  <td className="px-3 py-2">{entry?.snacks?.food ? entry.snacks.food : '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button onClick={() => router.push('/intake/symptoms-lifestyle')}
        className="w-full rounded-lg bg-amber-700 px-4 py-2 text-white hover:bg-amber-800">
        Continue to Symptoms & Lifestyle
      </button>
    </div>
  );
}
