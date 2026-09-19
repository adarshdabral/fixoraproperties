export function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl2 border border-line bg-white p-5">
      <p className="font-display text-3xl text-ink">{value}</p>
      <p className="mt-1 text-sm text-ink-300">{label}</p>
    </div>
  );
}
