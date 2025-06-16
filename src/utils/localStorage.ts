import { Policy } from '../types/policy';

const STORAGE_KEY = 'insurance_policies';

export const saveToLocalStorage = (policies: Policy[]): void => {
  try {
    const data = JSON.stringify(policies);
    localStorage.setItem(STORAGE_KEY, data);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    // Try to clear some space and retry
    try {
      localStorage.clear();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(policies));
    } catch (retryError) {
      console.error('Failed to save even after clearing localStorage:', retryError);
      throw new Error('Failed to save data. Storage may be full.');
    }
  }
};

export const loadFromLocalStorage = (): Policy[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      console.warn('Invalid data format in localStorage, returning empty array');
      return [];
    }
    
    // Validate each policy object
    const validPolicies = parsed.filter(policy => {
      return policy && 
             typeof policy === 'object' && 
             policy.id && 
             policy.policyNumber && 
             policy.policyholderName;
    });
    
    if (validPolicies.length !== parsed.length) {
      console.warn(`Filtered out ${parsed.length - validPolicies.length} invalid policies`);
      // Save the cleaned data back
      saveToLocalStorage(validPolicies);
    }
    
    return validPolicies;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    // Try to recover by clearing corrupted data
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (clearError) {
      console.error('Failed to clear corrupted localStorage:', clearError);
    }
    return [];
  }
};

export const generatePolicyNumber = (): string => {
  try {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `POL${timestamp}${random}`;
  } catch (error) {
    console.error('Error generating policy number:', error);
    return `POL${Date.now()}`;
  }
};

export const exportToCSV = (policies: Policy[]): void => {
  try {
    if (policies.length === 0) {
      throw new Error('No policies to export');
    }

    const headers = [
      'Policy Number',
      'Policyholder Name',
      'Date of Birth',
      'Policy Renewal Date',
      'Renewal Frequency',
      'Mobile Number',
      'Premium Amount',
      'Insurance Category'
    ];

    const csvContent = [
      headers.join(','),
      ...policies.map(policy => [
        policy.policyNumber,
        `"${policy.policyholderName}"`,
        policy.dateOfBirth,
        policy.policyRenewalDate,
        policy.renewalFrequency || 'yearly',
        policy.mobileNumber,
        policy.policyPremiumAmount,
        policy.insuranceCategory.charAt(0).toUpperCase() + policy.insuranceCategory.slice(1)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `insurance_policies_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw error;
  }
};

// Utility function to check localStorage availability and space
export const checkStorageHealth = (): { available: boolean; spaceUsed: number; totalSpace: number } => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    
    // Estimate storage usage
    let spaceUsed = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        spaceUsed += localStorage[key].length + key.length;
      }
    }
    
    return {
      available: true,
      spaceUsed,
      totalSpace: 5 * 1024 * 1024 // Typical 5MB limit
    };
  } catch (error) {
    return {
      available: false,
      spaceUsed: 0,
      totalSpace: 0
    };
  }
};