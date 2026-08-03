import { Router } from 'express';
import { supabaseAuth } from '../middleware/supabase-auth.js';
import logger from '../utils/logger.js';

const router = Router();

function getRequestedOrganizationId(req) {
  if (req.user.role === 'super_admin') {
    return req.query.organizationId || req.body?.organization_id;
  }
  return req.user.organization_id;
}

function assertOrganizationAccess(req, record) {
  if (req.user.role !== 'super_admin' && record.organization_id !== req.user.organization_id) {
    const error = new Error('Forbidden: This service belongs to another church');
    error.status = 403;
    throw error;
  }
}

router.use(supabaseAuth);

/**
 * GET /services
 * List all services
 * Query params: page (default 1), perPage (default 10)
 */
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;
  const organizationId = getRequestedOrganizationId(req);

  if (!organizationId) {
    return res.status(400).json({ error: 'organizationId is required' });
  }

  const from = (page - 1) * perPage;
  const { data: items = [], count = 0, error } = await req.supabase.from('services')
    .select('*', { count: 'exact' }).eq('organization_id', organizationId)
    .order('created', { ascending: false }).range(from, from + perPage - 1);
  if (error) throw error;

  logger.info(`Fetched ${items.length} services`);

  res.json({
    page,
    perPage,
    totalItems: count,
    totalPages: Math.ceil(count / perPage),
    items,
  });
});

/**
 * GET /services/:id
 * Get a single service by ID
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const { data: service, error } = await req.supabase.from('services').select('*').eq('id', id).single();
  if (error) throw error;
  assertOrganizationAccess(req, service);

  logger.info(`Fetched service: ${id}`);

  res.json(service);
});

/**
 * POST /services
 * Create a new service
 * Body: { name: string, description: string, ... }
 */
router.post('/', async (req, res) => {
  const { name, description, ...otherFields } = req.body;
  const organizationId = getRequestedOrganizationId(req);

  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  if (!organizationId) {
    return res.status(400).json({ error: 'organization_id is required' });
  }

  const { data: service, error } = await req.supabase.from('services').insert({
    name,
    description,
    ...otherFields,
    organization_id: organizationId,
  }).select().single();
  if (error) throw error;

  logger.info(`Service created: ${service.id}`);

  res.status(201).json(service);
});

/**
 * PATCH /services/:id
 * Update a service
 * Body: { name?: string, description?: string, ... }
 */
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const { data: existingService, error: fetchError } = await req.supabase.from('services').select('*').eq('id', id).single();
  if (fetchError) throw fetchError;
  assertOrganizationAccess(req, existingService);
  if (req.user.role !== 'super_admin') {
    updateData.organization_id = req.user.organization_id;
  }

  const { data: service, error } = await req.supabase.from('services').update(updateData).eq('id', id).select().single();
  if (error) throw error;

  logger.info(`Service updated: ${id}`);

  res.json(service);
});

/**
 * DELETE /services/:id
 * Delete a service (only super_admin role allowed)
 * Returns 403 Forbidden if user is not a super_admin
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const user = req.user;

  // Enforce super_admin role requirement
  if (user.role !== 'super_admin') {
    logger.warn(`Unauthorized delete attempt by user ${userId} (role: ${user.role}) for service ${id}`);
    return res.status(403).json({ error: 'Forbidden: Only super_admin users can delete services' });
  }

  // Proceed with deletion
  const { error } = await req.supabase.from('services').delete().eq('id', id);
  if (error) throw error;

  logger.info(`Service deleted: ${id} by user ${userId}`);

  res.json({ success: true, message: 'Service deleted successfully' });
});

export default router;
