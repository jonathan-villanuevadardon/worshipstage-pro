/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const organizationsCollection = app.findCollectionByNameOrId("organizations");
  const collection = app.findCollectionByNameOrId("users");

  const existing = collection.fields.getByName("organization_id");
  if (existing) {
    if (existing.type === "relation") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("organization_id"); // exists with wrong type, remove first
  }

  collection.fields.add(new RelationField({
    name: "organization_id",
    required: true,
    collectionId: organizationsCollection.id
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("users");
    collection.fields.removeByName("organization_id");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})