/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("repertoires");

  const record0 = new Record(collection);
    const record0_organization_idLookup = app.findFirstRecordByFilter("organizations", "slug='iglesia-central'");
    if (!record0_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"slug='iglesia-central'\""); }
    record0.set("organization_id", record0_organization_idLookup.id);
    record0.set("name", "Servicio Dominical - Semana 1");
    record0.set("description", "Repertorio para el servicio dominical de la primera semana");
    const record0_created_byLookup = app.findFirstRecordByFilter("users", "email='lider@iglesia.local'");
    if (!record0_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"email='lider@iglesia.local'\""); }
    record0.set("created_by", record0_created_byLookup.id);
    record0.set("status", "published");
  try {
    app.save(record0);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record1 = new Record(collection);
    const record1_organization_idLookup = app.findFirstRecordByFilter("organizations", "slug='iglesia-central'");
    if (!record1_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"slug='iglesia-central'\""); }
    record1.set("organization_id", record1_organization_idLookup.id);
    record1.set("name", "Servicio Especial - Adoraci\u00f3n");
    record1.set("description", "Repertorio especial enfocado en adoraci\u00f3n profunda");
    const record1_created_byLookup = app.findFirstRecordByFilter("users", "email='lider@iglesia.local'");
    if (!record1_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"email='lider@iglesia.local'\""); }
    record1.set("created_by", record1_created_byLookup.id);
    record1.set("status", "draft");
  try {
    app.save(record1);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})