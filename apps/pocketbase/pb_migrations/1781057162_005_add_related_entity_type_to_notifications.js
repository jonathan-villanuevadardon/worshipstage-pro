/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("notifications");

  const existing = collection.fields.getByName("related_entity_type");
  if (existing) {
    if (existing.type === "text") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("related_entity_type"); // exists with wrong type, remove first
  }

  collection.fields.add(new TextField({
    name: "related_entity_type"
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("notifications");
    collection.fields.removeByName("related_entity_type");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})