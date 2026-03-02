interface EmptyStateProps {
  icon: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, message, actionText, onAction }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-slate-400 text-2xl">{icon}</span>
      </div>
      <p className="text-text-muted mb-4">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/30"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}