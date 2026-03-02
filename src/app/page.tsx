import Link from 'next/link';
import { DashboardStats } from '@/types';
import ContactCard from '@/components/ContactCard';

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
    };
  }
}

export default async function Dashboard(): Promise<JSX.Element> {
  const stats = await getDashboardStats();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to ContactHub</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Contacts</h3>
          <p className="text-3xl font-bold text-primary">{stats.totalContacts}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Groups</h3>
          <p className="text-3xl font-bold text-accent">{stats.totalGroups}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Add</h3>
          <Link href="/contacts/new" className="btn-primary inline-block">
            Add Contact
          </Link>
        </div>
      </div>

      {/* Recent Contacts */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Recent Contacts</h2>
          <Link href="/contacts" className="text-primary hover:text-primary/80 font-medium">
            View All
          </Link>
        </div>
        
        {stats.recentContacts.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500 mb-4">No contacts yet</p>
            <Link href="/contacts/new" className="btn-primary">
              Create Your First Contact
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.recentContacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}