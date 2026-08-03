import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizontal } from 'lucide-react';
import { useMentions } from '@/hooks/useMentions.js';

export default function MessageInput({ onSend, loading }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);
  const { handleInput, insertMention, mentionResults, showDropdown } = useMentions(text);

  const handleChange = (e) => {
    setText(e.target.value);
    handleInput(e.target.value, e.target.selectionStart);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!text.trim() || loading) return;
    onSend(text.trim());
    setText('');
  };

  const selectMention = (user) => {
    const pos = textareaRef.current?.selectionStart || text.length;
    const newText = insertMention(text, pos, user);
    setText(newText);
    textareaRef.current?.focus();
  };

  return (
    <div className="relative">
      {showDropdown && (
        <div className="absolute bottom-full mb-2 left-0 w-64 bg-popover border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          {mentionResults.map(user => (
            <button
              key={user.id}
              className="w-full text-left px-4 py-2 hover:bg-muted text-sm transition-colors"
              onClick={() => selectMention(user)}
            >
              <div className="font-medium">{user.name || user.email}</div>
            </button>
          ))}
        </div>
      )}
      
      <div className="relative flex items-end gap-2 bg-muted/50 p-2 rounded-2xl border border-border focus-within:ring-1 focus-within:ring-ring focus-within:border-primary transition-all">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... Use @ to mention"
          className="min-h-[44px] max-h-[120px] bg-transparent border-0 focus-visible:ring-0 resize-none p-2 text-foreground"
          rows={1}
        />
        <Button 
          size="icon" 
          className="shrink-0 h-11 w-11 rounded-xl"
          disabled={!text.trim() || loading}
          onClick={handleSend}
        >
          <SendHorizontal className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}