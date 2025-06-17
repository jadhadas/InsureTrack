import React, { useEffect } from 'react';
import { FileText, DollarSign, Users, Clock, TrendingUp, Plus, MessageSquare, Sparkles, Star, Calendar, RefreshCw } from 'lucide-react';
import { usePolicies } from '../hooks/usePolicies';
import StatsCard from './StatsCard';
import PieChart from './PieChart';
import RenewalAlerts from './RenewalAlerts';
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

  const categoryColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  const ageGroupColors = ['#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1', '#14B8A6'];
  const renewalFrequencyColors = ['#10B981', '#3B82F6'];

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
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 w-full min-h-screen">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-white via-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 shadow-lg sm:shadow-xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 lg:w-64 lg:h-64 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full translate-x-12 sm:translate-x-16 lg:translate-x-32 -translate-y-12 sm:-translate-y-16 lg:-translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-48 lg:h-48 bg-gradient-to-tr from-purple-400 to-pink-600 rounded-full -translate-x-8 sm:-translate-x-12 lg:-translate-x-24 translate-y-8 sm:translate-y-12 lg:translate-y-24"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 lg:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent truncate">
                    Dashboard Overview
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base lg:text-lg truncate">Smart Insurance Portfolio Management</p>
                </div>
              </div>
              
              {/* Growth Indicator */}
              {growthPercentage !== 0 && (
                <div className="inline-flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl lg:rounded-2xl text-xs sm:text-sm font-semibold border border-emerald-200/50 shadow-sm">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{growthPercentage >= 0 ? '+' : ''}{growthPercentage}% growth this month</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced SMS Status Alert */}
      {!smsConfig || !smsConfig.enabled ? (
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-200/50 rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 shadow-lg">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-32 lg:h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full translate-x-6 sm:translate-x-8 lg:translate-x-16 -translate-y-6 sm:-translate-y-8 lg:-translate-y-16"></div>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
              <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base lg:text-lg font-bold text-amber-900 mb-1 truncate">SMS Notifications Disabled</h3>
              <p className="text-amber-700 text-xs sm:text-sm leading-relaxed">
                Enable SMS notifications to automatically send welcome messages, birthday wishes, and renewal reminders to your policyholders.
              </p>
            </div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openSMSSettings'))}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl lg:rounded-2xl hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto text-xs sm:text-sm lg:text-base flex-shrink-0"
            >
              Setup SMS
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/50 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-emerald-100 to-green-100 rounded-md sm:rounded-lg lg:rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-emerald-600" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-emerald-800 font-semibold text-xs sm:text-sm block truncate">SMS Notifications Active</span>
              <p className="text-emerald-700 text-xs truncate">Automatic messages enabled for policy events</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatsCard
          title="Total Policies"
          value={stats.totalPolicies}
          icon={FileText}
          color="blue"
          subtitle={growthPercentage !== 0 ? `${growthPercentage >= 0 ? '+' : ''}${growthPercentage}% from last month` : 'Active policies'}
        />
        <StatsCard
          title="Monthly Premium"
          value={formatCurrency(stats.monthlyPremiumTotal)}
          icon={Calendar}
          color="green"
          subtitle="Total monthly premiums"
        />
        <StatsCard
          title="Annual Premium"
          value={formatCurrency(stats.yearlyPremiumTotal)}
          icon={DollarSign}
          color="purple"
          subtitle="Total annual premiums"
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
        <div className="w-full">
          <RenewalAlerts alerts={renewalAlerts} />
        </div>
      )}

      {/* Enhanced Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        <div className="w-full">
          <PieChart
            data={stats.categoryDistribution}
            colors={categoryColors}
            title="Policy Distribution by Type"
          />
        </div>
        <div className="w-full">
          <PieChart
            data={stats.ageGroupDistribution}
            colors={ageGroupColors}
            title="Policyholder Age Groups"
          />
        </div>
        <div className="w-full">
          <PieChart
            data={stats.renewalFrequencyDistribution}
            colors={renewalFrequencyColors}
            title="Renewal Frequency Distribution"
          />
        </div>
      </div>

      {/* Enhanced Premium Breakdown */}
      {policies.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg sm:shadow-xl border border-white/20 w-full">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-6">
            <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-md sm:rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
            </div>
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 truncate">Premium Breakdown</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="group bg-gradient-to-br from-green-50 to-emerald-50 p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl lg:rounded-2xl border border-green-100/50 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 mb-1 sm:mb-2 lg:mb-3">
                <div className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-green-100 rounded-md sm:rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-2 w-2 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-green-600" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-600 truncate">Monthly Total</span>
              </div>
              <p className="text-sm sm:text-lg lg:text-2xl font-bold text-green-600 mb-1 group-hover:scale-110 transition-transform duration-200 truncate">
                {formatCurrency(stats.monthlyPremiumTotal)}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {stats.renewalFrequencyDistribution.monthly || 0} monthly policies
              </p>
            </div>
            
            <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl lg:rounded-2xl border border-blue-100/50 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 mb-1 sm:mb-2 lg:mb-3">
                <div className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-blue-100 rounded-md sm:rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="h-2 w-2 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-blue-600" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-600 truncate">Annual Total</span>
              </div>
              <p className="text-sm sm:text-lg lg:text-2xl font-bold text-blue-600 mb-1 group-hover:scale-110 transition-transform duration-200 truncate">
                {formatCurrency(stats.yearlyPremiumTotal)}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {stats.renewalFrequencyDistribution.yearly || 0} yearly policies
              </p>
            </div>
            
            <div className="group bg-gradient-to-br from-purple-50 to-violet-50 p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl lg:rounded-2xl border border-purple-100/50 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 mb-1 sm:mb-2 lg:mb-3">
                <div className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-purple-100 rounded-md sm:rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-2 w-2 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-purple-600" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-600 truncate">Average Premium</span>
              </div>
              <p className="text-sm sm:text-lg lg:text-2xl font-bold text-purple-600 mb-1 group-hover:scale-110 transition-transform duration-200 truncate">
                {formatCurrency(stats.avgPremium)}
              </p>
              <p className="text-xs text-gray-500 truncate">per policy</p>
            </div>
            
            <div className="group bg-gradient-to-br from-orange-50 to-amber-50 p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl lg:rounded-2xl border border-orange-100/50 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 mb-1 sm:mb-2 lg:mb-3">
                <div className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-orange-100 rounded-md sm:rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-orange-600" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-600 truncate">Total Portfolio</span>
              </div>
              <p className="text-sm sm:text-lg lg:text-2xl font-bold text-orange-600 mb-1 group-hover:scale-110 transition-transform duration-200 truncate">
                {formatCurrency(stats.totalPremium)}
              </p>
              <p className="text-xs text-gray-500 truncate">all policies combined</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Monthly Renewals */}
      {Object.keys(stats.monthlyRenewals).length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg sm:shadow-xl border border-white/20 w-full">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-6">
            <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-md sm:rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
            </div>
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 truncate">Monthly Renewal Schedule</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
            {Object.entries(stats.monthlyRenewals)
              .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
              .map(([month, count]) => (
                <div key={month} className="group bg-gradient-to-br from-blue-50 to-indigo-50 p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl lg:rounded-2xl border border-blue-100/50 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2 truncate">{month}</p>
                  <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-1 group-hover:scale-110 transition-transform duration-200">{count}</p>
                  <p className="text-xs text-gray-500 truncate">
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
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 sm:p-8 lg:p-12 rounded-xl sm:rounded-2xl lg:rounded-3xl border border-blue-100/50 shadow-lg sm:shadow-xl w-full">
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 lg:w-40 lg:h-40 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full translate-x-8 sm:translate-x-10 lg:translate-x-20 -translate-y-8 sm:-translate-y-10 lg:-translate-y-20"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-32 lg:h-32 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full -translate-x-6 sm:-translate-x-8 lg:-translate-x-16 translate-y-6 sm:translate-y-8 lg:translate-y-16"></div>
            <div className="absolute top-1/2 left-1/2 w-8 h-8 sm:w-12 sm:h-12 lg:w-24 lg:h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full -translate-x-4 sm:-translate-x-6 lg:-translate-x-12 -translate-y-4 sm:-translate-y-6 lg:-translate-y-12"></div>
          </div>
          
          <div className="text-center relative z-10">
            <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl lg:rounded-3xl flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6 shadow-2xl">
              <Star className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2 sm:mb-3 lg:mb-4">
              Welcome to InsureTrack
            </h3>
            <p className="text-gray-600 mb-4 sm:mb-6 lg:mb-8 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed">
              Start your journey with our comprehensive insurance policy management system. 
              Track renewals, manage premiums, and stay connected with your policyholders.
            </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openPolicyForm'))}
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl lg:rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-sm sm:text-base lg:text-lg flex items-center gap-1 sm:gap-2 lg:gap-3 mx-auto"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 group-hover:scale-110 transition-transform duration-200 flex-shrink-0" />
              <span>Add Your First Policy</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;