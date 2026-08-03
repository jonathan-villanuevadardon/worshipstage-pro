import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/supabaseClient';
import apiServerClient from '@/lib/apiServerClient';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import ConversationList from '@/components/ConversationList.jsx';
import ChatMessage from '@/components/ChatMessage.jsx';
import MessageInput from '@/components/MessageInput.jsx';
import { MessageSquare, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatPage() {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, [currentUser]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    } else {
      setMessages([]);
    }
  }, [activeConversation]);

  useEffect(() => {
    if (!currentUser) return;
    
    // Subscribe to chat_messages changes
    pb.collection('chat_messages').subscribe('*', async (e) => {
      if (e.action === 'create' && e.record.conversation_id === activeConversation?.id) {
        // Fetch full record to get user expansion
        try {
          const fullRecord = await pb.collection('chat_messages').getOne(e.record.id, {
            expand: 'user_id',
            $autoCancel: false
          });
          setMessages(prev => [...prev, fullRecord]);
          scrollToBottom();
        } catch (err) {
          console.error(err);
        }
      } else if (e.action === 'delete' && e.record.conversation_id === activeConversation?.id) {
        setMessages(prev => prev.filter(m => m.id !== e.record.id));
      }
    });

    return () => {
      pb.collection('chat_messages').unsubscribe('*');
    };
  }, [activeConversation, currentUser]);

  const fetchConversations = async () => {
    try {
      setLoadingConvs(true);
      const res = await apiServerClient.fetch('/chat/conversations?perPage=50');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoadingConvs(false);
    }
  };

  const fetchMessages = async (convId) => {
    try {
      setLoadingMessages(true);
      const records = await pb.collection('chat_messages').getFullList({
        filter: `conversation_id = "${convId}"`,
        sort: 'created',
        expand: 'user_id',
        $autoCancel: false
      });
      setMessages(records);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSendMessage = async (content) => {
    if (!activeConversation) return;
    try {
      setSending(true);
      const res = await apiServerClient.fetch('/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConversation.id,
          content
        })
      });
      if (!res.ok) throw new Error('Failed to send');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Could not send message');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await pb.collection('chat_messages').delete(msgId, { $autoCancel: false });
    } catch (err) {
      toast.error('Failed to delete message');
    }
  };

  return (
    <>
      <Helmet>
        <title>Chat - WorshipStage Pro</title>
      </Helmet>
      
      <div className="container max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-4rem)]">
        <Card className="flex h-full overflow-hidden border-border bg-card shadow-lg rounded-2xl">
          {/* Sidebar */}
          <div className="w-80 border-r border-border bg-muted/20 flex flex-col hidden md:flex">
            <div className="p-4 border-b border-border">
              <h2 className="font-bold text-xl flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Messages
              </h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <ConversationList 
                conversations={conversations} 
                activeId={activeConversation?.id} 
                onSelect={setActiveConversation} 
                loading={loadingConvs} 
              />
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-background">
            {activeConversation ? (
              <>
                <div className="p-4 border-b border-border flex items-center gap-3 bg-muted/10">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{activeConversation.title || activeConversation.name || 'Chat'}</h3>
                    <p className="text-xs text-muted-foreground">{activeConversation.participants?.length || 0} members</p>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-6">
                    {loadingMessages ? (
                      <div className="text-center text-muted-foreground text-sm py-8">Loading history...</div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-muted-foreground text-sm py-8">No messages yet. Say hello!</div>
                    ) : (
                      messages.map((msg) => (
                        <ChatMessage 
                          key={msg.id} 
                          message={msg} 
                          isOwn={msg.user_id === currentUser?.id}
                          onDelete={handleDeleteMessage}
                          onEdit={() => {}}
                        />
                      ))
                    )}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>

                <div className="p-4 border-t border-border bg-muted/10">
                  <MessageInput onSend={handleSendMessage} loading={sending} />
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-lg font-medium">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}