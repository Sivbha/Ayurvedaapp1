'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { STEP_LABELS } from '@/lib/utils/constants';

const STEP_PATHS = [
  '/intake/basic-details',
  '/intake/safety',
  '/intake/prakriti/physical',
  '/intake/vikriti/digestive',
  '/intake/food-diary/day-1',
  '/intake/symptoms-lifestyle',
  '/intake/review-submit',
];

export default function IntakeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'pending'>('saved');

  useEffect(() => {
    const currentIdx = STEP_PATHS.findIndex(p => pathname.startsWith(p));
    if (currentIdx >= 0) setCurrentStep(currentIdx + 1);
  }, [pathname]);

  useEffect(() => {
    initAssessment();
  }, []);

  const initAssessment = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { data: existing } = await supabase
      .from('assessments')
      .select('id, current_step')
      .eq('client_id', user.id)
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      setAssessmentId(existing.id);
      setCurrentStep(existing.current_step || 1);
      // Redirect to current step if on wrong step
      if (!STEP_PATHS.some(p => pathname.startsWith(p))) {
        router.push(STEP_PATHS[(existing.current_step || 1) - 1] || STEP_PATHS[0]);
      }
    } else {
      const { data: created } = await supabase
        .from('assessments')
        .insert({ client_id: user.id })
        .select('id')
        .single();
      if (created) setAssessmentId(created.id);
    }
  };

  const handleNext = () => {
    if (currentStep < 7) {
      router.push(STEP_PATHS[currentStep]);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      router.push(STEP_PATHS[currentStep - 2]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEP_LABELS.slice(0, 7).map((step, i) => (
              <div key={step.step} className="flex flex-col items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  i + 1 <= currentStep ? 'bg-amber-700 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {i + 1}
                </div>
                <span className={`mt-1 text-xs ${i + 1 <= currentStep ? 'text-amber-800 font-medium' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 h-2 rounded-full bg-gray-200">
            <div className="h-full rounded-full bg-amber-600 transition-all duration-500" style={{ width: `${(currentStep / 7) * 100}%` }} />
          </div>
        </div>

        {/* Save indicator */}
        <div className="mb-4 flex items-center justify-end gap-2 text-xs text-gray-500">
          <span className={`h-2 w-2 rounded-full ${
            saveStatus === 'saved' ? 'bg-green-500' : saveStatus === 'saving' ? 'bg-yellow-500' : 'bg-gray-400'
          }`} />
          {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved'}
        </div>

        {/* Main content */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          {assessmentId ? (
            <WizardContext.Provider value={{ assessmentId, saveStatus, setSaveStatus, handleNext, handlePrev, currentStep }}>
              {children}
            </WizardContext.Provider>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <button onClick={handlePrev} disabled={currentStep === 1}
            className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Previous
          </button>
          <span className="text-sm text-gray-400 self-center">Step {currentStep} of 7</span>
          <button onClick={handleNext} disabled={currentStep === 7}
            className="rounded-lg bg-amber-700 px-6 py-2 text-white hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

import { createContext, useContext } from 'react';

interface WizardCtx {
  assessmentId: string;
  saveStatus: 'saved' | 'saving' | 'pending';
  setSaveStatus: (s: 'saved' | 'saving' | 'pending') => void;
  handleNext: () => void;
  handlePrev: () => void;
  currentStep: number;
}

const WizardContext = createContext<WizardCtx>({
  assessmentId: '', saveStatus: 'saved', setSaveStatus: () => {},
  handleNext: () => {}, handlePrev: () => {}, currentStep: 1,
});

export const useWizard = () => useContext(WizardContext);
