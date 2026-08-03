/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("services");
  collection.createRule = "@request.auth.id != '' && (@request.auth.role = 'worship_leader' || @request.auth.role = 'pastor' || @request.auth.role = 'super_admin' || (@request.auth.role = 'church_admin' && @request.auth.organization_id = organization_id))";
  collection.updateRule = "@request.auth.id != '' && (@request.auth.role = 'worship_leader' || @request.auth.role = 'pastor' || @request.auth.role = 'super_admin' || (@request.auth.role = 'church_admin' && @request.auth.organization_id = organization_id))";
  collection.deleteRule = "@request.auth.id != '' && (@request.auth.role = 'worship_leader' || @request.auth.role = 'pastor' || @request.auth.role = 'super_admin' || (@request.auth.role = 'church_admin' && @request.auth.organization_id = organization_id))";
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("services");
  collection.createRule = "@request.auth.id != '' && (@request.auth.role = 'pastor' || @request.auth.role = 'super_admin' || (@request.auth.role = 'church_admin' && @request.auth.organization_id = organization_id))";
  collection.updateRule = "@request.auth.id != '' && (@request.auth.role = 'pastor' || @request.auth.role = 'super_admin' || (@request.auth.role = 'church_admin' && @request.auth.organization_id = organization_id))";
  collection.deleteRule = "@request.auth.id != '' && (@request.auth.role = 'pastor' || @request.auth.role = 'super_admin' || (@request.auth.role = 'church_admin' && @request.auth.organization_id = organization_id))";
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})