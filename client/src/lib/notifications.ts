export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
}

export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.checkPermission();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private checkPermission(): void {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async showNotification(payload: NotificationPayload): Promise<void> {
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    try {
      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/favicon.ico',
        badge: payload.badge || '/favicon.ico',
        data: payload.data,
        requireInteraction: false,
        silent: false
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Handle clicks
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Navigate based on notification data
        if (payload.data?.route) {
          window.location.href = payload.data.route;
        }
      };

    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  showRewardNotification(amount: number, co2Saved: number): void {
    this.showNotification({
      title: '🎉 Reward Earned!',
      body: `You earned ₹${amount} for saving ${co2Saved}kg of CO2!`,
      icon: '/favicon.ico',
      data: { route: '/wallet' }
    });
  }

  showAchievementNotification(achievement: string): void {
    this.showNotification({
      title: '🏆 Achievement Unlocked!',
      body: `Congratulations! You earned: ${achievement}`,
      icon: '/favicon.ico',
      data: { route: '/wallet' }
    });
  }

  showUploadReminder(): void {
    this.showNotification({
      title: '📸 Time for an Update',
      body: 'Upload your latest odometer reading to earn rewards!',
      icon: '/favicon.ico',
      data: { route: '/upload' }
    });
  }

  showMilestoneNotification(milestone: string, value: number): void {
    this.showNotification({
      title: `🌟 ${milestone} Milestone!`,
      body: `Amazing! You've reached ${value} km of eco-friendly driving!`,
      icon: '/favicon.ico',
      data: { route: '/wallet' }
    });
  }
}

export const notificationService = NotificationService.getInstance();