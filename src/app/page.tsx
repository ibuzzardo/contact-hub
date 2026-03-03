'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CrmDashboardStats } from '@/types';
import Header from '@/components/Header';
import Avatar from '@/components/Avatar';
import { getGreeting, getRelativeTime } from '@/lib/utils';

export default function Dashboard(): JSX.Element {
  const [stats, setStats] = useState<CrmDashboardStats>({
    totalContacts: 0,
    totalCompanies: 0,
    openDeals: 0,
    pipelineValue: 0,
    wonThisMonth: 0,
    activitiesThisWeek: 0,
    recentActivities: [],
    upcomingTasks: [],
    dealsByStage: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async (): Promise<void> => {
    try {
      const response = await fetch('/api/stats', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const greeting = getGreeting();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-slate-500';
    }
  };

  const isOverdue = (dueDate: string): boolean => {
    return new Date(dueDate) < new Date();
  };

  const maxStageValue = Math.max(...stats.dealsByStage.map(stage => stage.value), 1);

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title={`${greeting}, Ian`} subtitle="Loading your CRM dashboard..." />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-text-muted">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Header 
        title={`${greeting}, Ian`}
        subtitle="Here's what's happening with your sales pipeline today."
      />
      
      <div className="p-6 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-surface-light rounded-xl border border-border-light p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Total Contacts</p>
                <p className="text-3xl font-bold text-text-main mt-2">{stats.totalContacts.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-[#E64626] rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">group</span>
              </div>
            </div>
          </div>
          
          <div className="bg-surface-light rounded-xl border border-border-light p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Companies</p>
                <p className="text-3xl font-bold text-text-main mt-2">{stats.totalCompanies.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-[#A83420] rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">domain</span>
              </div>
            </div>
          </div>
          
          <div className="bg-surface-light rounded-xl border border-border-light p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Open Deals</p>
                <p className="text-3xl font-bold text-text-main mt-2">{stats.openDeals.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-[#C63E24] rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">handshake</span>
              </div>
            </div>
          </div>
          
          <div className="bg-surface-light rounded-xl border border-border-light p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Pipeline Value</p>
                <p className="text-3xl font-bold text-text-main mt-2">{formatCurrency(stats.pipelineValue)}</p>
              </div>
              <div className="w-12 h-12 bg-[#D85038] rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">trending_up</span>
              </div>
            </div>
          </div>
          
          <div className="bg-surface-light rounded-xl border border-border-light p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Won This Month</p>
                <p className="text-3xl font-bold text-text-main mt-2">{formatCurrency(stats.wonThisMonth)}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">paid</span>
              </div>
            </div>
          </div>
          
          <div className="bg-surface-light rounded-xl border border-border-light p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Activities This Week</p>
                <p className="text-3xl font-bold text-text-main mt-2">{stats.activitiesThisWeek.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-[#E06848] rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">forum</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pipeline Chart */}
          <div className="bg-surface-light rounded-xl border border-border-light p-6">
            <h3 className="text-lg font-semibold text-text-main mb-6">Deals by Stage</h3>
            <div className="space-y-4">
              {stats.dealsByStage.map((stage) => {
                const percentage = (stage.value / maxStageValue) * 100;
                return (
                  <div key={stage.stage} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-text-main capitalize">
                        {stage.stage.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-text-muted">
                        {formatCurrency(stage.value)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-surface-light rounded-xl border border-border-light p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-main">Recent Activities</h3>
              <Link 
                href="/activities" 
                className="text-primary hover:text-primary-dark text-sm font-medium transition-colors"
              >
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {stats.recentActivities.length === 0 ? (
                <p className="text-text-muted text-center py-8">No recent activities</p>
              ) : (
                stats.recentActivities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full ${getActivityIconColor(activity.type)} flex items-center justify-center flex-shrink-0`}>
                      <span className="material-symbols-outlined text-white text-sm">
                        {getActivityIcon(activity.type)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-main truncate">
                        {activity.subject}
                      </p>
                      <p className="text-xs text-text-muted">
                        {activity.contact_name} • {getRelativeTime(activity.activity_date)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-surface-light rounded-xl border border-border-light p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-main">Upcoming Tasks</h3>
            <Link 
              href="/tasks" 
              className="text-primary hover:text-primary-dark text-sm font-medium transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {stats.upcomingTasks.length === 0 ? (
              <p className="text-text-muted text-center py-8">No upcoming tasks</p>
            ) : (
              stats.upcomingTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center gap-4 p-4 border border-border-light rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-main truncate">
                      {task.title}
                    </p>
                    <p className="text-xs text-text-muted">
                      {task.contact_name && `${task.contact_name} • `}
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
    </div>
  );
}