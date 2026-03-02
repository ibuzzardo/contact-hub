'use client';

import { useState, useEffect } from 'react';
import { Activity } from '@/types/crm';
import Header from '@/components/Header';
import ActivityModal from '@/components/ActivityModal';
import { getRelativeTime } from '@/lib/utils';

export default function ActivitiesPage(): JSX.Element {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showLogActivity, setShowLogActivity] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, activeFilter]);

  const fetchActivities = async (pageNum = 1, append = false): Promise<void> => {
    try {
      if (pageNum === 1) setIsLoading(true);
      else setLoadingMore(true);
      
      const response = await fetch(`/api/activities?limit=20&page=${pageNum}`);
      if (response.ok) {
        const data = await response.json();
        if (append) {
          setActivities(prev => [...prev, ...data]);
        } else {
          setActivities(data);
        }
        setHasMore(data.length === 20);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  const filterActivities = (): void => {
    if (activeFilter === 'all') {
      setFilteredActivities(activities);
    } else {
      setFilteredActivities(activities.filter(activity => activity.type === activeFilter));
    }
  };

  const loadMore = async (): Promise<void> => {
    const nextPage = page + 1;
    await fetchActivities(nextPage, true);
    setPage(nextPage);
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
      case 'call': return 'border-l-4 border-blue-500';
      case 'email': return 'border-l-4 border-green-500';
      case 'meeting': return 'border-l-4 border-purple-500';
      case 'note': return 'border-l-4 border-amber-500';
      case 'stage_change': return 'border-l-4 border-slate-400';
      default: return 'border-l-4 border-slate-400';
    }
  };

  const getActivityIconColor = (type: string): string => {
    switch (type) {
      case 'call': return 'bg-blue-500';
      case 'email': return 'bg-green-500';
      case 'meeting': return 'bg-purple-500';
      case 'note': return 'bg-amber-500';
      case 'stage_change': return 'bg-slate-400';
      default: return 'bg-slate-400';
    }
  };

  const filters = [
    { key: 'all', label: 'All', icon: 'timeline' },
    { key: 'call', label: 'Calls', icon: 'phone' },
    { key: 'email', label: 'Emails', icon: 'email' },
    { key: 'meeting', label: 'Meetings', icon: 'groups' },
    { key: 'note', label: 'Notes', icon: 'description' }
  ];

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Activity Feed" subtitle="Track all interactions across your CRM" />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-500">Loading activities...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Header 
        title="Activity Feed" 
        subtitle="Track all interactions across your CRM"
      />

      <div className="p-6">
        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          {filters.map(filter => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === filter.key
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{filter.icon}</span>
              {filter.label}
            </button>
          ))}
        </div>

        {/* Activity List */}
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">timeline</span>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No activities found</h3>
            <p className="text-slate-500 mb-6">
              {activeFilter === 'all' 
                ? 'Start logging activities to track your interactions.'
                : `No ${activeFilter} activities found. Try a different filter.`
              }
            </p>
            <button
              onClick={() => setShowLogActivity(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Log Your First Activity
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map(activity => (
              <div
                key={activity.id}
                className={`bg-white rounded-xl p-6 ${getActivityBorderColor(activity.type)}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full ${getActivityIconColor(activity.type)} flex items-center justify-center flex-shrink-0`}>
                    <span className="material-symbols-outlined text-white text-sm">
                      {getActivityIcon(activity.type)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">{activity.subject}</h3>
                      <span className="text-sm text-slate-500 flex-shrink-0 ml-4">
                        {getRelativeTime(activity.activity_date)}
                      </span>
                    </div>
                    {activity.description && (
                      <p className="text-slate-600 mb-3 line-clamp-2">
                        {activity.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      {activity.contact_name && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm">
                          <span className="material-symbols-outlined text-xs">person</span>
                          {activity.contact_name}
                        </span>
                      )}
                      {activity.deal_name && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm">
                          <span className="material-symbols-outlined text-xs">handshake</span>
                          {activity.deal_name}
                        </span>
                      )}
                      {activity.company_name && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm">
                          <span className="material-symbols-outlined text-xs">business</span>
                          {activity.company_name}
                        </span>
                      )}
                      {activity.duration_minutes && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                          {activity.duration_minutes} min
                        </span>
                      )}
                      {activity.outcome && (
                        <span className={`px-2 py-1 rounded text-sm ${
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
              </div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center pt-6">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loadingMore ? 'Loading...' : 'Load More Activities'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Log Activity Button */}
      <button
        onClick={() => setShowLogActivity(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-30"
      >
        <span className="material-symbols-outlined">add</span>
      </button>

      {/* Log Activity Modal */}
      <ActivityModal
        isOpen={showLogActivity}
        onClose={() => setShowLogActivity(false)}
        onSaved={() => {
          fetchActivities();
          setShowLogActivity(false);
        }}
      />
    </div>
  );
}