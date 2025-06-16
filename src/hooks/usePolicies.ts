import { useState, useEffect } from 'react';
import { Policy, PolicyStats, RenewalAlert } from '../types/policy';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/localStorage';
import { calculateAge, getDaysUntilRenewal, getAgeGroup, isRenewalDueSoon } from '../utils/dateUtils';
import { sendPolicyAddedSMS, initializeSMSScheduler } from '../utils/smsNotifications';

export const usePolicies = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const loadedPolicies = loadFromLocalStorage();
      
      // Migrate existing policies to include renewalFrequency if missing
      const migratedPolicies = loadedPolicies.map(policy => ({
        ...policy,
        renewalFrequency: policy.renewalFrequency || 'yearly' as const
      }));
      
      if (migratedPolicies.length !== loadedPolicies.length || 
          migratedPolicies.some((p, i) => p.renewalFrequency !== loadedPolicies[i]?.renewalFrequency)) {
        saveToLocalStorage(migratedPolicies);
      }
      
      setPolicies(migratedPolicies);
      
      // Initialize SMS scheduler for birthday and renewal reminders
      if (migratedPolicies.length > 0) {
        initializeSMSScheduler(migratedPolicies);
      }
    } catch (error) {
      console.error('Error loading policies:', error);
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const savePolicies = (newPolicies: Policy[]) => {
    try {
      setPolicies(newPolicies);
      saveToLocalStorage(newPolicies);
    } catch (error) {
      console.error('Error saving policies:', error);
    }
  };

  const addPolicy = async (policy: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPolicy: Policy = {
        ...policy,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const updatedPolicies = [...policies, newPolicy];
      savePolicies(updatedPolicies);
      
      // Send welcome SMS
      try {
        const smsResult = await sendPolicyAddedSMS(newPolicy);
        if (smsResult) {
          console.log(`Welcome SMS sent to ${newPolicy.policyholderName}`);
        }
      } catch (error) {
        console.error('Failed to send welcome SMS:', error);
      }
    } catch (error) {
      console.error('Error adding policy:', error);
      throw error;
    }
  };

  const updatePolicy = (id: string, updates: Partial<Policy>) => {
    try {
      const updatedPolicies = policies.map(policy =>
        policy.id === id ? { ...policy, ...updates, updatedAt: new Date().toISOString() } : policy
      );
      savePolicies(updatedPolicies);
    } catch (error) {
      console.error('Error updating policy:', error);
    }
  };

  const deletePolicy = (id: string) => {
    try {
      const filteredPolicies = policies.filter(policy => policy.id !== id);
      savePolicies(filteredPolicies);
    } catch (error) {
      console.error('Error deleting policy:', error);
    }
  };

  const getStats = (): PolicyStats => {
    try {
      const totalPolicies = policies.length;
      const totalPremium = policies.reduce((sum, policy) => sum + (policy.policyPremiumAmount || 0), 0);
      const avgPremium = totalPolicies > 0 ? totalPremium / totalPolicies : 0;

      const categoryDistribution = policies.reduce((acc, policy) => {
        const category = policy.insuranceCategory || 'unknown';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const ageGroupDistribution = policies.reduce((acc, policy) => {
        try {
          const age = calculateAge(policy.dateOfBirth);
          const ageGroup = getAgeGroup(age);
          acc[ageGroup] = (acc[ageGroup] || 0) + 1;
        } catch (error) {
          console.error('Error calculating age for policy:', policy.id, error);
        }
        return acc;
      }, {} as Record<string, number>);

      const monthlyRenewals = policies.reduce((acc, policy) => {
        try {
          const month = new Date(policy.policyRenewalDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          acc[month] = (acc[month] || 0) + 1;
        } catch (error) {
          console.error('Error processing renewal date for policy:', policy.id, error);
        }
        return acc;
      }, {} as Record<string, number>);

      const renewalFrequencyDistribution = policies.reduce((acc, policy) => {
        const frequency = policy.renewalFrequency || 'yearly';
        acc[frequency] = (acc[frequency] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate monthly and yearly premium totals
      const monthlyPremiumTotal = policies.reduce((sum, policy) => {
        const premium = policy.policyPremiumAmount || 0;
        if (policy.renewalFrequency === 'monthly') {
          return sum + premium;
        } else {
          return sum + (premium / 12);
        }
      }, 0);

      const yearlyPremiumTotal = policies.reduce((sum, policy) => {
        const premium = policy.policyPremiumAmount || 0;
        if (policy.renewalFrequency === 'yearly') {
          return sum + premium;
        } else {
          return sum + (premium * 12);
        }
      }, 0);

      return {
        totalPolicies,
        totalPremium,
        avgPremium,
        categoryDistribution,
        ageGroupDistribution,
        monthlyRenewals,
        renewalFrequencyDistribution,
        monthlyPremiumTotal,
        yearlyPremiumTotal
      };
    } catch (error) {
      console.error('Error calculating stats:', error);
      return {
        totalPolicies: 0,
        totalPremium: 0,
        avgPremium: 0,
        categoryDistribution: {},
        ageGroupDistribution: {},
        monthlyRenewals: {},
        renewalFrequencyDistribution: {},
        monthlyPremiumTotal: 0,
        yearlyPremiumTotal: 0
      };
    }
  };

  const getRenewalAlerts = (): RenewalAlert[] => {
    try {
      return policies
        .filter(policy => {
          try {
            return isRenewalDueSoon(policy.policyRenewalDate);
          } catch (error) {
            console.error('Error checking renewal for policy:', policy.id, error);
            return false;
          }
        })
        .map(policy => ({
          policy,
          daysUntilRenewal: getDaysUntilRenewal(policy.policyRenewalDate)
        }))
        .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal);
    } catch (error) {
      console.error('Error getting renewal alerts:', error);
      return [];
    }
  };

  return {
    policies,
    loading,
    addPolicy,
    updatePolicy,
    deletePolicy,
    getStats,
    getRenewalAlerts
  };
};