import { Policy } from '../types/policy';
import { sendSMS, getSMSTemplate, formatPhoneNumber, loadSMSConfig } from './smsService';
import { calculateAge, formatDate } from './dateUtils';

// Send welcome SMS when policy is added
export const sendPolicyAddedSMS = async (policy: Policy): Promise<boolean> => {
  const config = loadSMSConfig();
  if (!config || !config.enabled) return false;

  const categoryLabels = {
    life: 'Life',
    term: 'Term',
    car: 'Car',
    bike: 'Bike',
    medical: 'Medical'
  };

  const message = getSMSTemplate('policy_added', {
    name: policy.policyholderName,
    category: categoryLabels[policy.insuranceCategory],
    policyNumber: policy.policyNumber,
    premium: policy.policyPremiumAmount,
    renewalDate: formatDate(policy.policyRenewalDate)
  });

  return await sendSMS({
    to: formatPhoneNumber(policy.mobileNumber),
    message,
    type: 'policy_added'
  });
};

// Send birthday SMS
export const sendBirthdaySMS = async (policy: Policy): Promise<boolean> => {
  const config = loadSMSConfig();
  if (!config || !config.enabled) return false;

  const message = getSMSTemplate('birthday', {
    name: policy.policyholderName,
    age: calculateAge(policy.dateOfBirth)
  });

  return await sendSMS({
    to: formatPhoneNumber(policy.mobileNumber),
    message,
    type: 'birthday'
  });
};

// Send renewal reminder SMS
export const sendRenewalReminderSMS = async (policy: Policy, daysLeft: number): Promise<boolean> => {
  const config = loadSMSConfig();
  if (!config || !config.enabled) return false;

  const categoryLabels = {
    life: 'Life',
    term: 'Term',
    car: 'Car',
    bike: 'Bike',
    medical: 'Medical'
  };

  const message = getSMSTemplate('renewal_reminder', {
    name: policy.policyholderName,
    category: categoryLabels[policy.insuranceCategory],
    policyNumber: policy.policyNumber,
    premium: policy.policyPremiumAmount,
    renewalDate: formatDate(policy.policyRenewalDate),
    daysLeft
  });

  return await sendSMS({
    to: formatPhoneNumber(policy.mobileNumber),
    message,
    type: 'renewal_reminder'
  });
};

// Check and send birthday SMS for today's birthdays
export const checkAndSendBirthdaySMS = async (policies: Policy[]): Promise<void> => {
  const today = new Date();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  const birthdayPolicies = policies.filter(policy => {
    const birthDate = new Date(policy.dateOfBirth);
    return birthDate.getMonth() === todayMonth && birthDate.getDate() === todayDate;
  });

  for (const policy of birthdayPolicies) {
    try {
      await sendBirthdaySMS(policy);
      console.log(`Birthday SMS sent to ${policy.policyholderName}`);
    } catch (error) {
      console.error(`Failed to send birthday SMS to ${policy.policyholderName}:`, error);
    }
  }
};

// Check and send renewal reminder SMS
export const checkAndSendRenewalReminders = async (policies: Policy[]): Promise<void> => {
  const today = new Date();
  
  for (const policy of policies) {
    const renewalDate = new Date(policy.policyRenewalDate);
    const daysUntilRenewal = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Send reminders at 7, 3, and 1 day(s) before renewal
    if ([7, 3, 1].includes(daysUntilRenewal)) {
      try {
        await sendRenewalReminderSMS(policy, daysUntilRenewal);
        console.log(`Renewal reminder SMS sent to ${policy.policyholderName} (${daysUntilRenewal} days left)`);
      } catch (error) {
        console.error(`Failed to send renewal reminder SMS to ${policy.policyholderName}:`, error);
      }
    }
  }
};

// Initialize daily SMS checks
export const initializeSMSScheduler = (policies: Policy[]): void => {
  // Check for birthdays and renewals immediately
  checkAndSendBirthdaySMS(policies);
  checkAndSendRenewalReminders(policies);

  // Set up daily checks (in a real app, you'd use a proper scheduler)
  const checkInterval = 24 * 60 * 60 * 1000; // 24 hours
  
  setInterval(() => {
    checkAndSendBirthdaySMS(policies);
    checkAndSendRenewalReminders(policies);
  }, checkInterval);
};