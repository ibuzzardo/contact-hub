import { Group } from '@/types';

interface GroupBadgeProps {
  group: Group;
  size?: 'sm' | 'md';
}

export default function GroupBadge({ group, size = 'md' }: GroupBadgeProps): JSX.Element {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm'
  };
  
  return (
    <span 
      className={`${sizeClasses[size]} font-medium rounded-full text-white`}
      style={{ backgroundColor: group.color }}
    >
      {group.name}
    </span>
  );
}