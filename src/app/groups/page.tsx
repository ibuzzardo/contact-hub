'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Group } from '@/types';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function GroupsPage(): JSX.Element {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async (): Promise<void> => {
    try {
      const response = await fetch('/api/groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      setIsCreating(true);
      setError('');
      
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newGroupName.trim() }),
      });

      if (response.ok) {
        const newGroup = await response.json();
        setGroups(prev => [...prev, newGroup]);
        setNewGroupName('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create group');
      }
    } catch (error) {
      console.error('Failed to create group:', error);
      setError('Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  const getGroupIcon = (groupName: string): string => {
    const name = groupName.toLowerCase();
    switch (name) {
      case 'customer': return 'person';
      case 'partner': return 'handshake';
      case 'lead': return 'trending_up';
      case 'vendor': return 'store';
      default: return 'group';
    }
  };

  const getGroupColor = (groupName: string): string => {
    const name = groupName.toLowerCase();
    switch (name) {
      case 'customer': return 'text-green-600';
      case 'partner': return 'text-purple-600';
      case 'lead': return 'text-orange-600';
      case 'vendor': return 'text-slate-600';
      default: return 'text-blue-600';
    }
  };

  if (loading) {
    return (
      <div className="flex-1">
        <Header title="Groups" subtitle="Create and manage contact segments" />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Header 
        title="Groups" 
        subtitle="Create and manage segments to organize your contacts"
      />

      <div className="p-6">
        {/* Create New Group */}
        <div className="bg-surface-light rounded-xl border border-border-light p-6 mb-8">
          <h2 className="text-lg font-semibold text-text-main mb-4">Create New Group</h2>
          <form onSubmit={handleCreateGroup} className="flex gap-3">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Enter group name..."
              className="flex-1 px-4 py-2.5 bg-surface-light border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-text-main placeholder:text-slate-400 transition-all shadow-sm"
              disabled={isCreating}
            />
            <button
              type="submit"
              disabled={isCreating || !newGroupName.trim()}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/30 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </form>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {groups.map((group) => (
            <Link key={group.id} href={`/contacts?group=${group.id}`}>
              <div className="group bg-surface-light rounded-xl border border-border-light p-6 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center ${getGroupColor(group.name)}`}>
                    <span className="material-symbols-outlined text-xl">{getGroupIcon(group.name)}</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">
                    arrow_forward
                  </span>
                </div>
                
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                    {group.name.toUpperCase()}
                  </p>
                  <h3 className="font-bold text-text-main mb-2">{group.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-text-muted">
                    <span className="material-symbols-outlined text-base">group</span>
                    <span>0 contacts</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          
          {/* Create Group Card */}
          <div className="group bg-surface-light rounded-xl border-2 border-dashed border-border-light p-6 hover:border-primary hover:bg-primary/5 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center min-h-[200px]">
            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined text-xl text-slate-400 group-hover:text-primary transition-colors">
                add
              </span>
            </div>
            <h3 className="font-medium text-text-main mb-1">Create Group</h3>
            <p className="text-sm text-text-muted">Add a new contact segment</p>
          </div>
        </div>
      </div>
    </div>
  );
}