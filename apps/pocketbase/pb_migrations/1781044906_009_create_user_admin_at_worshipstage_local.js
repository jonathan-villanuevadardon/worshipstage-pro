/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");
  const record = new Record(collection);
  record.set("email", "admin@worshipstage.local");
  record.setPassword($os.getenv("INITIAL_ADMIN_PASSWORD"));
  record.set("first_name", "Admin");
  record.set("last_name", "System");
  record.set("role", "super_admin");
  const record_organization_idLookup = app.findFirstRecordByFilter("organizations", "slug='iglesia-central'");
  if (!record_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"slug='iglesia-central'\""); }
  record.set("organization_id", record_organization_idLookup.id);
  record.set("status", "active");
  try {
    return app.save(record);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
      return;
    }
    throw e;
  }
}, (app) => {
  try {
    const record = app.findFirstRecordByData("users", "email", "admin@worshipstage.local");
    app.delete(record);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Auth record not found, skipping rollback");
      return;
    }
    throw e;
  }
})
