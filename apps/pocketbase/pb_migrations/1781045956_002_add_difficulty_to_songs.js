/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("songs");

  const existing = collection.fields.getByName("difficulty");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("difficulty"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "difficulty",
    values: ["Easy", "Medium", "Hard"]
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("songs");
    collection.fields.removeByName("difficulty");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})