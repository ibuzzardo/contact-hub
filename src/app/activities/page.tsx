'use client';

import { useState, useEffect } from 'react';
import { Activity, Contact, Deal } from '@/types';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import ActivityModal from '@/components/ActivityModal';
import EmptyState from '@/components/EmptyState';
import { getRelativeTime } from '@/lib/utils';

export default function ActivitiesPage(): JSX.Element {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const itemsPerPage = 20;

  const activityTypes = [
    { value: 'call', label: 'Call' },
    { value: 'email', label: 'Email' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'note', label: 'Note' },
    { value: 'stage_change', label: 'Stage Change' }
  ];

  useEffect(() => {
    fetchActivities();
    fetchContacts();
    fetchDeals();
  }, [currentPage, searchTerm, selectedType]);

  const fetchActivities = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedType && { type: selectedType })
      });
      
      const response = await fetch(`/api/activities?${params}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data || []);
        // Note: API doesn't return pagination info yet
        setTotalActivities(data?.length || 0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContacts = async (): Promise<void> => {
    try {
      const response = await fetch('/api/contacts');
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchDeals = async (): Promise<void> => {
    try {
      const response = await fetch('/api/deals');
      if (response.ok) {
        const data = await response.json();
        setDeals(data || []);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    }
  };

  const handleSearch = (term: string): void => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleTypeFilter = (type: string): void => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const getContactName = (contactId: number): string => {
    const contact = contacts.find(c => c.id === contactId);
    return contact?.name || '';
  };

  const getDealName = (dealId: number): string => {
    const deal = deals.find(d => d.id === dealId);
    return deal?.name || '';
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

  if (isLoading && currentPage === 1) {
    return (
      <div className="flex-1">
        <Header title="Activities" subtitle="Loading activities..." />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-text-muted">Loading activities...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Header 
        title="Activities" 
        subtitle={`Track your ${totalActivities.toLocaleString()} activities`}
        action={
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm shadow-primary/30"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Log Activity
          </button>
        }
      />
      
      <div className="p-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <SearchBar 
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search activities by subject, contact, or deal..."
            />
          </div>
          
          <div className="sm:w-48">
            <select
              value={selectedType}
              onChange={(e) => handleTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-border-light rounded-lg bg-surface-light text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            >
              <option value="">All Types</option>
              {activityTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Activities List */}
        {activities.length === 0 ? (
          <EmptyState 
            icon="forum"
            title="No activities found"
            description={searchTerm || selectedType ? 
              "Try adjusting your search or filter criteria." :
              "Get started by logging your first activity."
            }
            action={!searchTerm && !selectedType ? {
              label: "Log Activity",
              onClick: () => setShowModal(true)
            } : undefined}
          />
        ) : (
          <>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="bg-surface-light rounded-xl border border-border-light p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full ${getActivityIconColor(activity.type)} flex items-center justify-center flex-shrink-0`}>
                      <span className="material-symbols-outlined text-white">
                        {getActivityIcon(activity.type)}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-text-main mb-1">
                            {activity.subject}
                          </h3>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted mb-3">
                            <span className="capitalize">{activity.type.replace('_', ' ')}</span>
                            <span>{getRelativeTime(activity.activity_date)}</span>
                            
                            {activity.contact_id && (
                              <span>Contact: {getContactName(activity.contact_id)}</span>
                            )}
                            
                            {activity.deal_id && (
                              <span>Deal: {getDealName(activity.deal_id)}</span>
                            )}
                            
                            {activity.duration_minutes && (
                              <span>{activity.duration_minutes} minutes</span>
                            )}
                          </div>
                          
                          {activity.description && (
                            <p className="text-text-main whitespace-pre-wrap">
                              {activity.description}
                            </p>
                          )}
                        </div>
                        
                        {activity.outcome && (
                          <span className={`px-3 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
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
            </div>
            
            {totalPages > 1 && (
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalActivities}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>

      <ActivityModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSaved={() => {
          setShowModal(false);
          fetchActivities();
        }}
      />
    </div>
  );
}