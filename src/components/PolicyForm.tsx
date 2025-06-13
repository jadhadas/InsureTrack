import React, { useState, useEffect } from 'react';
import { X, Save, Plus, RefreshCw, Eye, EyeOff, Calendar } from 'lucide-react';
import { Policy } from '../types/policy';
import { generatePolicyNumber } from '../utils/localStorage';

interface PolicyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (policy: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>) => void;
  policy?: Policy;
  mode: 'create' | 'edit';
}

const PolicyForm: React.FC<PolicyFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  policy,
  mode
}) => {
  const [formData, setFormData] = useState({
    policyNumber: policy?.policyNumber || generatePolicyNumber(),
    policyholderName: policy?.policyholderName || '',
    dateOfBirth: policy?.dateOfBirth || '',
    policyRenewalDate: policy?.policyRenewalDate || '',
    renewalFrequency: policy?.renewalFrequency || 'yearly' as const,
    mobileNumber: policy?.mobileNumber || '',
    policyPremiumAmount: policy?.policyPremiumAmount || 0,
    insuranceCategory: policy?.insuranceCategory || 'life' as const
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPremiumDetails, setShowPremiumDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when policy changes or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        policyNumber: policy?.policyNumber || generatePolicyNumber(),
        policyholderName: policy?.policyholderName || '',
        dateOfBirth: policy?.dateOfBirth || '',
        policyRenewalDate: policy?.policyRenewalDate || '',
        renewalFrequency: policy?.renewalFrequency || 'yearly' as const,
        mobileNumber: policy?.mobileNumber || '',
        policyPremiumAmount: policy?.policyPremiumAmount || 0,
        insuranceCategory: policy?.insuranceCategory || 'life' as const
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, policy]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.policyNumber.trim()) {
      newErrors.policyNumber = 'Policy number is required';
    } else if (formData.policyNumber.length < 3) {
      newErrors.policyNumber = 'Policy number must be at least 3 characters';
    }

    if (!formData.policyholderName.trim()) {
      newErrors.policyholderName = 'Policyholder name is required';
    } else if (formData.policyholderName.length < 2) {
      newErrors.policyholderName = 'Name must be at least 2 characters';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18 || age > 100) {
        newErrors.dateOfBirth = 'Age must be between 18 and 100 years';
      }
    }

    if (!formData.policyRenewalDate) {
      newErrors.policyRenewalDate = 'Policy renewal date is required';
    } else {
      const renewalDate = new Date(formData.policyRenewalDate);
      const today = new Date();
      if (renewalDate < today) {
        newErrors.policyRenewalDate = 'Renewal date cannot be in the past';
      }
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else {
      const cleanNumber = formData.mobileNumber.replace(/\D/g, '');
      if (cleanNumber.length !== 10) {
        newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
      }
    }

    if (!formData.policyPremiumAmount || formData.policyPremiumAmount <= 0) {
      newErrors.policyPremiumAmount = 'Premium amount must be greater than 0';
    } else if (formData.policyPremiumAmount > 10000000) {
      newErrors.policyPremiumAmount = 'Premium amount seems too high';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Format mobile number
        const formattedData = {
          ...formData,
          mobileNumber: formData.mobileNumber.replace(/\D/g, ''),
          policyholderName: formData.policyholderName.trim(),
          policyNumber: formData.policyNumber.trim().toUpperCase()
        };
        
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        onSubmit(formattedData);
        onClose();
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    // Format mobile number as user types
    if (name === 'mobileNumber') {
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    }
    
    // Format policy number
    if (name === 'policyNumber') {
      processedValue = value.toUpperCase();
    }
    
    // Format name (capitalize first letter of each word)
    if (name === 'policyholderName') {
      processedValue = value.replace(/\b\w/g, l => l.toUpperCase());
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'policyPremiumAmount' ? parseFloat(value) || 0 : processedValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleGenerateNewPolicyNumber = () => {
    const newPolicyNumber = generatePolicyNumber();
    setFormData(prev => ({ ...prev, policyNumber: newPolicyNumber }));
    if (errors.policyNumber) {
      setErrors(prev => ({ ...prev, policyNumber: '' }));
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateAnnualizedPremium = () => {
    if (formData.renewalFrequency === 'monthly') {
      return formData.policyPremiumAmount * 12;
    }
    return formData.policyPremiumAmount;
  };

  const calculateMonthlyPremium = () => {
    if (formData.renewalFrequency === 'yearly') {
      return formData.policyPremiumAmount / 12;
    }
    return formData.policyPremiumAmount;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'Add New Policy' : 'Edit Policy'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {mode === 'create' ? 'Create a new insurance policy record' : 'Update policy information'}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Policy Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Policy Number *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="policyNumber"
                  value={formData.policyNumber}
                  onChange={handleChange}
                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                    errors.policyNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter policy number"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={handleGenerateNewPolicyNumber}
                  disabled={isSubmitting}
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-1 disabled:opacity-50"
                  title="Generate new policy number"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              {errors.policyNumber && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.policyNumber}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Enter a custom policy number or click refresh to generate one
              </p>
            </div>

            {/* Insurance Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Category *
              </label>
              <select
                name="insuranceCategory"
                value={formData.insuranceCategory}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              >
                <option value="life">Life Insurance</option>
                <option value="term">Term Insurance</option>
                <option value="car">Car Insurance</option>
                <option value="bike">Bike Insurance</option>
                <option value="medical">Medical Insurance</option>
              </select>
            </div>
          </div>

          {/* Policyholder Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Policyholder Name *
            </label>
            <input
              type="text"
              name="policyholderName"
              value={formData.policyholderName}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                errors.policyholderName ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter policyholder's full name"
            />
            {errors.policyholderName && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                {errors.policyholderName}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={isSubmitting}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  errors.dateOfBirth ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.dateOfBirth}
                </p>
              )}
            </div>

            {/* Renewal Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Renewal Frequency *
              </label>
              <select
                name="renewalFrequency"
                value={formData.renewalFrequency}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              >
                <option value="monthly">Monthly Renewal</option>
                <option value="yearly">Yearly Renewal</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Choose how often this policy needs to be renewed
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Policy Renewal Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Renewal Date *
              </label>
              <input
                type="date"
                name="policyRenewalDate"
                value={formData.policyRenewalDate}
                onChange={handleChange}
                disabled={isSubmitting}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  errors.policyRenewalDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.policyRenewalDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.policyRenewalDate}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Date when this policy needs to be renewed next
              </p>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number *
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  errors.mobileNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
              />
              {errors.mobileNumber && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.mobileNumber}
                </p>
              )}
              {formData.mobileNumber && formData.mobileNumber.length === 10 && (
                <p className="mt-1 text-xs text-green-600">✓ Valid mobile number</p>
              )}
            </div>
          </div>

          {/* Premium Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Premium Amount (₹) *
            </label>
            <div className="relative">
              <input
                type="number"
                name="policyPremiumAmount"
                value={formData.policyPremiumAmount}
                onChange={handleChange}
                disabled={isSubmitting}
                min="1"
                step="1"
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  errors.policyPremiumAmount ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter premium amount"
              />
              <button
                type="button"
                onClick={() => setShowPremiumDetails(!showPremiumDetails)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPremiumDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.policyPremiumAmount && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                {errors.policyPremiumAmount}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Enter the {formData.renewalFrequency} premium amount
            </p>
            
            {showPremiumDetails && formData.policyPremiumAmount > 0 && (
              <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <p className="text-blue-800 font-semibold text-sm">Premium Breakdown</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/60 p-3 rounded-lg">
                    <p className="text-gray-600 text-xs font-medium">Monthly Premium</p>
                    <p className="text-blue-700 font-bold">{formatCurrency(calculateMonthlyPremium())}</p>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg">
                    <p className="text-gray-600 text-xs font-medium">Annual Premium</p>
                    <p className="text-blue-700 font-bold">{formatCurrency(calculateAnnualizedPremium())}</p>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-blue-100/50 rounded-lg">
                  <p className="text-blue-700 text-xs">
                    <strong>Renewal:</strong> {formData.renewalFrequency === 'monthly' ? 'Every month' : 'Every year'} - 
                    {formatCurrency(formData.policyPremiumAmount)} per {formData.renewalFrequency === 'monthly' ? 'month' : 'year'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {mode === 'create' ? 'Adding...' : 'Updating...'}
                </>
              ) : (
                <>
                  {mode === 'create' ? <Plus className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {mode === 'create' ? 'Add Policy' : 'Update Policy'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PolicyForm;