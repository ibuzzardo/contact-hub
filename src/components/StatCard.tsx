interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: string;
  iconColor: string;
}

export default function StatCard({ icon, label, value, trend, iconColor }: StatCardProps): JSX.Element {
  return (
    <div className="bg-surface-light rounded-xl border border-border-light p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-muted text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-text-main mt-2">{value}</p>
          {trend && (
            <p className="text-sm text-text-muted mt-1">{trend}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-full ${iconColor} flex items-center justify-center`}>
          <span className="material-symbols-outlined text-white text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}