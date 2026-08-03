import { useNotifications } from './useNotifications.js';

export function useUnreadCount() {
  const { notifications, loading } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return { unreadCount, loading };
}