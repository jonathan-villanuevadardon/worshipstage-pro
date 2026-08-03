/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Fetch related collections to get their IDs
  const servicesCollection = app.findCollectionByNameOrId("services");
  const usersCollection = app.findCollectionByNameOrId("users");

  const collection = new Collection({
    "createRule": "@request.auth.id != '' && (@request.auth.role = 'super_admin' || (@request.auth.role = 'church_admin' && @request.auth.organization_id = service_id.organization_id))",
    "deleteRule": "@request.auth.id != '' && (created_by = @request.auth.id || @request.auth.role = 'super_admin' || (@request.auth.role = 'church_admin' && @request.auth.organization_id = service_id.organization_id))",
    "fields":     [
          {
                "autogeneratePattern": "[a-z0-9]{15}",
                "hidden": false,
                "id": "text7678003488",
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
                "id": "relation3347603122",
                "name": "service_id",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "relation",
                "cascadeDelete": false,
                "collectionId": servicesCollection.id,
                "displayFields": [],
                "maxSelect": 1,
                "minSelect": 0
          },
          {
                "hidden": false,
                "id": "relation8645286326",
                "name": "created_by",
                "presentable": false,
                "primaryKey": false,
                "required": true,
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
                "id": "text0407127309",
                "name": "content",
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
                "id": "autodate8741273312",
                "name": "created",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
          },
          {
                "hidden": false,
                "id": "autodate2749397360",
                "name": "updated",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
          }
    ],
    "id": "pbc_5716245809",
    "indexes": [],
    "listRule": "@request.auth.id != '' && @request.auth.organization_id = service_id.organization_id",
    "name": "service_notes",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.id != '' && (created_by = @request.auth.id || @request.auth.role = 'super_admin' || (@request.auth.role = 'church_admin' && @request.auth.organization_id = service_id.organization_id))",
    "viewRule": "@request.auth.id != '' && @request.auth.organization_id = service_id.organization_id"
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
    const collection = app.findCollectionByNameOrId("pbc_5716245809");
    return app.delete(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})