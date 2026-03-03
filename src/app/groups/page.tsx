'use client';

import { useState, useEffect } from 'react';
import { Group } from '@/types';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import GroupBadge from '@/components/GroupBadge';
import EmptyState from '@/components/EmptyState';

export default function GroupsPage(): JSX.Element {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#3b82f6');
  const [isCreating, setIsCreating] = useState(false);

  const colorOptions = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#ec4899', // pink
    '#6b7280'  // gray
  ];

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async (): Promise<void> => {
    try {
      const response = await fetch('/api/groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data || []);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      setIsCreating(true);
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName.trim(),
          color: newGroupColor
        })
      });

      if (response.ok) {
        const newGroup = await response.json();
        setGroups(prev => [...prev, newGroup]);
        setNewGroupName('');
        setNewGroupColor('#3b82f6');
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteGroup = async (groupId: number): Promise<void> => {
    if (!confirm('Are you sure you want to delete this group? Contacts in this group will not be deleted.')) {
      return;
    }

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setGroups(prev => prev.filter(group => group.id !== groupId));
      }
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Groups" subtitle="Loading groups..." />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-text-muted">Loading groups...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Header 
        title="Groups" 
        subtitle={`Organize your ${groups.length} contact groups`}
        action={
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm shadow-primary/30"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Group
          </button>
        }
      />
      
      <div className="p-6">
        {/* Search */}
        <div className="mb-8">
          <SearchBar 
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search groups by name..."
          />
        </div>

        {/* Create Group Form */}
        {showCreateForm && (
          <div className="bg-surface-light rounded-xl border border-border-light p-6 mb-8">
            <h3 className="text-lg font-semibold text-text-main mb-4">Create New Group</h3>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label htmlFor="groupName" className="block text-sm font-medium text-text-main mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  id="groupName"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-4 py-2 border border-border-light rounded-lg bg-surface-light text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="Enter group name..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-main mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewGroupColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        newGroupColor === color 
                          ? 'border-text-main scale-110' 
                          : 'border-border-light hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewGroupName('');
                    setNewGroupColor('#3b82f6');
                  }}
                  className="px-4 py-2 text-text-muted hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newGroupName.trim()}
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Groups List */}
        {filteredGroups.length === 0 ? (
          <EmptyState 
            icon="group_work"
            title={searchTerm ? "No groups found" : "No groups yet"}
            description={searchTerm ? 
              "Try adjusting your search criteria." :
              "Create your first group to organize your contacts."
            }
            action={!searchTerm ? {
              label: "Create Group",
              onClick: () => setShowCreateForm(true)
            } : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <div key={group.id} className="bg-surface-light rounded-xl border border-border-light p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <GroupBadge group={group} />
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Contacts</span>
                    <span className="font-medium text-text-main">
                      {group.contact_count || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Created</span>
                    <span className="text-text-main">
                      {new Date(group.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                {group.contact_count && group.contact_count > 0 && (
                  <div className="mt-4 pt-4 border-t border-border-light">
                    <a 
                      href={`/contacts?group=${group.id}`}
                      className="text-primary hover:text-primary-dark text-sm font-medium transition-colors"
                    >
                      View contacts →
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}