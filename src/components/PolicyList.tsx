import React, { useState } from 'react';
import { Search, Filter, Edit, Trash2, Plus, Calendar, Phone, CreditCard, AlertCircle } from 'lucide-react';
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
    if (days < 0) return { status: 'expired', color: 'text-red-600', text: 'Expired' };
    if (days === 0) return { status: 'today', color: 'text-red-600', text: 'Due Today' };
    if (days <= 7) return { status: 'urgent', color: 'text-orange-600', text: `${days} days left` };
    if (days <= 30) return { status: 'soon', color: 'text-yellow-600', text: `${days} days left` };
    return { status: 'normal', color: 'text-green-600', text: `${days} days left` };
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
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          Add New Policy
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name, policy number, or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-colors duration-200"
            >
              <option value="all">All Categories</option>
              <option value="life">Life Insurance</option>
              <option value="term">Term Insurance</option>
              <option value="car">Car Insurance</option>
              <option value="bike">Bike Insurance</option>
              <option value="medical">Medical Insurance</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-colors duration-200"
            >
              <option value="name">Sort by Name</option>
              <option value="renewal">Sort by Renewal Date</option>
              <option value="premium">Sort by Premium</option>
              <option value="category">Sort by Category</option>
              <option value="recent">Sort by Recently Added</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>Showing {filteredAndSortedPolicies.length} of {policies.length} policies</span>
        {searchTerm && (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
            Search: "{searchTerm}"
          </span>
        )}
      </div>

      {/* Policy Cards */}
      {filteredAndSortedPolicies.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-md text-center border border-gray-100">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No policies found</h3>
          <p className="text-gray-600 mb-6">
            {policies.length === 0 
              ? "Get started by adding your first policy"
              : "Try adjusting your search or filter criteria"
            }
          </p>
          {policies.length === 0 && (
            <button
              onClick={onAdd}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Add Your First Policy
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAndSortedPolicies.map((policy) => {
            const renewalStatus = getRenewalStatus(policy.policyRenewalDate);
            return (
              <div key={policy.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 overflow-hidden">
                {/* Renewal Status Bar */}
                {renewalStatus.status !== 'normal' && (
                  <div className={`px-4 py-2 text-xs font-medium flex items-center gap-2 ${
                    renewalStatus.status === 'expired' || renewalStatus.status === 'today' 
                      ? 'bg-red-50 text-red-700 border-b border-red-100' 
                      : renewalStatus.status === 'urgent'
                      ? 'bg-orange-50 text-orange-700 border-b border-orange-100'
                      : 'bg-yellow-50 text-yellow-700 border-b border-yellow-100'
                  }`}>
                    <AlertCircle className="h-3 w-3" />
                    Renewal {renewalStatus.text}
                  </div>
                )}
                
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{policy.policyholderName}</h3>
                      <p className="text-sm text-gray-600 font-mono">{policy.policyNumber}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => onEdit(policy)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title="Edit Policy"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(policy)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
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
                      <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <span className="text-gray-600">Renewal:</span>
                      <span className="font-medium">{formatDate(policy.policyRenewalDate)}</span>
                      <span className={`text-xs font-medium ${renewalStatus.color}`}>
                        ({renewalStatus.text})
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Phone className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <span>Mobile:</span>
                      <span className="font-medium">{policy.mobileNumber}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <CreditCard className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <span>Premium:</span>
                      <span className="font-medium text-green-600">{formatCurrency(policy.policyPremiumAmount)}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                    <span>Age: {calculateAge(policy.dateOfBirth)} years</span>
                    <span>Added: {formatDate(policy.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this policy? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyList;