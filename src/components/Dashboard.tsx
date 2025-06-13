import React, { useEffect } from 'react';
import { FileText, DollarSign, Users, Clock, Download, TrendingUp } from 'lucide-react';
import { usePolicies } from '../hooks/usePolicies';
import StatsCard from './StatsCard';
import PieChart from './PieChart';
import RenewalAlerts from './RenewalAlerts';
import { exportToCSV } from '../utils/localStorage';
import { requestNotificationPermission, checkRenewalNotifications } from '../utils/notifications';

const Dashboard: React.FC = () => {
  const { getStats, getRenewalAlerts, policies } = usePolicies();
  const stats = getStats();
  const renewalAlerts = getRenewalAlerts();

  useEffect(() => {
    requestNotificationPermission();
    checkRenewalNotifications(policies);
  }, [policies]);

  const handleExport = () => {
    exportToCSV(policies);
  };

  const categoryColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  const ageGroupColors = ['#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1', '#14B8A6'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getGrowthPercentage = () => {
    if (policies.length === 0) return 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthPolicies = policies.filter(policy => {
      const policyDate = new Date(policy.createdAt);
      return policyDate.getMonth() === currentMonth && policyDate.getFullYear() === currentYear;
    }).length;
    
    const lastMonthPolicies = policies.filter(policy => {
      const policyDate = new Date(policy.createdAt);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return policyDate.getMonth() === lastMonth && policyDate.getFullYear() === lastMonthYear;
    }).length;
    
    if (lastMonthPolicies === 0) return thisMonthPolicies > 0 ? 100 : 0;
    return Math.round(((thisMonthPolicies - lastMonthPolicies) / lastMonthPolicies) * 100);
  };

  const growthPercentage = getGrowthPercentage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Insurance Policy Management Overview</p>
        </div>
        <div className="flex gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm">
            <TrendingUp className="h-4 w-4" />
            {growthPercentage >= 0 ? '+' : ''}{growthPercentage}% this month
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Policies"
          value={stats.totalPolicies}
          icon={FileText}
          color="blue"
          subtitle={`${growthPercentage >= 0 ? '+' : ''}${growthPercentage}% from last month`}
        />
        <StatsCard
          title="Total Premium"
          value={formatCurrency(stats.totalPremium)}
          icon={DollarSign}
          color="green"
          subtitle="Across all policies"
        />
        <StatsCard
          title="Average Premium"
          value={formatCurrency(stats.avgPremium)}
          icon={Users}
          color="purple"
          subtitle="Per policy"
        />
        <StatsCard
          title="Renewals Due"
          value={renewalAlerts.length}
          icon={Clock}
          color={renewalAlerts.length > 0 ? "yellow" : "blue"}
          subtitle="Next 7 days"
        />
      </div>

      {/* Renewal Alerts */}
      {renewalAlerts.length > 0 && (
        <RenewalAlerts alerts={renewalAlerts} />
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChart
          data={stats.categoryDistribution}
          colors={categoryColors}
          title="Policy Distribution by Type"
        />
        <PieChart
          data={stats.ageGroupDistribution}
          colors={ageGroupColors}
          title="Policyholder Age Groups"
        />
      </div>

      {/* Monthly Renewals */}
      {Object.keys(stats.monthlyRenewals).length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Renewal Schedule</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(stats.monthlyRenewals)
              .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
              .map(([month, count]) => (
                <div key={month} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100 hover:shadow-md transition-shadow duration-200">
                  <p className="text-sm font-medium text-gray-600">{month}</p>
                  <p className="text-2xl font-bold text-blue-600">{count}</p>
                  <p className="text-xs text-gray-500">
                    {count === 1 ? 'renewal' : 'renewals'}
                  </p>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {policies.length === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl border border-blue-100">
          <div className="text-center">
            <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to InsureTrack</h3>
            <p className="text-gray-600 mb-4">Start managing your insurance policies efficiently</p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openPolicyForm'))}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Add Your First Policy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;