/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("teams");

  const record0 = new Record(collection);
    const record0_organization_idLookup = app.findFirstRecordByFilter("organizations", "slug='iglesia-central'");
    if (!record0_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"slug='iglesia-central'\""); }
    record0.set("organization_id", record0_organization_idLookup.id);
    record0.set("name", "Alabanza");
    record0.set("description", "Equipo de m\u00fasica y adoraci\u00f3n");
    record0.set("type", "worship");
    const record0_leader_idLookup = app.findFirstRecordByFilter("users", "email='lider@iglesia.local'");
    if (!record0_leader_idLookup) { throw new Error("Lookup failed for leader_id: no record in 'users' matching \"email='lider@iglesia.local'\""); }
    record0.set("leader_id", record0_leader_idLookup.id);
    record0.set("status", "active");
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
    record1.set("name", "Audio");
    record1.set("description", "Equipo de sonido y t\u00e9cnica de audio");
    record1.set("type", "technical");
    record1.set("status", "active");
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
    const record2_organization_idLookup = app.findFirstRecordByFilter("organizations", "slug='iglesia-central'");
    if (!record2_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"slug='iglesia-central'\""); }
    record2.set("organization_id", record2_organization_idLookup.id);
    record2.set("name", "Video");
    record2.set("description", "Equipo de video y transmisi\u00f3n en vivo");
    record2.set("type", "technical");
    record2.set("status", "active");
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
    const record3_organization_idLookup = app.findFirstRecordByFilter("organizations", "slug='iglesia-central'");
    if (!record3_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"slug='iglesia-central'\""); }
    record3.set("organization_id", record3_organization_idLookup.id);
    record3.set("name", "Ujieres");
    record3.set("description", "Equipo de bienvenida y apoyo");
    record3.set("type", "support");
    record3.set("status", "active");
  try {
    app.save(record3);
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