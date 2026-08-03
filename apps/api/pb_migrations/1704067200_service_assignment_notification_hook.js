/* eslint-disable no-undef */
/// <reference path="../pb_types.d.ts" />
migrate(async (db) => {
  const dao = new Dao(db);
  const collection = await dao.findCollectionByNameOrId('service_assignments');

  // Create hook for service_assignments creation
  collection.onAfterCreateRequest.add(async (e) => {
    const notificationsDao = new Dao(db);
    const serviceAssignment = e.record;

    // Get the service to find organization
    const service = await dao.findRecordById('services', serviceAssignment.get('serviceId'));
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
      notification.set('type', 'service_assignment');
      notification.set('relatedId', serviceAssignment.id);
      notification.set('title', 'New Service Assignment');
      notification.set('message', `A new service assignment has been created`);
      notification.set('read', false);

      await notificationsDao.saveRecord(notification);
    }
  });
}, (db) => {
  // Rollback: remove the hook
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId('service_assignments');
  collection.onAfterCreateRequest.removeAll();
});