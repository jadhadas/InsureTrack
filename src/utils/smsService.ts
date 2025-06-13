// SMS Service Configuration and Functions
export interface SMSConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  enabled: boolean;
}

export interface SMSMessage {
  to: string;
  message: string;
  type: 'policy_added' | 'birthday' | 'renewal_reminder';
}

// Store SMS configuration in localStorage
const SMS_CONFIG_KEY = 'sms_config';

export const saveSMSConfig = (config: SMSConfig): void => {
  try {
    localStorage.setItem(SMS_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving SMS config:', error);
  }
};

export const loadSMSConfig = (): SMSConfig | null => {
  try {
    const data = localStorage.getItem(SMS_CONFIG_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading SMS config:', error);
    return null;
  }
};

// SMS Templates
export const getSMSTemplate = (type: string, data: any): string => {
  const templates = {
    policy_added: `🎉 Welcome to InsureTrack! Your ${data.category} insurance policy (${data.policyNumber}) has been successfully added. Premium: ₹${data.premium.toLocaleString()}. Renewal date: ${data.renewalDate}. Thank you for choosing us!`,
    
    birthday: `🎂 Happy Birthday ${data.name}! 🎉 Wishing you a wonderful year ahead. Don't forget to review your insurance policies and ensure they meet your current needs. Have a great day! - InsureTrack Team`,
    
    renewal_reminder: `⚠️ RENEWAL REMINDER: Your ${data.category} insurance policy (${data.policyNumber}) expires in ${data.daysLeft} day${data.daysLeft > 1 ? 's' : ''} on ${data.renewalDate}. Premium: ₹${data.premium.toLocaleString()}. Please renew to avoid coverage gaps. - InsureTrack`
  };
  
  return templates[type as keyof typeof templates] || 'Insurance notification from InsureTrack';
};

// Mock SMS sending function (replace with actual Twilio integration)
export const sendSMS = async (message: SMSMessage): Promise<boolean> => {
  const config = loadSMSConfig();
  
  if (!config || !config.enabled) {
    console.log('SMS service not configured or disabled');
    return false;
  }

  try {
    // In a real implementation, you would use Twilio SDK here
    // For demo purposes, we'll simulate the API call
    console.log('Sending SMS:', {
      to: message.to,
      message: message.message,
      type: message.type
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo, we'll always return success
    // In production, you would handle actual Twilio API responses
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};

// Batch SMS sending
export const sendBatchSMS = async (messages: SMSMessage[]): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  for (const message of messages) {
    const result = await sendSMS(message);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
};

// Format phone number for SMS
export const formatPhoneNumber = (number: string): string => {
  // Remove all non-digits
  const cleaned = number.replace(/\D/g, '');
  
  // Add country code if not present (assuming India +91)
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  
  // If already has country code
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }
  
  return `+91${cleaned.slice(-10)}`;
};