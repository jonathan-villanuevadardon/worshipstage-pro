import React from 'react';
import { useUnreadCount } from '@/hooks/useUnreadCount.js';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotificationBadge({ onClick }) {
  const { unreadCount } = useUnreadCount();

  return (
    <Button variant="ghost" size="icon" className="text-muted-foreground relative" onClick={onClick}>
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-destructive text-[10px] text-destructive-foreground font-bold flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Button>
  );
}