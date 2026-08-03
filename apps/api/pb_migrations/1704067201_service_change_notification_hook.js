/* eslint-disable no-undef */
/// <reference path="../pb_types.d.ts" />
migrate(async (db) => {
  const dao = new Dao(db);
  const collection = await dao.findCollectionByNameOrId('services');

  // Create hook for services update
  collection.onAfterUpdateRequest.add(async (e) => {
    const notificationsDao = new Dao(db);
    const service = e.record;
    const organizationId = service.get('organizationId');

    // Get team members in the organization to notify
    const teamMembers = await dao.findRecordsByFilter(
      'team_members',
      `organizationId = "${organizationId}"`,
      '-created',
      100,
      0
    );

    // Create notification for each team member
    for (const member of teamMembers) {
      const notification = new Record(await dao.findCollectionByNameOrId('notifications'));
      notification.set('userId', member.get('userId'));
      notification.set('organizationId', organizationId);
      notification.set('type', 'service_change');
      notification.set('relatedId', service.id);
      notification.set('title', 'Service Updated');
      notification.set('message', `Service "${service.get('name')}" has been updated`);
      notification.set('read', false);

      await notificationsDao.saveRecord(notification);
    }
  });
}, (db) => {
  // Rollback: remove the hook
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId('services');
  collection.onAfterUpdateRequest.removeAll();
});