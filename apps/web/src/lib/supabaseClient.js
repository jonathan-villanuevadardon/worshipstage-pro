import { createClient } from '@supabase/supabase-js';
import { APP_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './runtimeConfig.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

const tableAliases = {
  _integratedAiMessages: 'integrated_ai_messages',
};

const fieldAliases = {
  _integratedAiMessages: { userId: 'user_id' },
};

const relationTables = {
  repertoire_id: 'repertoires',
  service_id: 'services',
  song_id: 'songs',
  team_member_id: 'users',
  user_id: 'users',
};

const reverseRelations = {
  service_assignments_via_service_id: 'service_assignments',
};

function mapField(collectionName, field) {
  return fieldAliases[collectionName]?.[field] || field;
}

function mapData(collectionName, data) {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => !['password', 'passwordConfirm', 'emailVisibility'].includes(key))
      .map(([key, value]) => [mapField(collectionName, key), value])
  );
}

function splitTopLevel(value, delimiter) {
  const parts = [];
  let depth = 0;
  let start = 0;
  let quote = null;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if ((character === '"' || character === "'") && value[index - 1] !== '\\') {
      quote = quote === character ? null : (quote || character);
    } else if (!quote && character === '(') {
      depth += 1;
    } else if (!quote && character === ')') {
      depth -= 1;
    } else if (!quote && depth === 0 && value.startsWith(delimiter, index)) {
      parts.push(value.slice(start, index).trim());
      start = index + delimiter.length;
      index += delimiter.length - 1;
    }
  }
  parts.push(value.slice(start).trim());
  return parts.filter(Boolean);
}

function stripOuterParentheses(value) {
  let result = value.trim();
  while (result.startsWith('(') && result.endsWith(')')) {
    const inner = result.slice(1, -1);
    if (splitTopLevel(inner, ' && ').length > 1 || splitTopLevel(inner, ' || ').length > 1) {
      result = inner.trim();
    } else {
      break;
    }
  }
  return result;
}

function parseCondition(condition, collectionName) {
  const match = stripOuterParentheses(condition).match(/^([\w.]+)\s*(>=|<=|=|~)\s*["'](.*)["']$/s);
  if (!match) return null;
  const [, rawField, operator, value] = match;
  const path = rawField.split('.');
  path[0] = mapField(collectionName, path[0]);
  if (path.length > 1 && relationTables[path[0]]) {
    path[0] = relationTables[path[0]];
  }
  return { field: path.join('.'), operator, value };
}

function postgrestExpression(condition) {
  const operatorMap = { '=': 'eq', '~': 'ilike', '>=': 'gte', '<=': 'lte' };
  const value = condition.operator === '~' ? `*${condition.value}*` : condition.value;
  return `${condition.field}.${operatorMap[condition.operator]}.${value}`;
}

function relationSelectsForFilter(filter, collectionName) {
  const selects = new Set();
  const relationPattern = /([\w]+)\.[\w]+\s*(?:>=|<=|=|~)/g;
  for (const match of filter?.matchAll(relationPattern) || []) {
    const field = mapField(collectionName, match[1]);
    if (relationTables[field]) selects.add(`${relationTables[field]}!inner(id)`);
  }
  return [...selects];
}

function expansionSelect(expand = '') {
  return expand.split(',').map((value) => value.trim()).filter(Boolean).map((name) => {
    const [parent, child] = name.split('.');
    if (reverseRelations[parent]) {
      const nested = child && relationTables[child] ? `,_expand_${child}:${relationTables[child]}(*)` : '';
      return `_expand_${parent}:${reverseRelations[parent]}(*${nested})`;
    }
    if (relationTables[parent]) return `_expand_${parent}:${relationTables[parent]}(*)`;
    return null;
  }).filter(Boolean);
}

function normalizeRecord(record) {
  if (!record) return record;
  const expand = {};
  const normalized = { ...record };
  for (const [key, value] of Object.entries(record)) {
    if (key.startsWith('_expand_')) {
      expand[key.slice('_expand_'.length)] = Array.isArray(value)
        ? value.map(normalizeRecord)
        : normalizeRecord(value);
      delete normalized[key];
    }
  }
  if (Object.keys(expand).length > 0) normalized.expand = expand;
  return normalized;
}

function applyFilter(query, filter, collectionName) {
  if (!filter) return query;
  const clauses = splitTopLevel(stripOuterParentheses(filter), ' && ');
  let result = query;

  for (const clause of clauses) {
    const value = stripOuterParentheses(clause);
    const alternatives = splitTopLevel(value, ' || ');
    if (alternatives.length > 1) {
      const expressions = alternatives.map((item) => parseCondition(item, collectionName)).filter(Boolean);
      if (expressions.length > 0) result = result.or(expressions.map(postgrestExpression).join(','));
      continue;
    }
    const condition = parseCondition(value, collectionName);
    if (!condition) continue;
    if (condition.operator === '=') result = result.eq(condition.field, condition.value);
    if (condition.operator === '~') result = result.ilike(condition.field, `%${condition.value}%`);
    if (condition.operator === '>=') result = result.gte(condition.field, condition.value);
    if (condition.operator === '<=') result = result.lte(condition.field, condition.value);
  }
  return result;
}

function applySort(query, sort) {
  let result = query;
  for (const field of (sort || '').split(',').map((value) => value.trim()).filter(Boolean)) {
    result = result.order(field.replace(/^-/, ''), { ascending: !field.startsWith('-') });
  }
  return result;
}

function buildSelect(options, collectionName) {
  const relations = [
    ...relationSelectsForFilter(options.filter, collectionName),
    ...expansionSelect(options.expand),
  ];
  return ['*', ...new Set(relations)].join(',');
}

function throwOnError(error) {
  if (error) throw error;
}

function createCollection(collectionName) {
  const table = tableAliases[collectionName] || collectionName;

  return {
    async getList(page = 1, perPage = 30, options = {}) {
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      let query = supabase.from(table).select(buildSelect(options, collectionName), { count: 'exact' }).range(from, to);
      query = applyFilter(query, options.filter, collectionName);
      query = applySort(query, options.sort);
      const { data, count, error } = await query;
      throwOnError(error);
      const totalItems = count || 0;
      return {
        page,
        perPage,
        totalItems,
        totalPages: Math.ceil(totalItems / perPage),
        items: (data || []).map(normalizeRecord),
      };
    },

    async getFullList(options = {}) {
      let query = supabase.from(table).select(buildSelect(options, collectionName)).range(0, 9999);
      query = applyFilter(query, options.filter, collectionName);
      query = applySort(query, options.sort);
      const { data, error } = await query;
      throwOnError(error);
      return (data || []).map(normalizeRecord);
    },

    async getOne(id, options = {}) {
      const { data, error } = await supabase.from(table)
        .select(buildSelect(options, collectionName))
        .eq('id', id)
        .single();
      throwOnError(error);
      return normalizeRecord(data);
    },

    async create(input) {
      if (collectionName === 'users') {
        const { data, error } = await supabase.functions.invoke('admin-create-user', {
          body: {
            email: input.email,
            password: input.password,
            first_name: input.first_name,
            last_name: input.last_name,
            organization_id: input.organization_id,
            role: input.role || 'volunteer',
          },
        });
        throwOnError(error);
        if (data?.error) throw new Error(data.error);
        return normalizeRecord(data.user);
      }
      const { data, error } = await supabase.from(table).insert(mapData(collectionName, input)).select().single();
      throwOnError(error);
      return normalizeRecord(data);
    },

    async update(id, input) {
      if (collectionName === 'users' && Object.hasOwn(input, 'role')) {
        const { error } = await supabase.rpc('set_user_role', { target_user_id: id, new_role: input.role });
        throwOnError(error);
        const { role: _role, ...remaining } = input;
        if (Object.keys(remaining).length === 0) return this.getOne(id);
        input = remaining;
      }
      const { data, error } = await supabase.from(table).update({
        ...mapData(collectionName, input),
        updated: new Date().toISOString(),
      }).eq('id', id).select().single();
      throwOnError(error);
      return normalizeRecord(data);
    },

    async delete(id) {
      if (collectionName === 'users') {
        const { error } = await supabase.rpc('deactivate_user', { target_user_id: id });
        throwOnError(error);
        return true;
      }
      const { error } = await supabase.from(table).delete().eq('id', id);
      throwOnError(error);
      return true;
    },

    async requestPasswordReset(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${APP_URL}/reset-password`,
      });
      throwOnError(error);
    },

    subscribe(topic, callback) {
      const channel = supabase.channel(`${table}:${topic}:${crypto.randomUUID()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
          const action = { INSERT: 'create', UPDATE: 'update', DELETE: 'delete' }[payload.eventType];
          callback({ action, record: normalizeRecord(payload.new?.id ? payload.new : payload.old) });
        }).subscribe();
      subscriptions.set(`${table}:${topic}`, channel);
      return Promise.resolve();
    },

    async unsubscribe(topic) {
      const key = `${table}:${topic}`;
      const channel = subscriptions.get(key);
      if (channel) await supabase.removeChannel(channel);
      subscriptions.delete(key);
    },
  };
}

const subscriptions = new Map();

const databaseClient = {
  collection: createCollection,
  files: {
    getUrl(record, filename) {
      if (!filename) return '';
      if (/^https?:\/\//i.test(filename)) return filename;
      const path = filename.includes('/') ? filename : `${record.id}/${filename}`;
      return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
    },
    getURL(record, filename) {
      return this.getUrl(record, filename);
    },
  },
};

export default databaseClient;
