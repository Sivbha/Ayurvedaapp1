'use client';

import Link from 'next/link';

export default function SubmittedPage() {
  return (
    <div className="text-center py-12">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="mt-6 text-2xl font-semibold text-gray-900">Assessment Submitted</h2>
      <p className="mt-2 text-gray-600">
        Your assessment has been submitted for practitioner review.
        You will be able to view your personalized report once it has been reviewed.
      </p>
      <div className="mt-8 space-y-3">
        <Link href="/client/report/pending"
          className="block rounded-lg bg-amber-700 px-6 py-3 text-white hover:bg-amber-800">
          View My Reports
        </Link>
        <Link href="/"
          className="block rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50">
          Go Home
        </Link>
      </div>
    </div>
  );
}
