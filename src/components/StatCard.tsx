interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatCard({ title, value, icon, iconColor, trend }: StatCardProps): JSX.Element {
  return (
    <div className="bg-surface-light rounded-xl border border-border-light p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-muted text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-text-main mt-2">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <span className="material-symbols-outlined text-sm mr-1">
                {trend.isPositive ? 'trending_up' : 'trending_down'}
              </span>
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${iconColor} rounded-lg flex items-center justify-center`}>
          <span className="material-symbols-outlined text-white text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}