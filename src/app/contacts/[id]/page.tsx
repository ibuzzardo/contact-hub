import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Contact, Group } from '@/types';
import Header from '@/components/Header';
import Avatar from '@/components/Avatar';
import GroupBadge from '@/components/GroupBadge';
import DeleteContactButton from './DeleteContactButton';
import { getRelativeTime } from '@/lib/utils';

interface ContactDetailProps {
  params: Promise<{ id: string }>;
}

async function getContact(id: string): Promise<{ contact: Contact; group?: Group }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/contacts/${id}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Contact not found');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching contact:', error);
    throw error;
  }
}

export default async function ContactDetailPage({ params }: ContactDetailProps): Promise<JSX.Element> {
  const { id } = await params;
  
  try {
    const { contact, group } = await getContact(id);
    
    const copyToClipboard = (text: string): void => {
      navigator.clipboard.writeText(text);
    };

    return (
      <div className="flex-1">
        <Header title="Contact Details">
          <Link
            href="/contacts"
            className="flex items-center gap-2 px-4 py-2 text-text-muted hover:bg-slate-100 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Contacts
          </Link>
        </Header>

        <div className="p-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
            <Link href="/contacts" className="hover:text-primary transition-colors">
              Contacts
            </Link>
            <span className="material-symbols-outlined text-base">chevron_right</span>
            <span className="text-text-main">{contact.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <div className="bg-surface-light rounded-xl border border-border-light p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Avatar name={contact.name} size="lg" />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-2xl font-bold text-text-main mb-1">{contact.name}</h1>
                        {contact.job_title && contact.company && (
                          <p className="text-text-muted mb-2">
                            {contact.job_title} at {contact.company}
                          </p>
                        )}
                        {group && (
                          <div className="mb-3">
                            <GroupBadge name={group.name} />
                          </div>
                        )}
                      </div>
                      
                      <button className="text-slate-300 hover:text-yellow-400 transition-colors">
                        <span className={`material-symbols-outlined text-2xl ${
                          contact.favorite === 1 ? 'fill-current text-yellow-400' : ''
                        }`}>
                          star
                        </span>
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/contacts/${contact.id}/edit`}
                        className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/30"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                        Edit
                      </Link>
                      <DeleteContactButton contactId={contact.id} contactName={contact.name} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-surface-light rounded-xl border border-border-light p-6">
                <h2 className="text-lg font-semibold text-text-main mb-4">Contact Information</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-text-muted">mail</span>
                    <span className="text-text-main">{contact.email}</span>
                    <button
                      onClick={() => copyToClipboard(contact.email)}
                      className="p-1 text-text-muted hover:bg-slate-100 rounded transition-colors"
                      title="Copy email"
                    >
                      <span className="material-symbols-outlined text-base">content_copy</span>
                    </button>
                  </div>
                  
                  {contact.phone && (
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-text-muted">call</span>
                      <span className="text-text-main">{contact.phone}</span>
                      <button
                        onClick={() => copyToClipboard(contact.phone!)}
                        className="p-1 text-text-muted hover:bg-slate-100 rounded transition-colors"
                        title="Copy phone"
                      >
                        <span className="material-symbols-outlined text-base">content_copy</span>
                      </button>
                    </div>
                  )}
                  
                  {contact.company && (
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-text-muted">domain</span>
                      <span className="text-text-main">{contact.company}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {contact.notes && (
                <div className="bg-surface-light rounded-xl border border-border-light p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-text-main">Notes</h2>
                    <Link
                      href={`/contacts/${contact.id}/edit`}
                      className="text-primary hover:text-primary-dark text-sm font-medium"
                    >
                      Edit
                    </Link>
                  </div>
                  <p className="text-text-muted whitespace-pre-wrap">{contact.notes}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Activity */}
              <div className="bg-surface-light rounded-xl border border-border-light p-6">
                <h2 className="text-lg font-semibold text-text-main mb-4">Activity</h2>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-green-600 text-sm">person_add</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-main">Contact Created</p>
                      <p className="text-xs text-text-muted">{getRelativeTime(contact.created_at)}</p>
                    </div>
                  </div>
                  
                  {contact.updated_at !== contact.created_at && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-blue-600 text-sm">edit</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-main">Contact Updated</p>
                        <p className="text-xs text-text-muted">{getRelativeTime(contact.updated_at)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}