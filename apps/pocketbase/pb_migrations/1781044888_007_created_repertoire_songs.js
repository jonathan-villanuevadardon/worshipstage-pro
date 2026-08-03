/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Fetch related collections to get their IDs
  const repertoiresCollection = app.findCollectionByNameOrId("repertoires");
  const songsCollection = app.findCollectionByNameOrId("songs");
  const usersCollection = app.findCollectionByNameOrId("users");

  const collection = new Collection({
    "createRule": "@request.auth.id != '' && (@request.auth.role = 'worship_leader' || @request.auth.role = 'super_admin' || (@request.auth.role = 'church_admin' && @request.auth.organization_id = repertoire_id.organization_id))",
    "deleteRule": "@request.auth.id != '' && (@request.auth.role = 'worship_leader' || @request.auth.role = 'super_admin' || (@request.auth.role = 'church_admin' && @request.auth.organization_id = repertoire_id.organization_id))",
    "fields":     [
          {
                "autogeneratePattern": "[a-z0-9]{15}",
                "hidden": false,
                "id": "text5436632087",
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
                "id": "relation0488678445",
                "name": "repertoire_id",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "relation",
                "cascadeDelete": false,
                "collectionId": repertoiresCollection.id,
                "displayFields": [],
                "maxSelect": 1,
                "minSelect": 0
          },
          {
                "hidden": false,
                "id": "relation0523196464",
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
                "id": "number6227973861",
                "name": "order",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": false
          },
          {
                "hidden": false,
                "id": "relation8534097537",
                "name": "leader_id",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "relation",
                "cascadeDelete": false,
                "collectionId": usersCollection.id,
                "displayFields": [],
                "maxSelect": 1,
                "minSelect": 0
          },
          {
                "hidden": false,
                "id": "text1683119349",
                "name": "notes",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
          },
          {
                "hidden": false,
                "id": "number7321134423",
                "name": "duration_seconds",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": false
          },
          {
                "hidden": false,
                "id": "autodate8148310824",
                "name": "created",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
          },
          {
                "hidden": false,
                "id": "autodate8290329367",
                "name": "updated",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
          }
    ],
    "id": "pbc_5818181318",
    "indexes": [],
    "listRule": "@request.auth.id != '' && @request.auth.organization_id = repertoire_id.organization_id",
    "name": "repertoire_songs",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.id != '' && (@request.auth.role = 'worship_leader' || @request.auth.role = 'super_admin' || (@request.auth.role = 'church_admin' && @request.auth.organization_id = repertoire_id.organization_id))",
    "viewRule": "@request.auth.id != '' && @request.auth.organization_id = repertoire_id.organization_id"
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
    const collection = app.findCollectionByNameOrId("pbc_5818181318");
    return app.delete(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})