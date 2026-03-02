import { getAvatarColor, getInitials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Avatar({ name, size = 'md' }: AvatarProps): JSX.Element {
  const { bg, text } = getAvatarColor(name);
  const initials = getInitials(name);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-16 h-16 text-xl',
    lg: 'w-20 h-20 text-2xl'
  };
  
  return (
    <div className={`${sizeClasses[size]} rounded-full ${bg} ${text} flex items-center justify-center font-bold border-2 border-white shadow-sm`}>
      {initials}
    </div>
  );
}