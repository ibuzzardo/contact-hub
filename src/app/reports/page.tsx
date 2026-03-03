'use client';

import { useState, useEffect } from 'react';
import { CrmDashboardStats } from '@/types';
import Header from '@/components/Header';

export default function ReportsPage(): JSX.Element {
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
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
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

  const calculateConversionRate = (): number => {
    const totalDeals = stats.dealsByStage.reduce((sum, stage) => sum + stage.count, 0);
    const wonDeals = stats.dealsByStage.find(stage => stage.stage === 'won')?.count || 0;
    return totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;
  };

  const calculateAverageDealSize = (): number => {
    const totalValue = stats.dealsByStage.reduce((sum, stage) => sum + stage.value, 0);
    const totalDeals = stats.dealsByStage.reduce((sum, stage) => sum + stage.count, 0);
    return totalDeals > 0 ? totalValue / totalDeals : 0;
  };

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Reports" subtitle="Loading reports..." />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-text-muted">Loading reports...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Header 
        title="Reports" 
        subtitle="Analytics and insights for your CRM data"
      />
      
      <div className="p-6 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface-light rounded-xl border border-border-light p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Conversion Rate</p>
                <p className="text-3xl font-bold text-text-main mt-2">
                  {calculateConversionRate().toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">trending_up</span>
              </div>
            </div>
          </div>
          
          <div className="bg-surface-light rounded-xl border border-border-light p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Avg Deal Size</p>
                <p className="text-3xl font-bold text-text-main mt-2">
                  {formatCurrency(calculateAverageDealSize())}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">attach_money</span>
              </div>
            </div>
          </div>
          
          <div className="bg-surface-light rounded-xl border border-border-light p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Pipeline Value</p>
                <p className="text-3xl font-bold text-text-main mt-2">
                  {formatCurrency(stats.pipelineValue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">account_balance</span>
              </div>
            </div>
          </div>
          
          <div className="bg-surface-light rounded-xl border border-border-light p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Activities/Week</p>
                <p className="text-3xl font-bold text-text-main mt-2">
                  {stats.activitiesThisWeek}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">forum</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Deal Stage Breakdown */}
          <div className="bg-surface-light rounded-xl border border-border-light p-6">
            <h3 className="text-lg font-semibold text-text-main mb-6">Deal Stage Breakdown</h3>
            <div className="space-y-4">
              {stats.dealsByStage.map((stage) => {
                const percentage = stats.dealsByStage.reduce((sum, s) => sum + s.count, 0) > 0 
                  ? (stage.count / stats.dealsByStage.reduce((sum, s) => sum + s.count, 0)) * 100 
                  : 0;
                
                return (
                  <div key={stage.stage} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-text-main capitalize">
                        {stage.stage.replace('_', ' ')}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-medium text-text-main">
                          {stage.count} deals
                        </span>
                        <span className="text-xs text-text-muted ml-2">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-text-muted">
                      {formatCurrency(stage.value)} total value
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-surface-light rounded-xl border border-border-light p-6">
            <h3 className="text-lg font-semibold text-text-main mb-6">Performance Summary</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-text-main">Total Contacts</p>
                  <p className="text-sm text-text-muted">Active contacts in system</p>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {stats.totalContacts.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-text-main">Total Companies</p>
                  <p className="text-sm text-text-muted">Unique companies tracked</p>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {stats.totalCompanies.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-text-main">Open Deals</p>
                  <p className="text-sm text-text-muted">Deals in active stages</p>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {stats.openDeals.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-text-main">Won This Month</p>
                  <p className="text-sm text-text-muted">Revenue closed this month</p>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.wonThisMonth)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-surface-light rounded-xl border border-border-light p-6">
          <h3 className="text-lg font-semibold text-text-main mb-4">Export Reports</h3>
          <p className="text-text-muted mb-6">Download detailed reports for further analysis</p>
          
          <div className="flex flex-wrap gap-4">
            <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm shadow-primary/30">
              <span className="material-symbols-outlined text-sm">download</span>
              Export Contacts
            </button>
            
            <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm shadow-primary/30">
              <span className="material-symbols-outlined text-sm">download</span>
              Export Deals
            </button>
            
            <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm shadow-primary/30">
              <span className="material-symbols-outlined text-sm">download</span>
              Export Activities
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}