import Link from 'next/link';
import { Contact } from '@/types';
import GroupBadge from './GroupBadge';

interface ContactCardProps {
  contact: Contact;
  groupName?: string;
}

export default function ContactCard({ contact, groupName }: ContactCardProps): JSX.Element {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {contact.name}
        </h3>
        {groupName && <GroupBadge name={groupName} />}
      </div>
      
      <div className="space-y-1 text-sm text-gray-600">
        <p className="truncate">{contact.email}</p>
        {contact.phone && <p className="truncate">{contact.phone}</p>}
        {contact.company && <p className="truncate">{contact.company}</p>}
      </div>
      
      {contact.notes && (
        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
          {contact.notes.length > 100 ? `${contact.notes.substring(0, 100)}...` : contact.notes}
        </p>
      )}
      
      <div className="mt-4 flex justify-between items-center">
        <span className="text-xs text-gray-400">
          {new Date(contact.created_at).toLocaleDateString()}
        </span>
        <Link
          href={`/contacts/${contact.id}`}
          className="text-primary hover:text-primary/80 text-sm font-medium"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}