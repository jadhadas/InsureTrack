import React, { useState } from 'react';
import { Search, Filter, Edit, Trash2, Plus, Calendar, Phone, CreditCard, AlertCircle, X, Sparkles, Clock } from 'lucide-react';
import { Policy } from '../types/policy';
import { formatDate, calculateAge, getDaysUntilRenewal } from '../utils/dateUtils';

interface PolicyListProps {
  policies: Policy[];
  onEdit: (policy: Policy) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

const PolicyList: React.FC<PolicyListProps> = ({ policies, onEdit, onDelete, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [renewalFilter, setRenewalFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredAndSortedPolicies = policies
    .filter(policy => {
      const matchesSearch = 
        policy.policyholderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.mobileNumber.includes(searchTerm);
      
      const matchesCategory = categoryFilter === 'all' || policy.insuranceCategory === categoryFilter;
      const matchesRenewal = renewalFilter === 'all' || policy.renewalFrequency === renewalFilter;
      
      return matchesSearch && matchesCategory && matchesRenewal;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.policyholderName.localeCompare(b.policyholderName);
        case 'renewal':
          return new Date(a.policyRenewalDate).getTime() - new Date(b.policyRenewalDate).getTime();
        case 'premium':
          return b.policyPremiumAmount - a.policyPremiumAmount;
        case 'category':
          return a.insuranceCategory.localeCompare(b.insuranceCategory);
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'frequency':
          return a.renewalFrequency.localeCompare(b.renewalFrequency);
        default:
          return 0;
      }
    });

  const handleDelete = (policy: Policy) => {
    setDeleteConfirm(policy.id);
  };

  const confirmDelete = (policyId: string) => {
    onDelete(policyId);
    setDeleteConfirm(null);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      life: 'bg-blue-50 text-blue-700 border-blue-200/50',
      term: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
      car: 'bg-amber-50 text-amber-700 border-amber-200/50',
      bike: 'bg-orange-50 text-orange-700 border-orange-200/50',
      medical: 'bg-purple-50 text-purple-700 border-purple-200/50'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200/50';
  };

  const getRenewalFrequencyColor = (frequency: string) => {
    const colors = {
      monthly: 'bg-green-50 text-green-700 border-green-200/50',
      yearly: 'bg-indigo-50 text-indigo-700 border-indigo-200/50'
    };
    return colors[frequency as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200/50';
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      life: 'Life Insurance',
      term: 'Term Insurance',
      car: 'Car Insurance',
      bike: 'Bike Insurance',
      medical: 'Medical Insurance'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getRenewalStatus = (renewalDate: string) => {
    const days = getDaysUntilRenewal(renewalDate);
    if (days < 0) return { status: 'expired', color: 'text-red-600', text: 'Expired', bgColor: 'bg-red-50 border-red-200/50' };
    if (days === 0) return { status: 'today', color: 'text-red-600', text: 'Due Today', bgColor: 'bg-red-50 border-red-200/50' };
    if (days <= 7) return { status: 'urgent', color: 'text-orange-600', text: `${days} days left`, bgColor: 'bg-orange-50 border-orange-200/50' };
    if (days <= 30) return { status: 'soon', color: 'text-amber-600', text: `${days} days left`, bgColor: 'bg-amber-50 border-amber-200/50' };
    return { status: 'normal', color: 'text-emerald-600', text: `${days} days left`, bgColor: 'bg-emerald-50 border-emerald-200/50' };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
            Policy Management
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Manage and track all insurance policies</p>
        </div>
        <button
          onClick={onAdd}
          className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
        >
          <Plus className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
          Add New Policy
        </button>
      </div>

      {/* Enhanced Filters and Search */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Enhanced Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name, policy number, or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-4 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 focus:bg-white shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Enhanced Category Filter */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-gray-50/50 focus:bg-white transition-all duration-200 cursor-pointer shadow-sm"
            >
              <option value="all">All Categories</option>
              <option value="life">Life Insurance</option>
              <option value="term">Term Insurance</option>
              <option value="car">Car Insurance</option>
              <option value="bike">Bike Insurance</option>
              <option value="medical">Medical Insurance</option>
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Renewal Frequency Filter */}
          <div className="relative">
            <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
            <select
              value={renewalFilter}
              onChange={(e) => setRenewalFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-gray-50/50 focus:bg-white transition-all duration-200 cursor-pointer shadow-sm"
            >
              <option value="all">All Renewals</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Enhanced Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-4 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-gray-50/50 focus:bg-white transition-all duration-200 cursor-pointer shadow-sm"
            >
              <option value="name">Sort by Name</option>
              <option value="renewal">Sort by Renewal Date</option>
              <option value="premium">Sort by Premium</option>
              <option value="category">Sort by Category</option>
              <option value="frequency">Sort by Frequency</option>
              <option value="recent">Sort by Recently Added</option>
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Results Summary */}
      <div className="flex justify-between items-center text-sm text-gray-600 px-2">
        <span className="font-semibold">Showing {filteredAndSortedPolicies.length} of {policies.length} policies</span>
        <div className="flex gap-2">
          {searchTerm && (
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold border border-blue-200/50">
              Search: "{searchTerm}"
            </span>
          )}
          {renewalFilter !== 'all' && (
            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-200/50">
              {renewalFilter === 'monthly' ? 'Monthly' : 'Yearly'} Renewals
            </span>
          )}
        </div>
      </div>

      {/* Enhanced Policy Cards */}
      {filteredAndSortedPolicies.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm p-12 rounded-3xl shadow-xl text-center border border-white/20">
          <div className="text-gray-400 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Search className="h-10 w-10" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No policies found</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg leading-relaxed">
            {policies.length === 0 
              ? "Get started by adding your first policy to begin managing your insurance portfolio"
              : "Try adjusting your search or filter criteria to find the policies you're looking for"
            }
          </p>
          {policies.length === 0 && (
            <button
              onClick={onAdd}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              Add Your First Policy
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedPolicies.map((policy) => {
            const renewalStatus = getRenewalStatus(policy.policyRenewalDate);
            return (
              <div key={policy.id} className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 overflow-hidden hover:scale-[1.02]">
                {/* Enhanced Renewal Status Bar */}
                {renewalStatus.status !== 'normal' && (
                  <div className={`px-6 py-3 text-sm font-semibold flex items-center gap-3 ${renewalStatus.bgColor} border-b border-white/20`}>
                    <AlertCircle className="h-4 w-4" />
                    <span className={renewalStatus.color}>
                      Renewal {renewalStatus.text}
                    </span>
                  </div>
                )}
                
                <div className="p-6">
                  {/* Enhanced Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-blue-800 transition-colors duration-200">
                        {policy.policyholderName}
                      </h3>
                      <p className="text-sm text-gray-600 font-mono bg-gray-50 px-3 py-2 rounded-xl inline-block border border-gray-200/50">
                        {policy.policyNumber}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button
                        onClick={() => onEdit(policy)}
                        className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all duration-200 transform hover:scale-110 shadow-sm"
                        title="Edit Policy"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(policy)}
                        className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-200 transform hover:scale-110 shadow-sm"
                        title="Delete Policy"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Enhanced Category and Frequency Badges */}
                  <div className="mb-6 flex flex-wrap gap-2">
                    <span className={`inline-block px-4 py-2 text-sm font-semibold rounded-2xl border ${getCategoryColor(policy.insuranceCategory)} shadow-sm`}>
                      {getCategoryLabel(policy.insuranceCategory)}
                    </span>
                    <span className={`inline-block px-4 py-2 text-sm font-semibold rounded-2xl border ${getRenewalFrequencyColor(policy.renewalFrequency)} shadow-sm`}>
                      {policy.renewalFrequency === 'monthly' ? 'Monthly' : 'Yearly'} Renewal
                    </span>
                  </div>

                  {/* Enhanced Policy Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm p-3 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                      <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-500 text-xs block font-medium">Next Renewal</span>
                        <span className="font-bold text-gray-900">{formatDate(policy.policyRenewalDate)}</span>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-xl border ${renewalStatus.bgColor} ${renewalStatus.color}`}>
                        {renewalStatus.text}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm p-3 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                      <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Phone className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-500 text-xs block font-medium">Mobile Number</span>
                        <span className="font-bold text-gray-900">{policy.mobileNumber}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm p-3 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                      <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <CreditCard className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-500 text-xs block font-medium">
                          {policy.renewalFrequency === 'monthly' ? 'Monthly' : 'Annual'} Premium
                        </span>
                        <span className="font-bold text-purple-600 text-lg">{formatCurrency(policy.policyPremiumAmount)}</span>
                        {policy.renewalFrequency === 'monthly' && (
                          <span className="text-xs text-gray-500 block">
                            Annual: {formatCurrency(policy.policyPremiumAmount * 12)}
                          </span>
                        )}
                        {policy.renewalFrequency === 'yearly' && (
                          <span className="text-xs text-gray-500 block">
                            Monthly: {formatCurrency(policy.policyPremiumAmount / 12)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Footer */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                    <span className="bg-gray-50 px-3 py-2 rounded-xl font-medium border border-gray-200/50">
                      Age: {calculateAge(policy.dateOfBirth)} years
                    </span>
                    <span className="bg-gray-50 px-3 py-2 rounded-xl font-medium border border-gray-200/50">
                      Added: {formatDate(policy.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enhanced Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all duration-300 scale-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center shadow-lg">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Confirm Deletion</h3>
                <p className="text-sm text-gray-600 mt-1">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Are you sure you want to delete this policy? All associated data will be permanently removed from your system.
            </p>
            <div className="flex gap-4">
              <button
                onClick={cancelDelete}
                className="flex-1 px-6 py-4 border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-200 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deleteConfirm)}
                className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                Delete Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyList;