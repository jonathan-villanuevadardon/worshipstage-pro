import React, { useState, useEffect } from 'react';
import pb from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export function useMentions(text) {
  const { activeOrganizationId } = useAuth();
  const [users, setUsers] = useState([]);
  const [mentionResults, setMentionResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (activeOrganizationId) {
        try {
          const records = await pb.collection('users').getFullList({
            filter: `organization_id = "${activeOrganizationId}"`,
            $autoCancel: false
          });
          setUsers(records);
        } catch (e) {
          console.error(e);
        }
      }
    };
    fetchUsers();
  }, [activeOrganizationId]);

  const handleInput = (val, cursorPosition) => {
    const textBeforeCursor = val.slice(0, cursorPosition);
    const match = textBeforeCursor.match(/@(\w*)$/);
    if (match) {
      const query = match[1].toLowerCase();
      setSearchQuery(query);
      const filtered = users.filter(u => 
        (u.name && u.name.toLowerCase().includes(query)) || 
        (u.email && u.email.toLowerCase().includes(query))
      );
      setMentionResults(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setShowDropdown(false);
    }
  };

  const insertMention = (val, cursorPosition, user) => {
    const textBeforeCursor = val.slice(0, cursorPosition);
    const match = textBeforeCursor.match(/@(\w*)$/);
    if (match) {
      const start = textBeforeCursor.lastIndexOf('@');
      const newText = val.slice(0, start) + `@${user.name || user.email} ` + val.slice(cursorPosition);
      setShowDropdown(false);
      return newText;
    }
    return val;
  };

  const renderHighlightedText = (content) => {
    if (!content) return null;
    const parts = content.split(/(@[\w\s]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        // Use React.createElement instead of JSX inside a .js file to prevent Vite parse errors
        return React.createElement('span', { key: i, className: 'text-primary font-medium' }, part);
      }
      return React.createElement('span', { key: i }, part);
    });
  };

  return {
    handleInput,
    insertMention,
    renderHighlightedText,
    mentionResults,
    showDropdown,
    setShowDropdown
  };
}
