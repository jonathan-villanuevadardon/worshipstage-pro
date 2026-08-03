import React from 'react';
import { Link } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications.js';
import NotificationBadge from './NotificationBadge.jsx';
import { Calendar, MessageSquare, Edit3, UserCheck, Bell, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationCenter() {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const getIcon = (type) => {
    switch (type) {
      case 'service_assignment': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'chat_message': return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'service_change': return <Edit3 className="w-4 h-4 text-yellow-500" />;
      case 'availability_change': return <UserCheck className="w-4 h-4 text-purple-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div>
          <NotificationBadge />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h4 className="font-semibold">Notifications</h4>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={markAllAsRead}>
              Mark all read
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
              <Link to="/notifications">View all</Link>
            </Button>
          </div>
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No notifications
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.slice(0, 10).map((n) => (
                <div key={n.id} className={`flex items-start gap-3 p-4 border-b border-border hover:bg-muted/50 transition-colors ${n.read ? 'opacity-70' : 'bg-primary/5'}`}>
                  <div className="mt-1">{getIcon(n.type)}</div>
                  <div className="flex-1 space-y-1" onClick={() => markAsRead(n.id)}>
                    <p className="text-sm font-medium leading-none">{n.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(n.created), { addSuffix: true })}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity" onClick={() => deleteNotification(n.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}