/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Fetch related collections to get their IDs
  const usersCollection = app.findCollectionByNameOrId("users");

  const collection = new Collection({
    "createRule": "@request.auth.id != '' && (@request.auth.role = 'super_admin' || (@request.auth.role = 'church_admin' && @request.auth.organization_id = user_id.organization_id))",
    "deleteRule": "@request.auth.id != '' && (@request.auth.role = 'super_admin' || (@request.auth.role = 'church_admin' && @request.auth.organization_id = user_id.organization_id))",
    "fields":     [
          {
                "autogeneratePattern": "[a-z0-9]{15}",
                "hidden": false,
                "id": "text6988756782",
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
                "id": "relation2815768419",
                "name": "user_id",
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
                "id": "text2081107514",
                "name": "permission_name",
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
                "id": "relation2501289193",
                "name": "granted_by",
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
                "id": "autodate1052407306",
                "name": "granted_at",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "autodate",
                "onCreate": true,
                "onUpdate": false
          },
          {
                "hidden": false,
                "id": "autodate2841052971",
                "name": "created",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
          },
          {
                "hidden": false,
                "id": "autodate0625947657",
                "name": "updated",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
          }
    ],
    "id": "pbc_1890651936",
    "indexes": [],
    "listRule": "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.role = 'super_admin' || (@request.auth.role = 'church_admin' && @request.auth.organization_id = user_id.organization_id))",
    "name": "user_permissions",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.id != '' && (@request.auth.role = 'super_admin' || (@request.auth.role = 'church_admin' && @request.auth.organization_id = user_id.organization_id))",
    "viewRule": "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.role = 'super_admin' || (@request.auth.role = 'church_admin' && @request.auth.organization_id = user_id.organization_id))"
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
    const collection = app.findCollectionByNameOrId("pbc_1890651936");
    return app.delete(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})