import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Contact, Group } from '@/types';
import GroupBadge from '@/components/GroupBadge';
import DeleteContactButton from './DeleteContactButton';

interface ContactPageProps {
  params: Promise<{ id: string }>;
}

async function getContact(id: string): Promise<Contact | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/contacts/${id}`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching contact:', error);
    return null;
  }
}

async function getGroups(): Promise<Group[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/groups`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      return [];
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching groups:', error);
    return [];
  }
}

export default async function ContactPage({ params }: ContactPageProps): Promise<JSX.Element> {
  const { id } = await params;
  const [contact, groups] = await Promise.all([
    getContact(id),
    getGroups(),
  ]);

  if (!contact) {
    notFound();
  }

  const group = contact.group_id ? groups.find(g => g.id === contact.group_id) : null;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/contacts" className="text-primary hover:text-primary/80 font-medium mb-4 inline-block">
            ← Back to Contacts
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{contact.name}</h1>
              {group && <GroupBadge name={group.name} />}
            </div>
            <div className="flex gap-2">
              <Link href={`/contacts/${contact.id}/edit`} className="btn-primary">
                Edit
              </Link>
              <DeleteContactButton contactId={contact.id} contactName={contact.name} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{contact.email}</p>
              </div>
              {contact.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-gray-900">{contact.phone}</p>
                </div>
              )}
              {contact.company && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <p className="text-gray-900">{contact.company}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
                <p className="text-gray-900">{group?.name || 'No Group'}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
            <div className="space-y-4">
              {contact.notes ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{contact.notes}</p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No notes available</p>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <p className="text-gray-900">{new Date(contact.created_at).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                <p className="text-gray-900">{new Date(contact.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}