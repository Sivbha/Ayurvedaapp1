'use client';

import { usePathname } from 'next/navigation';

const PRAKRITI_STEPS = [
  { href: '/intake/prakriti/physical', label: 'Physical' },
  { href: '/intake/prakriti/metabolic', label: 'Metabolic' },
  { href: '/intake/prakriti/behavioral', label: 'Behavioral' },
  { href: '/intake/prakriti/psychological', label: 'Psychological' },
  { href: '/intake/prakriti/review', label: 'Review' },
];

export default function PrakritiLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentIdx = PRAKRITI_STEPS.findIndex(s => pathname === s.href);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Prakriti Assessment</h2>
        <p className="mt-1 text-sm text-gray-500">Your lifelong physical, metabolic, behavioral, and psychological tendencies</p>
      </div>
      <div className="mb-6 flex items-center gap-2">
        {PRAKRITI_STEPS.map((step, i) => (
          <div key={step.href} className="flex items-center gap-2">
            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
              i <= currentIdx ? 'bg-amber-700 text-white' : 'bg-gray-200 text-gray-500'
            }`}>{i + 1}</div>
            <span className={`text-xs ${i <= currentIdx ? 'text-amber-800' : 'text-gray-400'}`}>{step.label}</span>
            {i < PRAKRITI_STEPS.length - 1 && <div className="h-px w-6 bg-gray-300" />}
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}
