export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold text-amber-900">Ayurveda Assessment</h1>
          <p className="mt-2 text-sm text-amber-700">Wellness & Educational Tool</p>
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-lg">{children}</div>
      </div>
    </div>
  );
}
