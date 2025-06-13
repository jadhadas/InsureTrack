import React, { useEffect } from 'react';
import { FileText, DollarSign, Users, Clock, Download, TrendingUp, Plus, MessageSquare, Sparkles, Star } from 'lucide-react';
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
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-white via-blue-50 to-indigo-50 rounded-3xl p-8 border border-white/20 shadow-xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-400 to-pink-600 rounded-full -translate-x-24 translate-y-24"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                    Dashboard Overview
                  </h1>
                  <p className="text-gray-600 text-lg">Smart Insurance Portfolio Management</p>
                </div>
              </div>
              
              {/* Growth Indicator */}
              {growthPercentage !== 0 && (
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 px-4 py-2 rounded-2xl text-sm font-semibold border border-emerald-200/50 shadow-sm">
                  <TrendingUp className="h-4 w-4" />
                  {growthPercentage >= 0 ? '+' : ''}{growthPercentage}% growth this month
                </div>
              )}
            </div>
            
            {/* Action Button */}
            <div className="flex-shrink-0">
              <button
                onClick={handleExport}
                className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
              >
                <Download className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                Export Portfolio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced SMS Status Alert */}
      {!smsConfig || !smsConfig.enabled ? (
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-200/50 rounded-3xl p-6 shadow-lg">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full translate-x-16 -translate-y-16"></div>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
              <MessageSquare className="h-7 w-7 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-amber-900 mb-1">SMS Notifications Disabled</h3>
              <p className="text-amber-700 text-sm leading-relaxed">
                Enable SMS notifications to automatically send welcome messages, birthday wishes, and renewal reminders to your policyholders.
              </p>
            </div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openSMSSettings'))}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-3 rounded-2xl hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto"
            >
              Setup SMS
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/50 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl flex items-center justify-center shadow-sm">
              <MessageSquare className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <span className="text-emerald-800 font-semibold text-sm">SMS Notifications Active</span>
              <p className="text-emerald-700 text-xs">Automatic messages enabled for policy events</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Enhanced Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
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

      {/* Enhanced Monthly Renewals */}
      {Object.keys(stats.monthlyRenewals).length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Monthly Renewal Schedule</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Object.entries(stats.monthlyRenewals)
              .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
              .map(([month, count]) => (
                <div key={month} className="group bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100/50 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                  <p className="text-sm font-semibold text-gray-600 mb-2">{month}</p>
                  <p className="text-3xl font-bold text-blue-600 mb-1 group-hover:scale-110 transition-transform duration-200">{count}</p>
                  <p className="text-xs text-gray-500">
                    {count === 1 ? 'renewal' : 'renewals'}
                  </p>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* Enhanced Welcome Section for Empty State */}
      {policies.length === 0 && (
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-12 rounded-3xl border border-blue-100/50 shadow-xl">
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full translate-x-20 -translate-y-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full -translate-x-16 translate-y-16"></div>
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full -translate-x-12 -translate-y-12"></div>
          </div>
          
          <div className="text-center relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Star className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
              Welcome to InsureTrack
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
              Start your journey with our comprehensive insurance policy management system. 
              Track renewals, manage premiums, and stay connected with your policyholders.
            </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openPolicyForm'))}
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-lg flex items-center gap-3 mx-auto"
            >
              <Plus className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
              Add Your First Policy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;