/// <reference path="../pb_data/types.d.ts" />

const authenticated = "@request.auth.id != ''";
const superAdmin = "@request.auth.role = 'super_admin'";

function setRules(app, collectionName, rules) {
  const collection = app.findCollectionByNameOrId(collectionName);
  Object.assign(collection, rules);
  app.save(collection);
}

migrate((app) => {
  setRules(app, 'organizations', {
    listRule: `(@request.auth.id = '' && status = 'active') || ${superAdmin} || @request.auth.organization_id = id`,
    viewRule: `(@request.auth.id = '' && status = 'active') || ${superAdmin} || @request.auth.organization_id = id`,
    createRule: `${authenticated} && ${superAdmin}`,
    updateRule: `${authenticated} && ${superAdmin}`,
    deleteRule: `${authenticated} && ${superAdmin}`,
  });

  const directTenantCollections = [
    'teams',
    'songs',
    'song_categories',
    'repertoires',
    'services',
    'role_permissions',
    'conversations',
    'chat_conversations',
  ];

  for (const name of directTenantCollections) {
    setRules(app, name, {
      listRule: `${authenticated} && (${superAdmin} || @request.auth.organization_id = organization_id)`,
      viewRule: `${authenticated} && (${superAdmin} || @request.auth.organization_id = organization_id)`,
    });
  }

  setRules(app, 'users', {
    createRule: `(@request.auth.id = '' && @request.body.role = 'volunteer') || (${authenticated} && (${superAdmin} || ((@request.auth.role = 'church_admin' || @request.auth.role = 'pastor' || @request.auth.role = 'worship_leader') && @request.auth.organization_id = @request.body.organization_id && @request.body.role != 'super_admin')))`,
    updateRule: `${authenticated} && (${superAdmin} || (id = @request.auth.id && @request.body.role:changed = false && @request.body.organization_id:changed = false) || ((@request.auth.role = 'church_admin' || @request.auth.role = 'pastor' || @request.auth.role = 'worship_leader') && @request.auth.organization_id = organization_id && @request.body.organization_id:changed = false && @request.body.role != 'super_admin'))`,
    deleteRule: `${authenticated} && (${superAdmin} || ((@request.auth.role = 'church_admin' || @request.auth.role = 'pastor' || @request.auth.role = 'worship_leader') && @request.auth.organization_id = organization_id && role != 'super_admin'))`,
  });

  const directManageRules = `${authenticated} && (${superAdmin} || ((@request.auth.role = 'church_admin' || @request.auth.role = 'pastor' || @request.auth.role = 'worship_leader') && @request.auth.organization_id = organization_id))`;
  for (const name of ['songs', 'repertoires', 'services', 'role_permissions']) {
    setRules(app, name, {
      createRule: directManageRules,
      updateRule: directManageRules,
      deleteRule: directManageRules,
    });
  }

  const churchManagerRules = `${authenticated} && (${superAdmin} || ((@request.auth.role = 'church_admin' || @request.auth.role = 'pastor') && @request.auth.organization_id = organization_id))`;
  for (const name of ['teams', 'song_categories']) {
    setRules(app, name, {
      createRule: churchManagerRules,
      updateRule: churchManagerRules,
      deleteRule: churchManagerRules,
    });
  }

  const serviceRelationView = `${authenticated} && (${superAdmin} || @request.auth.organization_id = service_id.organization_id)`;
  const serviceRelationManage = `${authenticated} && (${superAdmin} || ((@request.auth.role = 'church_admin' || @request.auth.role = 'pastor' || @request.auth.role = 'worship_leader') && @request.auth.organization_id = service_id.organization_id))`;
  for (const name of ['service_assignments', 'service_checklist', 'service_elements', 'service_notes']) {
    setRules(app, name, {
      listRule: serviceRelationView,
      viewRule: serviceRelationView,
      createRule: serviceRelationManage,
      updateRule: serviceRelationManage,
      deleteRule: serviceRelationManage,
    });
  }

  const repertoireRelationView = `${authenticated} && (${superAdmin} || @request.auth.organization_id = repertoire_id.organization_id)`;
  const repertoireRelationManage = `${authenticated} && (${superAdmin} || ((@request.auth.role = 'church_admin' || @request.auth.role = 'pastor' || @request.auth.role = 'worship_leader') && @request.auth.organization_id = repertoire_id.organization_id))`;
  setRules(app, 'repertoire_songs', {
    listRule: repertoireRelationView,
    viewRule: repertoireRelationView,
    createRule: repertoireRelationManage,
    updateRule: repertoireRelationManage,
    deleteRule: repertoireRelationManage,
  });

  const songRelationView = `${authenticated} && (${superAdmin} || @request.auth.organization_id = song_id.organization_id)`;
  const songRelationManage = `${authenticated} && (${superAdmin} || ((@request.auth.role = 'church_admin' || @request.auth.role = 'pastor' || @request.auth.role = 'worship_leader') && @request.auth.organization_id = song_id.organization_id))`;
  setRules(app, 'song_tags', {
    listRule: songRelationView,
    viewRule: songRelationView,
    createRule: songRelationManage,
    updateRule: songRelationManage,
    deleteRule: songRelationManage,
  });

  const userRelationView = `${authenticated} && (${superAdmin} || @request.auth.organization_id = team_member_id.organization_id)`;
  setRules(app, 'team_availability', {
    listRule: userRelationView,
    viewRule: userRelationView,
  });

  const teamRelationView = `${authenticated} && (${superAdmin} || @request.auth.organization_id = team_id.organization_id)`;
  const teamRelationManage = `${authenticated} && (${superAdmin} || ((@request.auth.role = 'church_admin' || @request.auth.role = 'pastor') && @request.auth.organization_id = team_id.organization_id))`;
  setRules(app, 'team_members', {
    listRule: teamRelationView,
    viewRule: teamRelationView,
    createRule: teamRelationManage,
    updateRule: teamRelationManage,
    deleteRule: teamRelationManage,
  });

  const chatRelationView = `${authenticated} && (${superAdmin} || @request.auth.organization_id = conversation_id.organization_id)`;
  for (const name of ['chat_messages', 'chat_participants', 'messages']) {
    setRules(app, name, {
      listRule: chatRelationView,
      viewRule: chatRelationView,
    });
  }

  const chatConversationManage = `${authenticated} && (${superAdmin} || (@request.auth.organization_id = organization_id && (created_by = @request.auth.id || @request.auth.role = 'church_admin' || @request.auth.role = 'pastor')))`;
  setRules(app, 'chat_conversations', {
    createRule: `${authenticated} && (${superAdmin} || @request.auth.organization_id = organization_id)`,
    updateRule: chatConversationManage,
    deleteRule: chatConversationManage,
  });
  setRules(app, 'chat_messages', {
    createRule: `${authenticated} && (${superAdmin} || (@request.auth.organization_id = conversation_id.organization_id && user_id = @request.auth.id))`,
    updateRule: `${authenticated} && (${superAdmin} || (@request.auth.organization_id = conversation_id.organization_id && user_id = @request.auth.id))`,
    deleteRule: `${authenticated} && (${superAdmin} || (@request.auth.organization_id = conversation_id.organization_id && user_id = @request.auth.id))`,
  });
}, (app) => {
  setRules(app, 'organizations', {
    listRule: '',
    viewRule: '',
    createRule: null,
    updateRule: null,
    deleteRule: null,
  });

  for (const name of ['teams', 'songs', 'song_categories', 'repertoires', 'services', 'role_permissions', 'conversations', 'chat_conversations']) {
    setRules(app, name, {
      listRule: `${authenticated} && @request.auth.organization_id = organization_id`,
      viewRule: `${authenticated} && @request.auth.organization_id = organization_id`,
    });
  }

  for (const name of ['service_assignments', 'service_checklist', 'service_elements', 'service_notes']) {
    setRules(app, name, {
      listRule: `${authenticated} && @request.auth.organization_id = service_id.organization_id`,
      viewRule: `${authenticated} && @request.auth.organization_id = service_id.organization_id`,
    });
  }

  setRules(app, 'repertoire_songs', {
    listRule: `${authenticated} && @request.auth.organization_id = repertoire_id.organization_id`,
    viewRule: `${authenticated} && @request.auth.organization_id = repertoire_id.organization_id`,
  });
  setRules(app, 'song_tags', {
    listRule: `${authenticated} && @request.auth.organization_id = song_id.organization_id`,
    viewRule: `${authenticated} && @request.auth.organization_id = song_id.organization_id`,
  });
  setRules(app, 'team_availability', {
    listRule: `${authenticated} && @request.auth.organization_id = team_member_id.organization_id`,
    viewRule: `${authenticated} && @request.auth.organization_id = team_member_id.organization_id`,
  });
  setRules(app, 'team_members', {
    listRule: `${authenticated} && @request.auth.organization_id = team_id.organization_id`,
    viewRule: `${authenticated} && @request.auth.organization_id = team_id.organization_id`,
  });
  for (const name of ['chat_messages', 'chat_participants', 'messages']) {
    setRules(app, name, {
      listRule: `${authenticated} && @request.auth.organization_id = conversation_id.organization_id`,
      viewRule: `${authenticated} && @request.auth.organization_id = conversation_id.organization_id`,
    });
  }
});
