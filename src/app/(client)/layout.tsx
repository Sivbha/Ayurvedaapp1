export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="mx-auto max-w-3xl px-4 py-8">{children}</div>
    </div>
  );
}
