'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Contact, Activity, Deal, Task, Group } from '@/types';
import Header from '@/components/Header';
import Avatar from '@/components/Avatar';
import GroupBadge from '@/components/GroupBadge';
import ActivityModal from '@/components/ActivityModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { getRelativeTime } from '@/lib/utils';

export default function ContactDetailPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const contactId = parseInt(params.id as string);
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    if (contactId) {
      fetchContact();
      fetchActivities();
      fetchDeals();
      fetchTasks();
    }
  }, [contactId]);

  const fetchContact = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`);
      if (response.ok) {
        const data = await response.json();
        setContact(data);
        setIsFavorite(data.favorite === 1);
        
        if (data.group_id) {
          fetchGroup(data.group_id);
        }
      } else if (response.status === 404) {
        router.push('/contacts');
      }
    } catch (error) {
      console.error('Error fetching contact:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroup = async (groupId: number): Promise<void> => {
    try {
      const response = await fetch(`/api/groups/${groupId}`);
      if (response.ok) {
        const data = await response.json();
        setGroup(data);
      }
    } catch (error) {
      console.error('Error fetching group:', error);
    }
  };

  const fetchActivities = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/activities?contact_id=${contactId}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchDeals = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/deals?contact_id=${contactId}`);
      if (response.ok) {
        const data = await response.json();
        setDeals(data || []);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    }
  };

  const fetchTasks = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/tasks?contact_id=${contactId}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleDelete = async (): Promise<void> => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        router.push('/contacts');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleFavoriteToggle = async (): Promise<void> => {
    if (isToggling) return;
    
    setIsToggling(true);
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    
    try {
      const response = await fetch(`/api/contacts/${contactId}/favorite`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        setIsFavorite(!newFavoriteState);
      }
    } catch (error) {
      setIsFavorite(!newFavoriteState);
    } finally {
      setIsToggling(false);
    }
  };

  const getActivityIcon = (type: string): string => {
    switch (type) {
      case 'call': return 'call';
      case 'email': return 'mail';
      case 'meeting': return 'event';
      case 'note': return 'note';
      case 'stage_change': return 'trending_up';
      default: return 'timeline';
    }
  };

  const getActivityIconColor = (type: string): string => {
    switch (type) {
      case 'call': return 'bg-green-500';
      case 'email': return 'bg-blue-500';
      case 'meeting': return 'bg-purple-500';
      case 'note': return 'bg-orange-500';
      case 'stage_change': return 'bg-indigo-500';
      default: return 'bg-slate-500';
    }
  };

  const getStageColor = (stage: string): string => {
    switch (stage) {
      case 'lead': return 'bg-stage-lead';
      case 'qualified': return 'bg-stage-qualified';
      case 'proposal': return 'bg-stage-proposal';
      case 'negotiation': return 'bg-stage-negotiation';
      case 'won': return 'bg-stage-won';
      case 'lost': return 'bg-stage-lost';
      default: return 'bg-slate-500';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-slate-500';
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isOverdue = (dueDate: string): boolean => {
    return new Date(dueDate) < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Loading..." subtitle="" />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-text-muted">Loading contact...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex-1">
        <Header title="Contact Not Found" subtitle="" />
        <div className="p-6">
          <div className="text-center">
            <p className="text-text-muted mb-4">The contact you're looking for doesn't exist.</p>
            <Link 
              href="/contacts"
              className="text-primary hover:text-primary-dark font-medium"
            >
              Back to Contacts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Header 
        title={contact.name}
        subtitle={contact.job_title || 'Contact Details'}
        action={
          <div className="flex items-center gap-3">
            <button
              onClick={handleFavoriteToggle}
              disabled={isToggling}
              className="text-slate-400 hover:text-yellow-400 transition-colors"
            >
              <span className={`material-symbols-outlined ${isFavorite ? 'fill-current text-yellow-400' : ''}`}>
                star
              </span>
            </button>
            
            <button
              onClick={() => setShowActivityModal(true)}
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm shadow-primary/30"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Log Activity
            </button>
            
            <Link
              href={`/contacts/${contact.id}/edit`}
              className="bg-slate-100 hover:bg-slate-200 text-text-main px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Edit
            </Link>
            
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
              Delete
            </button>
          </div>
        }
      />
      
      <div className="p-6 space-y-8">
        {/* Contact Info */}
        <div className="bg-surface-light rounded-xl border border-border-light p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <Avatar name={contact.name} size="lg" />
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-muted">Email</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="material-symbols-outlined text-text-muted text-sm">mail</span>
                    <a 
                      href={`mailto:${contact.email}`}
                      className="text-primary hover:text-primary-dark transition-colors"
                    >
                      {contact.email}
                    </a>
                  </div>
                </div>
                
                {contact.phone && (
                  <div>
                    <label className="text-sm font-medium text-text-muted">Phone</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="material-symbols-outlined text-text-muted text-sm">call</span>
                      <a 
                        href={`tel:${contact.phone}`}
                        className="text-primary hover:text-primary-dark transition-colors"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {contact.company && (
                  <div>
                    <label className="text-sm font-medium text-text-muted">Company</label>
                    <p className="text-text-main mt-1">{contact.company}</p>
                  </div>
                )}
                
                {group && (
                  <div>
                    <label className="text-sm font-medium text-text-muted">Group</label>
                    <div className="mt-1">
                      <GroupBadge group={group} />
                    </div>
                  </div>
                )}
              </div>
              
              {contact.notes && (
                <div>
                  <label className="text-sm font-medium text-text-muted">Notes</label>
                  <p className="text-text-main mt-1 whitespace-pre-wrap">{contact.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <div className="bg-surface-light rounded-xl border border-border-light p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-main">Recent Activities</h3>
              <button
                onClick={() => setShowActivityModal(true)}
                className="text-primary hover:text-primary-dark text-sm font-medium transition-colors"
              >
                Add Activity
              </button>
            </div>
            
            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-text-muted text-center py-8">No activities yet</p>
              ) : (
                activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full ${getActivityIconColor(activity.type)} flex items-center justify-center flex-shrink-0`}>
                      <span className="material-symbols-outlined text-white text-sm">
                        {getActivityIcon(activity.type)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-main">
                        {activity.subject}
                      </p>
                      {activity.description && (
                        <p className="text-xs text-text-muted mt-1">
                          {activity.description}
                        </p>
                      )}
                      <p className="text-xs text-text-muted mt-1">
                        {getRelativeTime(activity.activity_date)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Associated Deals */}
          <div className="bg-surface-light rounded-xl border border-border-light p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-main">Associated Deals</h3>
              <Link 
                href="/deals"
                className="text-primary hover:text-primary-dark text-sm font-medium transition-colors"
              >
                View All
              </Link>
            </div>
            
            <div className="space-y-4">
              {deals.length === 0 ? (
                <p className="text-text-muted text-center py-8">No deals yet</p>
              ) : (
                deals.slice(0, 3).map((deal) => (
                  <Link key={deal.id} href={`/deals/${deal.id}`}>
                    <div className="p-4 border border-border-light rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-text-main">{deal.name}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${getStageColor(deal.stage)}`}>
                          {deal.stage.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-text-muted">
                        <span>{formatCurrency(deal.value)}</span>
                        <span>{deal.probability}% probability</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-surface-light rounded-xl border border-border-light p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-main">Related Tasks</h3>
            <Link 
              href="/tasks"
              className="text-primary hover:text-primary-dark text-sm font-medium transition-colors"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <p className="text-text-muted text-center py-8">No tasks yet</p>
            ) : (
              tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center gap-4 p-4 border border-border-light rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-main">
                      {task.title}
                    </p>
                    <p className="text-xs text-text-muted">
                      Due {getRelativeTime(task.due_date)}
                      {isOverdue(task.due_date) && (
                        <span className="text-red-500 font-medium ml-1">(Overdue)</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ActivityModal 
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        onSaved={() => {
          setShowActivityModal(false);
          fetchActivities();
        }}
        defaultContactId={contactId}
      />

      <ConfirmDialog 
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Contact"
        message={`Are you sure you want to delete ${contact.name}? This action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        isDestructive
      />
    </div>
  );
}