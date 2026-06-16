'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold text-red-700">Something went wrong</h1>
      <button onClick={reset} className="mt-4 rounded-lg bg-amber-700 px-4 py-2 text-white hover:bg-amber-800">
        Try again
      </button>
    </div>
  );
}
