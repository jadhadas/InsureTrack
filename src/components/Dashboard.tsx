import React, { useEffect } from 'react';
import { FileText, DollarSign, Users, Clock, Download, TrendingUp, Plus, MessageSquare } from 'lucide-react';
import { usePolicies } from '../hooks/usePolicies';
import StatsCard from './StatsCard';
import PieChart from './PieChart';
import RenewalAlerts from './RenewalAlerts';
import { exportToCSV } from '../utils/localStorage';
import { requestNotificationPermission, checkRenewalNotifications } from '../utils/notifications';
import { loadSMSConfig } from '../utils/smsService';

const Dashboard: React.FC = () => {
  const { getStats, getRenewalAlerts, policies } = usePolicies();
  const stats = getStats();
  const renewalAlerts = getRenewalAlerts();
  const smsConfig = loadSMSConfig();

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
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Insurance Policy Management Overview</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {growthPercentage !== 0 && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border border-green-200 w-fit">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              {growthPercentage >= 0 ? '+' : ''}{growthPercentage}% this month
            </div>
          )}
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-sm sm:text-base w-full sm:w-auto"
          >
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* SMS Status Alert */}
      {!smsConfig || !smsConfig.enabled ? (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-yellow-900">SMS Notifications Disabled</h3>
              <p className="text-yellow-700 text-xs sm:text-sm mt-1">
                Configure SMS settings to automatically send welcome messages, birthday wishes, and renewal reminders to your policyholders.
              </p>
            </div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openSMSSettings'))}
              className="bg-yellow-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors duration-200 font-medium text-xs sm:text-sm w-full sm:w-auto"
            >
              Setup SMS
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
            </div>
            <div>
              <span className="text-green-800 font-medium text-xs sm:text-sm">SMS Notifications Active</span>
              <p className="text-green-700 text-xs">Automatic messages enabled for policy events</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
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
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
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
        <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Monthly Renewal Schedule</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
            {Object.entries(stats.monthlyRenewals)
              .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
              .map(([month, count]) => (
                <div key={month} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 sm:p-6 rounded-xl border border-blue-100 hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{month}</p>
                  <p className="text-xl sm:text-3xl font-bold text-blue-600 mb-1">{count}</p>
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
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 sm:p-12 rounded-2xl border border-blue-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-20 transform translate-x-12 sm:translate-x-16 -translate-y-12 sm:-translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 transform -translate-x-8 sm:-translate-x-12 translate-y-8 sm:translate-y-12"></div>
          <div className="text-center relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
              <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Welcome to InsureTrack</h3>
            <p className="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base lg:text-lg px-4">
              Start managing your insurance policies efficiently with our comprehensive tracking system
            </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openPolicyForm'))}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-sm sm:text-base lg:text-lg flex items-center gap-3 mx-auto w-full sm:w-auto justify-center"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              Add Your First Policy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;