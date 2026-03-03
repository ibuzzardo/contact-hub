import Link from 'next/link';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps): JSX.Element {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
        <span className="material-symbols-outlined text-slate-400 text-2xl">{icon}</span>
      </div>
      <h3 className="text-lg font-medium text-text-main mb-2">{title}</h3>
      <p className="text-text-muted mb-6 max-w-sm mx-auto">{description}</p>
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition-colors shadow-sm shadow-primary/30"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition-colors shadow-sm shadow-primary/30"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}