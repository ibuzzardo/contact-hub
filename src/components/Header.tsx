interface HeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function Header({ title, subtitle, children }: HeaderProps): JSX.Element {
  return (
    <div className="bg-surface-light border-b border-border-light px-6 py-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-text-main">{title}</h1>
          {subtitle && (
            <p className="text-text-muted mt-1">{subtitle}</p>
          )}
        </div>
        {children && (
          <div className="flex items-center gap-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}