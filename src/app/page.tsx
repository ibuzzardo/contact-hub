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
      >
        <Link
          href="/settings"
          className="flex items-center gap-2 px-4 py-2 text-text-muted hover:bg-slate-100 rounded-lg transition-colors border border-border-light"
        >
          <span className="material-symbols-outlined text-base">upload_file</span>
          Import
        </Link>
        <Link
          href="/contacts/new"
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/30"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Add Contact
        </Link>
      </Header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">group</span>
              </div>
              <div>
                <div className="text-xs uppercase text-text-muted font-medium">Contacts</div>
                <div className="text-2xl font-bold text-text-main">{stats.totalContacts}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium">+5.2%</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">domain</span>
              </div>
              <div>
                <div className="text-xs uppercase text-text-muted font-medium">Companies</div>
                <div className="text-2xl font-bold text-text-main">{stats.totalCompanies}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium">+2.1%</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">folder_open</span>
              </div>
              <div>
                <div className="text-xs uppercase text-text-muted font-medium">Open Deals</div>
                <div className="text-2xl font-bold text-text-main">{stats.openDeals}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium">+12.5%</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">attach_money</span>
              </div>
              <div>
                <div className="text-xs uppercase text-text-muted font-medium">Pipeline Value</div>
                <div className="text-2xl font-bold text-text-main">{formatCurrency(stats.pipelineValue)}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium">+8.3%</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">trophy</span>
              </div>
              <div>
                <div className="text-xs uppercase text-text-muted font-medium">Won This Month</div>
                <div className="text-2xl font-bold text-text-main">{formatCurrency(stats.wonThisMonth)}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium">+15.7%</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-rose-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">event_available</span>
              </div>
              <div>
                <div className="text-xs uppercase text-text-muted font-medium">Activities</div>
                <div className="text-2xl font-bold text-text-main">{stats.activitiesThisWeek}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium">+3.2%</span>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activities */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-text-main">Recent Activities</h2>
            </div>
            <div className="p-6">
              {stats.recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full ${getActivityIconColor(activity.type)} flex items-center justify-center flex-shrink-0`}>
                        <span className="material-symbols-outlined text-white text-sm">{getActivityIcon(activity.type)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-main font-medium">{activity.subject}</p>
                        <div className="flex items-center gap-2 text-xs text-text-muted mt-1">
                          {activity.contact_name && <span>{activity.contact_name}</span>}
                          {activity.deal_name && <span>• {activity.deal_name}</span>}
                          <span>• {getRelativeTime(activity.activity_date)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">timeline</span>
                  <div className="text-text-muted">No recent activities</div>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Follow-ups */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-text-main">Upcoming Follow-ups</h2>
            </div>
            <div className="p-6">
              {stats.upcomingTasks.length > 0 ? (
                <div className="space-y-4">
                  {stats.upcomingTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                        <div>
                          <div className="text-sm font-medium text-text-main">{task.title}</div>
                          <div className="flex items-center gap-2 text-xs text-text-muted">
                            {task.contact_name && (
                              <div className="flex items-center gap-1">
                                <Avatar name={task.contact_name} size="sm" />
                                <span>{task.contact_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.due_date && (
                          <span className={`text-xs ${
                            isOverdue(task.due_date) ? 'text-red-600 font-medium' : 'text-text-muted'
                          }`}>
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                        <button className="text-green-600 hover:text-green-700">
                          <span className="material-symbols-outlined text-base">check_circle</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">check_box</span>
                  <div className="text-text-muted">No upcoming tasks</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Deals by Stage Chart */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-text-main">Deals by Stage</h2>
          </div>
          <div className="p-6">
            {stats.dealsByStage.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {stats.dealsByStage.map((stage) => {
                  const heightPercentage = maxStageValue > 0 ? (stage.value / maxStageValue) * 100 : 0;
                  return (
                    <div key={stage.stage} className="text-center">
                      <div className="mb-2">
                        <div className="text-sm font-medium text-text-main mb-1">{stage.count} deals</div>
                        <div className="h-32 bg-slate-100 rounded-lg flex items-end justify-center p-2">
                          <div 
                            className="w-full bg-primary rounded transition-all duration-300"
                            style={{ height: `${Math.max(heightPercentage, 5)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-xs text-text-muted uppercase font-medium">
                        {stage.stage.replace('_', ' ')}
                      </div>
                      <div className="text-sm font-bold text-text-main">
                        {formatCurrency(stage.value)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">bar_chart</span>
                <div className="text-text-muted">No deals data available</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}