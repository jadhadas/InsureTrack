import { Policy } from '../types/policy';

const STORAGE_KEY = 'insurance_policies';

export const saveToLocalStorage = (policies: Policy[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(policies));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadFromLocalStorage = (): Policy[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return [];
  }
};

export const generatePolicyNumber = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `POL${timestamp}${random}`;
};

export const exportToCSV = (policies: Policy[]): void => {
  const headers = [
    'Policy Number',
    'Policyholder Name',
    'Date of Birth',
    'Policy Renewal Date',
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
      policy.mobileNumber,
      policy.policyPremiumAmount,
      policy.insuranceCategory.charAt(0).toUpperCase() + policy.insuranceCategory.slice(1)
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `insurance_policies_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};