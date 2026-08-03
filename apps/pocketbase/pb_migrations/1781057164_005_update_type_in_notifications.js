/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("notifications");
  const field = collection.fields.getByName("type");
  field.values = ["service_assignment", "service_change", "assignment_status", "chat_message", "checklist_update", "team_update", "system"];
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("notifications");
  const field = collection.fields.getByName("type");
  if (!field) { console.log("Field not found, skipping revert"); return; }
  field.values = ["service_created", "repertoire_changed", "user_invited", "team_assignment", "message", "reminder"];
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection or field not found, skipping revert");
      return;
    }
    throw e;
  }
})