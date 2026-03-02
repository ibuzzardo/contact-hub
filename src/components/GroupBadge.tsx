interface GroupBadgeProps {
  name: string;
}

export default function GroupBadge({ name }: GroupBadgeProps): JSX.Element {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-white">
      {name}
    </span>
  );
}