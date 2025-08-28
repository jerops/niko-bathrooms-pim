export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number; // milliseconds
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastConfig {
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  maxToasts: number;
  defaultDuration: number;
}