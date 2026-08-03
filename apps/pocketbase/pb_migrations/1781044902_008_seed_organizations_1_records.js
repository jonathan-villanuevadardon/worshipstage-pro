/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("organizations");

  const record0 = new Record(collection);
    record0.set("name", "Iglesia Central de Adoraci\u00f3n");
    record0.set("slug", "iglesia-central");
    record0.set("subscription_plan", "professional");
    record0.set("status", "active");
    record0.set("description", "Iglesia dedicada a la adoraci\u00f3n y alabanza");
    record0.set("address", "Calle Principal 123, Centro");
    record0.set("phone", "+1-555-0100");
    record0.set("email", "info@iglesia-central.local");
    record0.set("website", "https://iglesia-central.local");
  try {
    app.save(record0);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})