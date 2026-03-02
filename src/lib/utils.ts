export function getAvatarColor(name: string): { bg: string; text: string } {
  const firstLetter = name.charAt(0).toUpperCase();
  
  if (firstLetter >= 'A' && firstLetter <= 'D') {
    return { bg: 'bg-blue-100', text: 'text-blue-600' };
  } else if (firstLetter >= 'E' && firstLetter <= 'H') {
    return { bg: 'bg-purple-100', text: 'text-purple-600' };
  } else if (firstLetter >= 'I' && firstLetter <= 'L') {
    return { bg: 'bg-teal-100', text: 'text-teal-600' };
  } else if (firstLetter >= 'M' && firstLetter <= 'P') {
    return { bg: 'bg-rose-100', text: 'text-rose-600' };
  } else if (firstLetter >= 'Q' && firstLetter <= 'T') {
    return { bg: 'bg-indigo-100', text: 'text-indigo-600' };
  } else {
    return { bg: 'bg-orange-100', text: 'text-orange-600' };
  }
}

export function getInitials(name: string): string {
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min${diffInMinutes === 1 ? '' : 's'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'Yesterday';
  }
  
  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }
  
  return date.toLocaleDateString();
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return 'Good morning';
  } else if (hour < 18) {
    return 'Good afternoon';
  } else {
    return 'Good evening';
  }
}

export function getGroupBadgeColor(groupName: string): { bg: string; text: string; border: string } {
  const name = groupName.toLowerCase();
  
  switch (name) {
    case 'customer':
      return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
    case 'partner':
      return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' };
    case 'lead':
      return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' };
    case 'vendor':
      return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
    default:
      return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
  }
}