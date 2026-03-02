'use client';

import { useState, useEffect } from 'react';
import { Group } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function GroupsPage(): JSX.Element {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

    setIsCreating(true);
    setError('');
    
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newGroupName.trim() }),
      });

      if (response.ok) {
        setNewGroupName('');
        fetchGroups();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create group');
      }
    } catch (error) {
      setError('Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteGroup = async (groupId: number): Promise<void> => {
    setDeletingId(groupId);
    setError('');
    
    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchGroups();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete group');
      }
    } catch (error) {
      setError('Failed to delete group');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Groups</h1>
        <p className="text-gray-600">Organize your contacts into groups</p>
      </div>

      {/* Create Group Form */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Group</h2>
        <form onSubmit={handleCreateGroup} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Group name"
              className="input"
              maxLength={50}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isCreating || !newGroupName.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating...' : 'Create Group'}
          </button>
        </form>
        {error && (
          <p className="mt-2 text-sm text-destructive">{error}</p>
        )}
      </div>

      {/* Groups List */}
      {loading ? (
        <LoadingSpinner />
      ) : groups.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500">No groups created yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div key={group.id} className="card">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {group.name}
                </h3>
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  disabled={deletingId === group.id}
                  className="text-destructive hover:text-destructive/80 text-sm font-medium disabled:opacity-50"
                >
                  {deletingId === group.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>{group.contact_count || 0} contact{(group.contact_count || 0) !== 1 ? 's' : ''}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Created {new Date(group.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}