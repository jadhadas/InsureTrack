import React from 'react';
import { AlertCircle, Phone, Calendar, CreditCard, FileText } from 'lucide-react';
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
    if (days <= 1) return 'border-red-200 bg-red-50';
    if (days <= 3) return 'border-yellow-200 bg-yellow-50';
    return 'border-blue-200 bg-blue-50';
  };

  const getPriorityIcon = (days: number) => {
    if (days <= 1) return 'text-red-600';
    if (days <= 3) return 'text-yellow-600';
    return 'text-blue-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-red-500 to-orange-500">
        <div className="flex items-center">
          <AlertCircle className="h-6 w-6 text-white mr-2" />
          <h2 className="text-xl font-semibold text-white">Renewal Alerts</h2>
          <span className="ml-auto bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm">
            {alerts.length} {alerts.length === 1 ? 'Alert' : 'Alerts'}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {alerts.map(({ policy, daysUntilRenewal }) => (
            <div
              key={policy.id}
              className={`border-l-4 p-4 rounded-lg ${getPriorityColor(daysUntilRenewal)}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className={`h-5 w-5 ${getPriorityIcon(daysUntilRenewal)}`} />
                    <h3 className="font-semibold text-gray-900">
                      {policy.policyholderName}
                    </h3>
                    <span className="capitalize bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {policy.insuranceCategory}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{policy.policyNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{policy.mobileNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span>₹{policy.policyPremiumAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className={`h-4 w-4 ${getPriorityIcon(daysUntilRenewal)}`} />
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(policy.policyRenewalDate)}
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${
                    daysUntilRenewal <= 1 ? 'text-red-600' :
                    daysUntilRenewal <= 3 ? 'text-yellow-600' : 'text-blue-600'
                  }`}>
                    {daysUntilRenewal === 0 ? 'Due Today' :
                     daysUntilRenewal === 1 ? 'Due Tomorrow' :
                     `${daysUntilRenewal} days remaining`}
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