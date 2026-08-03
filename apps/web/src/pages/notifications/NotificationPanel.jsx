import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNotifications } from '@/hooks/useNotifications.js';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, MessageSquare, Edit3, UserCheck, Bell, Trash2, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function NotificationPanel() {
  const { notifications, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState('all');

  const getIcon = (type) => {
    switch (type) {
      case 'service_assignment': return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'chat_message': return <MessageSquare className="w-5 h-5 text-green-500" />;
      case 'service_change': return <Edit3 className="w-5 h-5 text-yellow-500" />;
      case 'availability_change': return <UserCheck className="w-5 h-5 text-purple-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredNotifications = notifications.filter(n => filter === 'all' || n.type === filter);

  return (
    <>
      <Helmet>
        <title>Notifications - WorshipStage Pro</title>
      </Helmet>
      
      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground mt-1">Stay updated on your schedule and team</p>
          </div>
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark all read
          </Button>
        </div>

        <Tabs defaultValue="all" value={filter} onValueChange={setFilter}>
          <TabsList className="mb-4 flex-wrap h-auto justify-start">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="service_assignment">Assignments</TabsTrigger>
            <TabsTrigger value="chat_message">Messages</TabsTrigger>
            <TabsTrigger value="service_change">Service Changes</TabsTrigger>
            <TabsTrigger value="availability_change">Availability</TabsTrigger>
          </TabsList>

          <Card className="overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading notifications...</div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-muted-foreground">
                <Bell className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-lg font-medium">All caught up!</p>
                <p className="text-sm">You don't have any notifications right now.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredNotifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`flex items-start gap-4 p-6 transition-colors hover:bg-muted/30 ${n.read ? 'bg-background' : 'bg-primary/5'}`}
                  >
                    <div className="mt-1 p-2 rounded-full bg-background border border-border shadow-sm">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 cursor-pointer" onClick={() => !n.read && markAsRead(n.id)}>
                      <h4 className={`text-base font-semibold ${n.read ? 'text-foreground/80' : 'text-foreground'}`}>{n.title}</h4>
                      <p className={`mt-1 text-sm ${n.read ? 'text-muted-foreground' : 'text-foreground/90'}`}>{n.message}</p>
                      <p className="mt-2 text-xs text-muted-foreground font-medium">
                        {formatDistanceToNow(new Date(n.created), { addSuffix: true })}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0" onClick={() => deleteNotification(n.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Tabs>
      </div>
    </>
  );
}