/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Fetch related collections to get their IDs
  const songsCollection = app.findCollectionByNameOrId("songs");
  const song_categoriesCollection = app.findCollectionByNameOrId("song_categories");

  const collection = new Collection({
    "createRule": "@request.auth.id != '' && (@request.auth.role = 'worship_leader' || @request.auth.role = 'super_admin' || (@request.auth.role = 'church_admin' && @request.auth.organization_id = song_id.organization_id))",
    "deleteRule": "@request.auth.id != '' && (@request.auth.role = 'worship_leader' || @request.auth.role = 'super_admin' || (@request.auth.role = 'church_admin' && @request.auth.organization_id = song_id.organization_id))",
    "fields":     [
          {
                "autogeneratePattern": "[a-z0-9]{15}",
                "hidden": false,
                "id": "text8292318588",
                "max": 15,
                "min": 15,
                "name": "id",
                "pattern": "^[a-z0-9]+$",
                "presentable": false,
                "primaryKey": true,
                "required": true,
                "system": true,
                "type": "text"
          },
          {
                "hidden": false,
                "id": "relation9847057401",
                "name": "song_id",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "relation",
                "cascadeDelete": false,
                "collectionId": songsCollection.id,
                "displayFields": [],
                "maxSelect": 1,
                "minSelect": 0
          },
          {
                "hidden": false,
                "id": "relation1758048048",
                "name": "category_id",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "relation",
                "cascadeDelete": false,
                "collectionId": song_categoriesCollection.id,
                "displayFields": [],
                "maxSelect": 1,
                "minSelect": 0
          },
          {
                "hidden": false,
                "id": "text0282314625",
                "name": "tag_name",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
          },
          {
                "hidden": false,
                "id": "autodate9680487211",
                "name": "created",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
          },
          {
                "hidden": false,
                "id": "autodate2781401629",
                "name": "updated",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
          }
    ],
    "id": "pbc_4471474781",
    "indexes": [],
    "listRule": "@request.auth.id != '' && @request.auth.organization_id = song_id.organization_id",
    "name": "song_tags",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.id != '' && (@request.auth.role = 'worship_leader' || @request.auth.role = 'super_admin' || (@request.auth.role = 'church_admin' && @request.auth.organization_id = song_id.organization_id))",
    "viewRule": "@request.auth.id != '' && @request.auth.organization_id = song_id.organization_id"
  });

  try {
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("Collection name must be unique")) {
      console.log("Collection already exists, skipping");
      return;
    }
    throw e;
  }
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("pbc_4471474781");
    return app.delete(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})