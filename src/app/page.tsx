import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 px-4">
      <div className="text-center max-w-2xl">
        <h1 className="font-heading text-4xl font-bold text-amber-900 sm:text-5xl">
          Ayurveda Wellness Assessment
        </h1>
        <p className="mt-4 text-lg text-amber-700">
          Discover your unique constitution, understand current imbalances, and receive
          personalized wellness guidance based on ancient Ayurvedic wisdom.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="rounded-lg bg-amber-700 px-8 py-3 text-white font-medium hover:bg-amber-800 transition-colors"
          >
            Start Your Assessment
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-amber-300 bg-white px-8 py-3 text-amber-800 font-medium hover:bg-amber-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
        <p className="mt-6 text-xs text-amber-600 max-w-md mx-auto">
          This is an educational wellness tool, not a medical diagnosis. Always consult
          a qualified healthcare provider for medical concerns.
        </p>
      </div>
    </div>
  );
}
