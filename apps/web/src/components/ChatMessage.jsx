import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMentions } from '@/hooks/useMentions.js';
import { format } from 'date-fns';
import { Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import databaseClient from '@/lib/supabaseClient.js';

export default function ChatMessage({ message, isOwn, onDelete, onEdit }) {
  const { renderHighlightedText } = useMentions();
  
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const sender = message.expand?.user_id || {};

  return (
    <div className={`flex gap-3 max-w-[85%] group ${isOwn ? 'ml-auto flex-row-reverse' : ''}`}>
      <Avatar className="w-8 h-8 mt-1 shrink-0">
        <AvatarImage src={sender.avatar ? databaseClient.files.getUrl(sender, sender.avatar) : undefined} />
        <AvatarFallback className="text-xs bg-muted text-muted-foreground">{getInitials(sender.name || sender.email)}</AvatarFallback>
      </Avatar>

      <div className={`flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 px-1">
          <span className="text-sm font-medium">{sender.name || sender.email || 'Unknown User'}</span>
          <span className="text-xs text-muted-foreground">
            {message.created ? format(new Date(message.created), 'h:mm a') : format(new Date(message.createdAt || new Date()), 'h:mm a')}
          </span>
        </div>
        
        <div className={`relative px-4 py-2 rounded-2xl ${isOwn ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'}`}>
          <div className="text-sm break-words whitespace-pre-wrap">
            {renderHighlightedText(message.content)}
          </div>
        </div>

        {isOwn && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => onEdit(message)}>
              <Edit2 className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => onDelete(message.id)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
