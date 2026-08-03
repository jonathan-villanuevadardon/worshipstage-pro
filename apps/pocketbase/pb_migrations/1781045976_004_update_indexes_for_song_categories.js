/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("song_categories");
  collection.indexes.push("CREATE UNIQUE INDEX idx_song_categories_slug ON song_categories (slug)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("song_categories");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_song_categories_slug"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})