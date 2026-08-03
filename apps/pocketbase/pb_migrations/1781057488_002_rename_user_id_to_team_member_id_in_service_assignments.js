/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("service_assignments");
  const field = collection.fields.getByName("user_id");
  field.name = "team_member_id";
  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("service_assignments");
    const field = collection.fields.getByName("team_member_id");
    if (!field) { console.log("Field not found, skipping revert"); return; }
    field.name = "user_id";
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection or field not found, skipping revert");
      return;
    }
    throw e;
  }
})