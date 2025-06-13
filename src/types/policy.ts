export interface Policy {
  id: string;
  policyNumber: string;
  policyholderName: string;
  dateOfBirth: string;
  policyRenewalDate: string;
  renewalFrequency: 'monthly' | 'yearly';
  mobileNumber: string;
  policyPremiumAmount: number;
  insuranceCategory: 'life' | 'term' | 'car' | 'bike' | 'medical';
  createdAt: string;
  updatedAt: string;
}

export interface PolicyStats {
  totalPolicies: number;
  totalPremium: number;
  avgPremium: number;
  categoryDistribution: Record<string, number>;
  ageGroupDistribution: Record<string, number>;
  monthlyRenewals: Record<string, number>;
  renewalFrequencyDistribution: Record<string, number>;
  monthlyPremiumTotal: number;
  yearlyPremiumTotal: number;
}

export interface RenewalAlert {
  policy: Policy;
  daysUntilRenewal: number;
}