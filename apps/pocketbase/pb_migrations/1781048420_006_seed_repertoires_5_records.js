/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("repertoires");

  const record0 = new Record(collection);
    record0.set("name", "Domingo 15 de Diciembre - Adoraci\u00f3n");
    record0.set("description", "Servicio de adoraci\u00f3n para el domingo 15 de diciembre");
    record0.set("service_type", "Sunday Service");
    record0.set("status", "published");
    record0.set("song_count", 5);
    record0.set("total_duration", 1160);
    const record0_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record0_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record0.set("organization_id", record0_organization_idLookup.id);
    const record0_created_byLookup = app.findFirstRecordByFilter("users", "role = 'super_admin' || role = 'church_admin'");
    if (!record0_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"role = 'super_admin' || role = 'church_admin'\""); }
    record0.set("created_by", record0_created_byLookup.id);
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
    record1.set("name", "Reuni\u00f3n de Oraci\u00f3n - Intercesi\u00f3n");
    record1.set("description", "Servicio de oraci\u00f3n con \u00e9nfasis en intercesi\u00f3n");
    record1.set("service_type", "Prayer Meeting");
    record1.set("status", "published");
    record1.set("song_count", 4);
    record1.set("total_duration", 955);
    const record1_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record1_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record1.set("organization_id", record1_organization_idLookup.id);
    const record1_created_byLookup = app.findFirstRecordByFilter("users", "role = 'super_admin' || role = 'church_admin'");
    if (!record1_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"role = 'super_admin' || role = 'church_admin'\""); }
    record1.set("created_by", record1_created_byLookup.id);
  try {
    app.save(record1);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record2 = new Record(collection);
    record2.set("name", "Servicio Juvenil - Energ\u00eda");
    record2.set("description", "Servicio especial para j\u00f3venes con energ\u00eda y dinamismo");
    record2.set("service_type", "Youth Service");
    record2.set("status", "published");
    record2.set("song_count", 5);
    record2.set("total_duration", 1215);
    const record2_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record2_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record2.set("organization_id", record2_organization_idLookup.id);
    const record2_created_byLookup = app.findFirstRecordByFilter("users", "role = 'super_admin' || role = 'church_admin'");
    if (!record2_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"role = 'super_admin' || role = 'church_admin'\""); }
    record2.set("created_by", record2_created_byLookup.id);
  try {
    app.save(record2);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record3 = new Record(collection);
    record3.set("name", "Boda - Ceremonia");
    record3.set("description", "Repertorio para ceremonia de boda");
    record3.set("service_type", "Wedding");
    record3.set("status", "draft");
    record3.set("song_count", 4);
    record3.set("total_duration", 960);
    const record3_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record3_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record3.set("organization_id", record3_organization_idLookup.id);
    const record3_created_byLookup = app.findFirstRecordByFilter("users", "role = 'super_admin' || role = 'church_admin'");
    if (!record3_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"role = 'super_admin' || role = 'church_admin'\""); }
    record3.set("created_by", record3_created_byLookup.id);
  try {
    app.save(record3);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record4 = new Record(collection);
    record4.set("name", "Domingo 22 de Diciembre - Navidad");
    record4.set("description", "Servicio especial de Navidad con repertorio festivo");
    record4.set("service_type", "Special Event");
    record4.set("status", "draft");
    record4.set("song_count", 6);
    record4.set("total_duration", 1450);
    const record4_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record4_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record4.set("organization_id", record4_organization_idLookup.id);
    const record4_created_byLookup = app.findFirstRecordByFilter("users", "role = 'super_admin' || role = 'church_admin'");
    if (!record4_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"role = 'super_admin' || role = 'church_admin'\""); }
    record4.set("created_by", record4_created_byLookup.id);
  try {
    app.save(record4);
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