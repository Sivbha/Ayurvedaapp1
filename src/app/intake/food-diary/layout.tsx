'use client';

import { usePathname } from 'next/navigation';

const DAY_LABELS = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

export default function FoodDiaryLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const match = pathname.match(/\/food-diary\/(\d+)/);
  const currentDay = match ? parseInt(match[1]) : null;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">7-Day Food Diary</h2>
        <p className="mt-1 text-sm text-gray-500">Track your meals and eating patterns for one week</p>
      </div>
      {currentDay && (
        <div className="mb-6 flex items-center gap-1 overflow-x-auto">
          {DAY_LABELS.map((label, i) => (
            <a key={i} href={`/intake/food-diary/${i + 1}`}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                currentDay === i + 1 ? 'bg-amber-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>{label}</a>
          ))}
        </div>
      )}
      {children}
    </div>
  );
}
