'use client';

import { useState, useEffect } from 'react';
import { ReportResponse } from '@/types/crm';
import Header from '@/components/Header';

export default function ReportsPage(): JSX.Element {
  const [reports, setReports] = useState<ReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async (): Promise<void> => {
    try {
      const response = await fetch('/api/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
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

  const getStageColor = (stage: string): string => {
    switch (stage) {
      case 'lead': return 'bg-slate-400';
      case 'qualified': return 'bg-blue-500';
      case 'proposal': return 'bg-amber-400';
      case 'negotiation': return 'bg-purple-500';
      case 'closed_won': return 'bg-emerald-500';
      case 'closed_lost': return 'bg-red-500';
      default: return 'bg-slate-400';
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

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Reports" subtitle="CRM Performance Overview" />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-500">Loading reports...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!reports) {
    return (
      <div className="flex-1">
        <Header title="Reports" subtitle="CRM Performance Overview" />
        <div className="p-6">
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">bar_chart</span>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No data available</h3>
            <p className="text-slate-500">Start adding deals and activities to see your reports.</p>
          </div>
        </div>
      </div>
    );
  }

  const maxStageValue = Math.max(...reports.dealsByStage.map(stage => stage.value), 1);
  const maxActivityCount = Math.max(...reports.activitiesByType.map(activity => activity.count), 1);

  return (
    <div className="flex-1">
      <Header title="Reports" subtitle="CRM Performance Overview" />

      <div className="p-6 space-y-6">
        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-500">Total Pipeline Value</h3>
              <span className="material-symbols-outlined text-blue-500">trending_up</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(reports.pipeline.totalValue)}
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {reports.pipeline.dealCount} active deals
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-500">Win Rate</h3>
              <span className="material-symbols-outlined text-green-500">check_circle</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {reports.winRate.rate}%
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {reports.winRate.won} won, {reports.winRate.lost} lost
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-500">Average Deal Size</h3>
              <span className="material-symbols-outlined text-purple-500">attach_money</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(reports.pipeline.avgDealSize)}
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {Math.round(reports.pipeline.avgProbability)}% avg probability
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-500">Active Deals</h3>
              <span className="material-symbols-outlined text-orange-500">handshake</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {reports.pipeline.dealCount}
            </div>
            <div className="text-sm text-slate-500 mt-1">
              In pipeline
            </div>
          </div>
        </div>

        {/* Deals by Stage Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Deals by Stage</h3>
          <div className="space-y-4">
            {reports.dealsByStage.map(stage => (
              <div key={stage.stage} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium text-slate-700 flex-shrink-0">
                  {getStageName(stage.stage)}
                </div>
                <div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden">
                  <div 
                    className={`h-full ${getStageColor(stage.stage)} transition-all duration-500`}
                    style={{ width: `${(stage.value / maxStageValue) * 100}%` }}
                  />
                </div>
                <div className="w-20 text-sm text-slate-600 text-right flex-shrink-0">
                  {stage.count} deals
                </div>
                <div className="w-24 text-sm font-medium text-slate-900 text-right flex-shrink-0">
                  {formatCurrency(stage.value)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Row - Activities and Top Deals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activities by Type */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Activities by Type</h3>
            <div className="space-y-4">
              {reports.activitiesByType.map(activity => (
                <div key={activity.type} className="flex items-center gap-4">
                  <div className="w-16 text-sm font-medium text-slate-700 capitalize flex-shrink-0">
                    {activity.type}
                  </div>
                  <div className="flex-1 bg-slate-100 rounded-full h-4 relative overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${(activity.count / maxActivityCount) * 100}%` }}
                    />
                  </div>
                  <div className="w-12 text-sm font-medium text-slate-900 text-right flex-shrink-0">
                    {activity.count}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 5 Deals */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Top 5 Deals</h3>
            {reports.topDeals.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">handshake</span>
                <p className="text-slate-500">No active deals</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.topDeals.map(deal => (
                  <div key={deal.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 truncate">{deal.name}</div>
                      <div className="text-sm text-slate-500">
                        {deal.company_name || 'No company'} • {getStageName(deal.stage)}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="font-semibold text-slate-900">{formatCurrency(deal.value)}</div>
                      <div className="text-sm text-slate-500">{deal.probability}%</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}