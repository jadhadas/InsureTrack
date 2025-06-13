import React from 'react';
import { AlertCircle, Phone, Calendar, CreditCard, FileText, Clock } from 'lucide-react';
import { RenewalAlert } from '../types/policy';
import { formatDate } from '../utils/dateUtils';

interface RenewalAlertsProps {
  alerts: RenewalAlert[];
}

const RenewalAlerts: React.FC<RenewalAlertsProps> = ({ alerts }) => {
  if (alerts.length === 0) {
    return null;
  }

  const getPriorityColor = (days: number) => {
    if (days <= 1) return 'border-red-200 bg-gradient-to-r from-red-50 to-red-100';
    if (days <= 3) return 'border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100';
    return 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-yellow-100';
  };

  const getPriorityIcon = (days: number) => {
    if (days <= 1) return 'text-red-600';
    if (days <= 3) return 'text-orange-600';
    return 'text-yellow-600';
  };

  const getPriorityBadge = (days: number) => {
    if (days <= 1) return 'bg-red-100 text-red-800 border-red-200';
    if (days <= 3) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div className="px-4 sm:px-8 py-4 sm:py-6 bg-gradient-to-r from-red-500 via-red-600 to-orange-500">
        <div className="flex items-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
            <AlertCircle className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg sm:text-2xl font-bold text-white">Renewal Alerts</h2>
            <p className="text-red-100 text-xs sm:text-sm">Policies requiring immediate attention</p>
          </div>
          <div className="bg-white bg-opacity-20 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-xl text-xs sm:text-sm font-medium border border-white border-opacity-20">
            {alerts.length} {alerts.length === 1 ? 'Alert' : 'Alerts'}
          </div>
        </div>
      </div>
      
      <div className="p-4 sm:p-8">
        <div className="space-y-4 sm:space-y-6">
          {alerts.map(({ policy, daysUntilRenewal }) => (
            <div
              key={policy.id}
              className={`border-l-4 p-4 sm:p-6 rounded-xl ${getPriorityColor(daysUntilRenewal)} hover:shadow-lg transition-all duration-200`}
            >
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${getPriorityIcon(daysUntilRenewal) === 'text-red-600' ? 'bg-red-100' : getPriorityIcon(daysUntilRenewal) === 'text-orange-600' ? 'bg-orange-100' : 'bg-yellow-100'}`}>
                      <Clock className={`h-4 w-4 sm:h-5 sm:w-5 ${getPriorityIcon(daysUntilRenewal)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">
                        {policy.policyholderName}
                      </h3>
                      <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(daysUntilRenewal)}`}>
                        {policy.insuranceCategory.charAt(0).toUpperCase() + policy.insuranceCategory.slice(1)} Insurance
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white bg-opacity-50 rounded-lg">
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-gray-500 text-xs block">Policy Number</span>
                        <span className="font-medium text-gray-900 truncate block">{policy.policyNumber}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white bg-opacity-50 rounded-lg">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-gray-500 text-xs block">Mobile</span>
                        <span className="font-medium text-gray-900 truncate block">{policy.mobileNumber}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white bg-opacity-50 rounded-lg">
                      <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-gray-500 text-xs block">Premium</span>
                        <span className="font-medium text-gray-900 truncate block">{formatCurrency(policy.policyPremiumAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white bg-opacity-50 p-3 sm:p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Calendar className={`h-4 w-4 sm:h-5 sm:w-5 ${getPriorityIcon(daysUntilRenewal)}`} />
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(policy.policyRenewalDate)}
                    </span>
                  </div>
                  <span className={`text-sm sm:text-lg font-bold ${getPriorityIcon(daysUntilRenewal)} px-3 py-1 rounded-lg ${getPriorityBadge(daysUntilRenewal)}`}>
                    {daysUntilRenewal === 0 ? 'Due Today!' :
                     daysUntilRenewal === 1 ? 'Due Tomorrow!' :
                     `${daysUntilRenewal} days left`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RenewalAlerts;