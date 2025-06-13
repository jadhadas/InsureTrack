import React, { useState } from 'react';
import { Search, Filter, Edit, Trash2, Plus, Calendar, Phone, CreditCard, AlertCircle, X } from 'lucide-react';
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
  const [sortBy, setSortBy] = useState('name');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredAndSortedPolicies = policies
    .filter(policy => {
      const matchesSearch = 
        policy.policyholderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.mobileNumber.includes(searchTerm);
      
      const matchesCategory = categoryFilter === 'all' || policy.insuranceCategory === categoryFilter;
      
      return matchesSearch && matchesCategory;
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
      life: 'bg-blue-100 text-blue-800 border-blue-200',
      term: 'bg-green-100 text-green-800 border-green-200',
      car: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      bike: 'bg-orange-100 text-orange-800 border-orange-200',
      medical: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
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
    if (days < 0) return { status: 'expired', color: 'text-red-600', text: 'Expired', bgColor: 'bg-red-50' };
    if (days === 0) return { status: 'today', color: 'text-red-600', text: 'Due Today', bgColor: 'bg-red-50' };
    if (days <= 7) return { status: 'urgent', color: 'text-orange-600', text: `${days} days left`, bgColor: 'bg-orange-50' };
    if (days <= 30) return { status: 'soon', color: 'text-yellow-600', text: `${days} days left`, bgColor: 'bg-yellow-50' };
    return { status: 'normal', color: 'text-green-600', text: `${days} days left`, bgColor: 'bg-green-50' };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Policy Management</h1>
          <p className="text-gray-600 mt-1">Manage all insurance policies</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
        >
          <Plus className="h-5 w-5" />
          Add New Policy
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name, policy number, or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-gray-50 focus:bg-white transition-all duration-200 cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="life">Life Insurance</option>
              <option value="term">Term Insurance</option>
              <option value="car">Car Insurance</option>
              <option value="bike">Bike Insurance</option>
              <option value="medical">Medical Insurance</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-gray-50 focus:bg-white transition-all duration-200 cursor-pointer"
            >
              <option value="name">Sort by Name</option>
              <option value="renewal">Sort by Renewal Date</option>
              <option value="premium">Sort by Premium</option>
              <option value="category">Sort by Category</option>
              <option value="recent">Sort by Recently Added</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center text-sm text-gray-600 px-1">
        <span className="font-medium">Showing {filteredAndSortedPolicies.length} of {policies.length} policies</span>
        {searchTerm && (
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
            Search: "{searchTerm}"
          </span>
        )}
      </div>

      {/* Policy Cards */}
      {filteredAndSortedPolicies.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-lg text-center border border-gray-100">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No policies found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {policies.length === 0 
              ? "Get started by adding your first policy to begin managing your insurance portfolio"
              : "Try adjusting your search or filter criteria to find the policies you're looking for"
            }
          </p>
          {policies.length === 0 && (
            <button
              onClick={onAdd}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
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
              <div key={policy.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group hover:scale-[1.02]">
                {/* Renewal Status Bar */}
                {renewalStatus.status !== 'normal' && (
                  <div className={`px-4 py-2 text-xs font-medium flex items-center gap-2 ${renewalStatus.bgColor} border-b`}>
                    <AlertCircle className="h-3 w-3" />
                    <span className={renewalStatus.color}>
                      Renewal {renewalStatus.text}
                    </span>
                  </div>
                )}
                
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{policy.policyholderName}</h3>
                      <p className="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded-md inline-block">{policy.policyNumber}</p>
                    </div>
                    <div className="flex gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => onEdit(policy)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                        title="Edit Policy"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(policy)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                        title="Delete Policy"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getCategoryColor(policy.insuranceCategory)}`}>
                      {getCategoryLabel(policy.insuranceCategory)}
                    </span>
                  </div>

                  {/* Policy Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-600 text-xs block">Renewal Date</span>
                        <span className="font-medium text-gray-900">{formatDate(policy.policyRenewalDate)}</span>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${renewalStatus.bgColor} ${renewalStatus.color}`}>
                        {renewalStatus.text}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-600 text-xs block">Mobile Number</span>
                        <span className="font-medium text-gray-900">{policy.mobileNumber}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CreditCard className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-600 text-xs block">Premium Amount</span>
                        <span className="font-semibold text-purple-600 text-lg">{formatCurrency(policy.policyPremiumAmount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                    <span className="bg-gray-50 px-2 py-1 rounded-md">Age: {calculateAge(policy.dateOfBirth)} years</span>
                    <span className="bg-gray-50 px-2 py-1 rounded-md">Added: {formatDate(policy.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this policy? All associated data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deleteConfirm)}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 font-medium"
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