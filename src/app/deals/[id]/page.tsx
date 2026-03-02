'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Deal, Activity } from '@/types/crm';
import Header from '@/components/Header';
import Avatar from '@/components/Avatar';
import DealSlideOver from '@/components/DealSlideOver';
import ActivityModal from '@/components/ActivityModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { getRelativeTime } from '@/lib/utils';

interface DealDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function DealDetailPage({ params }: DealDetailPageProps): JSX.Element {
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditDeal, setShowEditDeal] = useState(false);
  const [showLogActivity, setShowLogActivity] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dealId, setDealId] = useState<string>('');

  useEffect(() => {
    const loadParams = async (): Promise<void> => {
      const resolvedParams = await params;
      setDealId(resolvedParams.id);
    };
    loadParams();
  }, [params]);

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
      } else if (response.status === 404) {
        router.push('/deals');
      }
    } catch (error) {
      console.error('Error fetching deal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivities = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/activities?deal_id=${dealId}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleDeleteDeal = async (): Promise<void> => {
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
      setShowDeleteConfirm(false);
    }
  };

  const getStageColor = (stage: string): string => {
    switch (stage) {
      case 'lead': return 'bg-slate-100 text-slate-700';
      case 'qualified': return 'bg-blue-100 text-blue-700';
      case 'proposal': return 'bg-amber-100 text-amber-700';
      case 'negotiation': return 'bg-purple-100 text-purple-700';
      case 'closed_won': return 'bg-emerald-100 text-emerald-700';
      case 'closed_lost': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStageName = (stage: string): string => {
    switch (stage) {
      case 'lead': return 'Lead';
      case 'qualified': return 'Qualified';
      case 'proposal': return 'Proposal';
      case 'negotiation': return 'Negotiation';
      case 'closed_won': return 'Closed Won';
      case 'closed_lost': return 'Closed Lost';
      default: return stage;
    }
  };

  const getActivityIcon = (type: string): string => {
    switch (type) {
      case 'call': return 'phone';
      case 'email': return 'email';
      case 'meeting': return 'groups';
      case 'note': return 'description';
      case 'stage_change': return 'trending_up';
      default: return 'timeline';
    }
  };

  const getActivityBorderColor = (type: string): string => {
    switch (type) {
      case 'call': return 'border-l-blue-500';
      case 'email': return 'border-l-green-500';
      case 'meeting': return 'border-l-purple-500';
      case 'note': return 'border-l-amber-500';
      case 'stage_change': return 'border-l-slate-400';
      default: return 'border-l-slate-400';
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

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Deal Details" subtitle="Loading deal information..." />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-500">Loading deal...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="flex-1">
        <Header title="Deal Not Found" subtitle="The requested deal could not be found." />
        <div className="p-6">
          <div className="text-center">
            <Link href="/deals" className="text-blue-600 hover:text-blue-800">
              ← Back to Deals
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const dealTags = deal.tags ? deal.tags.split(',').filter(Boolean) : [];

  return (
    <div className="flex-1">
      <Header 
        title={deal.name}
        subtitle={`Deal #DL-${deal.id}`}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditDeal(true)}
            className="flex items-center gap-2 px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            Delete
          </button>
        </div>
      </Header>

      <div className="p-6">
        <div className="flex gap-6">
          {/* Left Column - Deal Info */}
          <div className="w-3/5">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              {/* Stage Badge */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStageColor(deal.stage)}`}>
                  {getStageName(deal.stage)}
                </span>
              </div>

              {/* Deal Name and ID */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 mb-1">{deal.name}</h1>
                <p className="text-slate-500">#DL-{deal.id}</p>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-6 mb-8 p-4 bg-slate-50 rounded-lg">
                <div>
                  <div className="text-2xl font-bold text-slate-900">{formatCurrency(deal.value)}</div>
                  <div className="text-sm text-slate-500">Deal Value</div>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-slate-900">{deal.probability}%</span>
                    <span className="material-symbols-outlined text-green-500 text-sm">trending_up</span>
                  </div>
                  <div className="text-sm text-slate-500">Probability</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{formatDate(deal.expected_close)}</div>
                  <div className="text-sm text-slate-500">Expected Close</div>
                </div>
              </div>

              {/* Related Information */}
              {(deal.company_name || deal.contact_name) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Related Information</h3>
                  <div className="space-y-3">
                    {deal.company_name && (
                      <Link 
                        href={`/companies/${deal.company_id}`}
                        className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-blue-600">business</span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{deal.company_name}</div>
                          <div className="text-sm text-slate-500">Company</div>
                        </div>
                      </Link>
                    )}
                    {deal.contact_name && (
                      <Link 
                        href={`/contacts/${deal.contact_id}`}
                        className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <Avatar name={deal.contact_name} size="sm" />
                        <div>
                          <div className="font-medium text-slate-900">{deal.contact_name}</div>
                          <div className="text-sm text-slate-500">Contact</div>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {dealTags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {dealTags.map(tag => (
                      <span
                        key={tag}
                        className="bg-slate-100 rounded-full px-3 py-1 text-sm text-slate-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {deal.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Notes</h3>
                  <p className="text-slate-600 whitespace-pre-wrap">{deal.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Activity Timeline */}
          <div className="w-2/5">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Activity Timeline</h2>
                <button
                  onClick={() => setShowLogActivity(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Log Activity
                </button>
              </div>

              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block">timeline</span>
                  <p className="text-slate-500 mb-4">No activities yet. Log your first activity.</p>
                  <button
                    onClick={() => setShowLogActivity(true)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Log Activity
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map(activity => (
                    <div
                      key={activity.id}
                      className={`border-l-4 pl-4 pb-4 ${getActivityBorderColor(activity.type)}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="material-symbols-outlined text-sm text-slate-600">
                            {getActivityIcon(activity.type)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 mb-1">{activity.subject}</div>
                          {activity.description && (
                            <p className="text-slate-600 text-sm mb-2 line-clamp-2">
                              {activity.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            {activity.contact_name && (
                              <span className="bg-slate-100 px-2 py-1 rounded">
                                {activity.contact_name}
                              </span>
                            )}
                            {activity.duration_minutes && (
                              <span className="bg-slate-100 px-2 py-1 rounded">
                                {activity.duration_minutes} min
                              </span>
                            )}
                            {activity.outcome && (
                              <span className={`px-2 py-1 rounded ${
                                activity.outcome === 'positive' ? 'bg-green-100 text-green-700' :
                                activity.outcome === 'negative' ? 'bg-red-100 text-red-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {activity.outcome}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-2">
                            {getRelativeTime(activity.activity_date)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DealSlideOver
        isOpen={showEditDeal}
        onClose={() => setShowEditDeal(false)}
        deal={deal}
        onSaved={() => {
          fetchDeal();
          setShowEditDeal(false);
        }}
      />

      <ActivityModal
        isOpen={showLogActivity}
        onClose={() => setShowLogActivity(false)}
        defaultDealId={deal.id}
        onSaved={() => {
          fetchActivities();
          setShowLogActivity(false);
        }}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteDeal}
        title="Delete Deal"
        message={`Are you sure you want to delete "${deal.name}"? This action cannot be undone.`}
        confirmText="Delete Deal"
        isLoading={isDeleting}
      />
    </div>
  );
}