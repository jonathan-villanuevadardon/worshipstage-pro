import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Hash, Users, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ConversationList({ conversations, activeId, onSelect, loading }) {
  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground space-y-2">
        <MessageSquare className="w-8 h-8 opacity-50" />
        <p className="text-sm">No conversations yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-1">
        {conversations.map(conv => (
          <Button
            key={conv.id}
            variant={activeId === conv.id ? 'secondary' : 'ghost'}
            className={`w-full justify-start overflow-hidden ${activeId === conv.id ? 'font-semibold' : 'font-normal'}`}
            onClick={() => onSelect(conv)}
          >
            {conv.type === 'group' ? (
              <Hash className="mr-2 h-4 w-4 shrink-0 opacity-70" />
            ) : (
              <Users className="mr-2 h-4 w-4 shrink-0 opacity-70" />
            )}
            <span className="truncate">{conv.title || conv.name || 'Unnamed Conversation'}</span>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}