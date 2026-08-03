/* eslint-disable no-undef */
/// <reference path="../pb_types.d.ts" />
migrate(async (db) => {
  const dao = new Dao(db);
  const collection = await dao.findCollectionByNameOrId('team_members');

  // Create hook for team_members availability change
  collection.onAfterUpdateRequest.add(async (e) => {
    const notificationsDao = new Dao(db);
    const teamMember = e.record;
    const organizationId = teamMember.get('organizationId');

    // Check if availability field was changed
    const oldAvailability = e.data.get('availability');
    const newAvailability = teamMember.get('availability');

    if (oldAvailability !== newAvailability) {
      // Get all team members in the organization to notify
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
        notification.set('type', 'availability_change');
        notification.set('relatedId', teamMember.id);
        notification.set('title', 'Team Member Availability Changed');
        notification.set('message', `Team member availability has been updated to ${newAvailability}`);
        notification.set('read', false);

        await notificationsDao.saveRecord(notification);
      }
    }
  });
}, (db) => {
  // Rollback: remove the hook
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId('team_members');
  collection.onAfterUpdateRequest.removeAll();
});