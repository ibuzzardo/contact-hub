import { getGroupBadgeColor } from '@/lib/utils';

interface GroupBadgeProps {
  name: string;
}

export default function GroupBadge({ name }: GroupBadgeProps): JSX.Element {
  const { bg, text, border } = getGroupBadgeColor(name);
  
  return (
    <span className={`px-2.5 py-1 rounded-md ${bg} ${text} text-xs font-medium border ${border}`}>
      {name}
    </span>
  );
}