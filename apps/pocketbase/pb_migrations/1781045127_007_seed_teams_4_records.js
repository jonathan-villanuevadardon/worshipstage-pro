/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("teams");

  const record0 = new Record(collection);
    record0.set("name", "Alabanza");
    record0.set("type", "worship");
    const record0_leader_idLookup = app.findFirstRecordByFilter("users", "email='lider@iglesia.local'");
    if (!record0_leader_idLookup) { throw new Error("Lookup failed for leader_id: no record in 'users' matching \"email='lider@iglesia.local'\""); }
    record0.set("leader_id", record0_leader_idLookup.id);
    const record0_organization_idLookup = app.findFirstRecordByFilter("organizations", "slug='iglesia-central'");
    if (!record0_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"slug='iglesia-central'\""); }
    record0.set("organization_id", record0_organization_idLookup.id);
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
    record1.set("name", "Audio");
    record1.set("type", "technical");
    const record1_leader_idLookup = app.findFirstRecordByFilter("users", "email='pastor@iglesia.local'");
    if (!record1_leader_idLookup) { throw new Error("Lookup failed for leader_id: no record in 'users' matching \"email='pastor@iglesia.local'\""); }
    record1.set("leader_id", record1_leader_idLookup.id);
    const record1_organization_idLookup = app.findFirstRecordByFilter("organizations", "slug='iglesia-central'");
    if (!record1_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"slug='iglesia-central'\""); }
    record1.set("organization_id", record1_organization_idLookup.id);
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
    record2.set("name", "Video");
    record2.set("type", "technical");
    const record2_leader_idLookup = app.findFirstRecordByFilter("users", "email='pastor@iglesia.local'");
    if (!record2_leader_idLookup) { throw new Error("Lookup failed for leader_id: no record in 'users' matching \"email='pastor@iglesia.local'\""); }
    record2.set("leader_id", record2_leader_idLookup.id);
    const record2_organization_idLookup = app.findFirstRecordByFilter("organizations", "slug='iglesia-central'");
    if (!record2_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"slug='iglesia-central'\""); }
    record2.set("organization_id", record2_organization_idLookup.id);
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
    record3.set("name", "Ujieres");
    record3.set("type", "support");
    const record3_leader_idLookup = app.findFirstRecordByFilter("users", "email='voluntario@iglesia.local'");
    if (!record3_leader_idLookup) { throw new Error("Lookup failed for leader_id: no record in 'users' matching \"email='voluntario@iglesia.local'\""); }
    record3.set("leader_id", record3_leader_idLookup.id);
    const record3_organization_idLookup = app.findFirstRecordByFilter("organizations", "slug='iglesia-central'");
    if (!record3_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"slug='iglesia-central'\""); }
    record3.set("organization_id", record3_organization_idLookup.id);
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