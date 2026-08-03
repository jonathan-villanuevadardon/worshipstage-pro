import { Router } from 'express';
import { supabaseAuth } from '../middleware/supabase-auth.js';
import logger from '../utils/logger.js';

const router = Router();

router.use(supabaseAuth);

/**
 * POST /chat/messages
 * Create a new message in a conversation
 * Body: { conversationId: string, content: string }
 */
router.post('/messages', async (req, res) => {
  const { conversationId, content } = req.body;
  const userId = req.userId;

  if (!conversationId || !content) {
    return res.status(400).json({ error: 'conversationId and content are required' });
  }

  // Verify user is a participant in this conversation
  const { data: participant, error: participantError } = await req.supabase.from('chat_participants')
    .select('id').eq('conversation_id', conversationId).eq('user_id', userId).maybeSingle();
  if (participantError) throw participantError;
  if (!participant) {
    throw new Error('Unauthorized: User is not a participant in this conversation');
  }

  // Create message record
  const { data: message, error } = await req.supabase.from('chat_messages').insert({
    conversation_id: conversationId,
    user_id: userId,
    content,
  }).select().single();
  if (error) throw error;

  logger.info(`Message created: ${message.id} in conversation ${conversationId}`);

  res.status(201).json({
    id: message.id,
    conversationId: message.conversation_id,
    userId: message.user_id,
    content: message.content,
    createdAt: message.created,
  });
});

/**
 * GET /chat/conversations
 * List all conversations for the authenticated user
 * Query params: page (default 1), perPage (default 10)
 */
router.get('/conversations', async (req, res) => {
  const userId = req.userId;
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;

  // Query conversations where user is a participant
  const from = (page - 1) * perPage;
  const { data: conversations = [], count = 0, error } = await req.supabase.from('chat_conversations')
    .select('*,chat_participants!inner(user_id)', { count: 'exact' })
    .eq('chat_participants.user_id', userId).order('updated', { ascending: false })
    .range(from, from + perPage - 1);
  if (error) throw error;

  logger.info(`Fetched ${conversations.length} conversations for user ${userId}`);

  res.json({
    page,
    perPage,
    totalItems: count,
    totalPages: Math.ceil(count / perPage),
    items: conversations.map(conv => ({
      id: conv.id,
      title: conv.name,
      participants: conv.chat_participants.map((participant) => participant.user_id),
      createdAt: conv.created,
      updatedAt: conv.updated,
    })),
  });
});

/**
 * GET /chat/messages/:conversationId
 * Fetch message history for a conversation with pagination
 * Query params: page (default 1), perPage (default 20)
 */
router.get('/messages/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.userId;
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 20;

  // Verify user is a participant in this conversation
  const { data: participant, error: participantError } = await req.supabase.from('chat_participants')
    .select('id').eq('conversation_id', conversationId).eq('user_id', userId).maybeSingle();
  if (participantError) throw participantError;
  if (!participant) {
    throw new Error('Unauthorized: User is not a participant in this conversation');
  }

  // Fetch messages for this conversation
  const from = (page - 1) * perPage;
  const { data: messages = [], count = 0, error } = await req.supabase.from('chat_messages')
    .select('*', { count: 'exact' }).eq('conversation_id', conversationId)
    .order('created').range(from, from + perPage - 1);
  if (error) throw error;

  logger.info(`Fetched ${messages.length} messages for conversation ${conversationId}`);

  res.json({
    conversationId,
    page,
    perPage,
    totalItems: count,
    totalPages: Math.ceil(count / perPage),
    items: messages.map(msg => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      userId: msg.user_id,
      content: msg.content,
      createdAt: msg.created,
    })),
  });
});

export default router;
