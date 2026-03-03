'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Deal, Activity, Contact, Company } from '@/types';
import Header from '@/components/Header';
import ActivityModal from '@/components/ActivityModal';
import DealSlideOver from '@/components/DealSlideOver';
import ConfirmDialog from '@/components/ConfirmDialog';
import { getRelativeTime } from '@/lib/utils';

export default function DealDetailPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const dealId = parseInt(params.id as string);
  
  const [deal, setDeal] = useState<Deal | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [contact, setContact] = useState<Contact | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showEditSlideOver, setShowEditSlideOver] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (dealId) {
      fetchDeal();
      fetchActivities();
    }
  }, [dealId]);

  const fetchDeal = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/deals/${dealId}`);
      if (response.ok) {
        const data = await response.json();
        setDeal(data);
        
        if (data.contact_id) {
          fetchContact(data.contact_id);
        }
        if (data.company_id) {
          fetchCompany(data.company_id);
        }
      } else if (response.status === 404) {
        router.push('/deals');
      }
    } catch (error) {
      console.error('Error fetching deal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContact = async (contactId: number): Promise<void> => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`);
      if (response.ok) {
        const data = await response.json();
        setContact(data);
      }
    } catch (error) {
      console.error('Error fetching contact:', error);
    }
  };

  const fetchCompany = async (companyId: number): Promise<void> => {
    try {
      const response = await fetch(`/api/companies/${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setCompany(data);
      }
    } catch (error) {
      console.error('Error fetching company:', error);
    }
  };

  const fetchActivities = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/activities?deal_id=${dealId}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleDelete = async (): Promise<void> => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        router.push('/deals');
      }
    } catch (error) {
      console.error('Error deleting deal:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
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

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Loading..." subtitle="" />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-text-muted">Loading deal...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="flex-1">
        <Header title="Deal Not Found" subtitle="" />
        <div className="p-6">
          <div className="text-center">
            <p className="text-text-muted mb-4">The deal you're looking for doesn't exist.</p>
            <Link 
              href="/deals"
              className="text-primary hover:text-primary-dark font-medium"
            >
              Back to Deals
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Header 
        title={deal.name}
        subtitle={`${formatCurrency(deal.value)} • ${deal.probability}% probability`}
        action={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowActivityModal(true)}
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm shadow-primary/30"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Log Activity
            </button>
            
            <button
              onClick={() => setShowEditSlideOver(true)}
              className="bg-slate-100 hover:bg-slate-200 text-text-main px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Edit
            </button>
            
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
        {/* Deal Info */}
        <div className="bg-surface-light rounded-xl border border-border-light p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium text-text-muted">Stage</label>
              <div className="mt-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-full text-white ${getStageColor(deal.stage)}`}>
                  {deal.stage.replace('_', ' ')}
                </span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-text-muted">Value</label>
              <p className="text-2xl font-bold text-text-main mt-1">{formatCurrency(deal.value)}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-text-muted">Probability</label>
              <p className="text-2xl font-bold text-text-main mt-1">{deal.probability}%</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-text-muted">Expected Close</label>
              <p className="text-lg font-medium text-text-main mt-1">
                {deal.expected_close ? getRelativeTime(deal.expected_close) : '—'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border-light">
            {contact && (
              <div>
                <label className="text-sm font-medium text-text-muted">Contact</label>
                <div className="mt-2">
                  <Link 
                    href={`/contacts/${contact.id}`}
                    className="flex items-center gap-3 p-3 border border-border-light rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">person</span>
                    </div>
                    <div>
                      <p className="font-medium text-text-main">{contact.name}</p>
                      <p className="text-sm text-text-muted">{contact.email}</p>
                    </div>
                  </Link>
                </div>
              </div>
            )}
            
            {company && (
              <div>
                <label className="text-sm font-medium text-text-muted">Company</label>
                <div className="mt-2">
                  <Link 
                    href={`/companies/${company.id}`}
                    className="flex items-center gap-3 p-3 border border-border-light rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">domain</span>
                    </div>
                    <div>
                      <p className="font-medium text-text-main">{company.name}</p>
                      {company.industry && (
                        <p className="text-sm text-text-muted">{company.industry}</p>
                      )}
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {deal.notes && (
            <div className="mt-6 pt-6 border-t border-border-light">
              <label className="text-sm font-medium text-text-muted">Notes</label>
              <p className="text-text-main mt-2 whitespace-pre-wrap">{deal.notes}</p>
            </div>
          )}
          
          {deal.tags && (
            <div className="mt-6 pt-6 border-t border-border-light">
              <label className="text-sm font-medium text-text-muted">Tags</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {deal.tags.split(',').filter(Boolean).map((tag, index) => (
                  <span key={index} className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Activities */}
        <div className="bg-surface-light rounded-xl border border-border-light p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-main">Activities</h3>
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
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-4 border border-border-light rounded-lg">
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
                      <p className="text-sm text-text-muted mt-1">
                        {activity.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                      <span>{getRelativeTime(activity.activity_date)}</span>
                      {activity.duration_minutes && (
                        <span>{activity.duration_minutes} minutes</span>
                      )}
                      {activity.outcome && (
                        <span className={`px-2 py-1 rounded-full ${
                          activity.outcome === 'positive' ? 'bg-green-100 text-green-700' :
                          activity.outcome === 'negative' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {activity.outcome}
                        </span>
                      )}
                    </div>
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
        defaultDealId={dealId}
        defaultContactId={contact?.id}
      />

      <DealSlideOver 
        isOpen={showEditSlideOver}
        onClose={() => setShowEditSlideOver(false)}
        deal={deal}
        onSaved={() => {
          setShowEditSlideOver(false);
          fetchDeal();
        }}
      />

      <ConfirmDialog 
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Deal"
        message={`Are you sure you want to delete ${deal.name}? This action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        isDestructive
      />
    </div>
  );
}