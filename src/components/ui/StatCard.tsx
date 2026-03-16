interface StatCardProps {
  value: string;
  label: string;
  className?: string;
}

export function StatCard({ value, label, className = "" }: StatCardProps) {
  return (
    <div className={`text-center ${className}`}>
      <div className="text-[28px] font-display font-bold leading-tight">{value}</div>
      <div className="text-xs text-white/60 mt-1 font-body">{label}</div>
    </div>
  );
}
