/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");
  collection.listRule = "@request.auth.id != '' && (@request.auth.role = 'super_admin' || @request.auth.organization_id = organization_id)";
  collection.viewRule = "@request.auth.id != '' && (id = @request.auth.id || @request.auth.role = 'super_admin' || @request.auth.organization_id = organization_id)";
  collection.updateRule = "@request.auth.id != '' && (id = @request.auth.id || @request.auth.role = 'super_admin' || (@request.auth.role = 'church_admin' && @request.auth.organization_id = organization_id))";
  collection.deleteRule = "@request.auth.id != '' && (@request.auth.role = 'super_admin' || (@request.auth.role = 'church_admin' && @request.auth.organization_id = organization_id))";
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("users");
  collection.listRule = "id = @request.auth.id";
  collection.viewRule = "id = @request.auth.id";
  collection.createRule = "";
  collection.updateRule = "id = @request.auth.id";
  collection.deleteRule = "id = @request.auth.id";
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})