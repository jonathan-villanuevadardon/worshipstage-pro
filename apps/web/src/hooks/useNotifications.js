import { useState, useEffect } from 'react';
import pb from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export function useNotifications() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const records = await pb.collection('notifications').getFullList({
        filter: `user_id = "${currentUser.id}"`,
        sort: '-created',
        $autoCancel: false
      });
      setNotifications(records);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (currentUser) {
      pb.collection('notifications').subscribe('*', function (e) {
        if (e.record.user_id === currentUser.id) {
          if (e.action === 'create') {
            setNotifications(prev => [e.record, ...prev]);
          } else if (e.action === 'update') {
            setNotifications(prev => prev.map(n => n.id === e.record.id ? e.record : n));
          } else if (e.action === 'delete') {
            setNotifications(prev => prev.filter(n => n.id !== e.record.id));
          }
        }
      });
    }

    return () => {
      pb.collection('notifications').unsubscribe('*');
    };
  }, [currentUser]);

  const markAsRead = async (id) => {
    try {
      await pb.collection('notifications').update(id, { read: true }, { $autoCancel: false });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(
      unread.map(n => pb.collection('notifications').update(n.id, { read: true }, { $autoCancel: false }))
    );
  };

  const deleteNotification = async (id) => {
    try {
      await pb.collection('notifications').delete(id, { $autoCancel: false });
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  return { notifications, loading, error, markAsRead, markAllAsRead, deleteNotification, refetch: fetchNotifications };
}