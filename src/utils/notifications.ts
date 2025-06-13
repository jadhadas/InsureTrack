export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const showNotification = (title: string, options?: NotificationOptions): void => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/vite.svg',
      badge: '/vite.svg',
      ...options
    });
  }
};

export const checkRenewalNotifications = (policies: any[]): void => {
  policies.forEach(policy => {
    const daysUntil = Math.ceil((new Date(policy.policyRenewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 7 && daysUntil > 0) {
      showNotification(
        'Policy Renewal Reminder',
        {
          body: `${policy.policyholderName}'s ${policy.insuranceCategory} insurance policy (${policy.policyNumber}) expires in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`,
          tag: policy.id,
          requireInteraction: true
        }
      );
    }
  });
};