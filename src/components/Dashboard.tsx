import React, { useEffect } from 'react';
import { FileText, DollarSign, Users, Clock, Download, TrendingUp, Plus } from 'lucide-react';
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600 text-lg">Insurance Policy Management Overview</p>
        </div>
        <div className="flex gap-3">
          {growthPercentage !== 0 && (
            <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-4 py-2 rounded-xl text-sm font-medium border border-green-200">
              <TrendingUp className="h-4 w-4" />
              {growthPercentage >= 0 ? '+' : ''}{growthPercentage}% this month
            </div>
          )}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
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
          subtitle={growthPercentage !== 0 ? `${growthPercentage >= 0 ? '+' : ''}${growthPercentage}% from last month` : 'Active policies'}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Monthly Renewal Schedule</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(stats.monthlyRenewals)
              .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
              .map(([month, count]) => (
                <div key={month} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <p className="text-sm font-medium text-gray-600 mb-1">{month}</p>
                  <p className="text-3xl font-bold text-blue-600 mb-1">{count}</p>
                  <p className="text-xs text-gray-500">
                    {count === 1 ? 'renewal' : 'renewals'}
                  </p>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* Welcome Section for Empty State */}
      {policies.length === 0 && (
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-12 rounded-2xl border border-blue-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-20 transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 transform -translate-x-12 translate-y-12"></div>
          <div className="text-center relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FileText className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome to InsureTrack</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
              Start managing your insurance policies efficiently with our comprehensive tracking system
            </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openPolicyForm'))}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-lg flex items-center gap-3 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Add Your First Policy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;