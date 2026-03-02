import Link from 'next/link';
import { DashboardStats } from '@/types';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import Avatar from '@/components/Avatar';
import GroupBadge from '@/components/GroupBadge';
import { getGreeting, getRelativeTime } from '@/lib/utils';

async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stats`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalContacts: 0,
      totalGroups: 0,
      recentContacts: [],
      favoritesCount: 0,
      newThisWeek: 0,
    };
  }
}

export default async function Dashboard(): Promise<JSX.Element> {
  const stats = await getDashboardStats();
  const greeting = getGreeting();

  return (
    <div className="flex-1">
      <Header 
        title={`${greeting}, Ian`}
        subtitle="Here's what's happening with your network today."
      >
        <Link
          href="/settings"
          className="flex items-center gap-2 px-4 py-2 text-text-muted hover:bg-slate-100 rounded-lg transition-colors border border-border-light"
        >
          <span className="material-symbols-outlined text-base">upload_file</span>
          Import
        </Link>
        <Link
          href="/contacts/new"
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/30"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Add Contact
        </Link>
      </Header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon="group"
            label="Total Contacts"
            value={stats.totalContacts}
            trend="+5.2% from last month"
            iconColor="bg-blue-500"
          />
          <StatCard
            icon="domain"
            label="Total Groups"
            value={stats.totalGroups}
            iconColor="bg-yellow-500"
          />
          <StatCard
            icon="trending_up"
            label="New This Week"
            value={stats.newThisWeek}
            iconColor="bg-green-500"
          />
          <StatCard
            icon="star"
            label="Favorites"
            value={stats.favoritesCount}
            iconColor="bg-amber-500"
          />
        </div>

        {/* Recent Contacts */}
        <div className="bg-surface-light rounded-xl border border-border-light">
          <div className="flex justify-between items-center p-6 border-b border-border-light">
            <h2 className="text-xl font-bold text-text-main">Recent Contacts</h2>
            <Link href="/contacts" className="text-primary hover:text-primary-dark font-medium text-sm">
              View All
            </Link>
          </div>
          
          {stats.recentContacts.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-slate-400 text-2xl">group</span>
              </div>
              <p className="text-text-muted mb-4">No contacts yet</p>
              <Link href="/contacts/new" className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/30 mx-auto w-fit">
                <span className="material-symbols-outlined text-base">add</span>
                Create Your First Contact
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="text-left py-3 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider">Name</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider">Email</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider">Company</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider">Group</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider">Added</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentContacts.slice(0, 4).map((contact) => (
                    <tr key={contact.id} className="border-b border-border-light hover:bg-slate-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar name={contact.name} size="sm" />
                          <span className="font-medium text-text-main">{contact.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-text-muted">{contact.email}</td>
                      <td className="py-4 px-6 text-text-muted">{contact.company || '-'}</td>
                      <td className="py-4 px-6">
                        {contact.group_id ? <GroupBadge name="General" /> : '-'}
                      </td>
                      <td className="py-4 px-6 text-text-muted text-sm">{getRelativeTime(contact.created_at)}</td>
                      <td className="py-4 px-6">
                        <Link href={`/contacts/${contact.id}`} className="p-2 text-text-muted hover:bg-slate-100 rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-base">more_vert</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}