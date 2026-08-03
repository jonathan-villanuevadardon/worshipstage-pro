/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("repertoires");

  const existing = collection.fields.getByName("service_type");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("service_type"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "service_type",
    required: true,
    values: ["Sunday Service", "Prayer Meeting", "Youth Service", "Wedding", "Funeral", "Conference", "Special Event"]
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("repertoires");
    collection.fields.removeByName("service_type");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})