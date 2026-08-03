/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("song_categories");

  const record0 = new Record(collection);
    record0.set("name", "Worship");
    record0.set("slug", "worship");
    record0.set("color", "#3B82F6");
    record0.set("icon", "music");
    const record0_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record0_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record0.set("organization_id", record0_organization_idLookup.id);
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
    record1.set("name", "Contemporary");
    record1.set("slug", "contemporary");
    record1.set("color", "#8B5CF6");
    record1.set("icon", "zap");
    const record1_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record1_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record1.set("organization_id", record1_organization_idLookup.id);
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
    record2.set("name", "Hymn");
    record2.set("slug", "hymn");
    record2.set("color", "#F59E0B");
    record2.set("icon", "book");
    const record2_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record2_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record2.set("organization_id", record2_organization_idLookup.id);
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
    record3.set("name", "Praise");
    record3.set("slug", "praise");
    record3.set("color", "#EF4444");
    record3.set("icon", "flame");
    const record3_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record3_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record3.set("organization_id", record3_organization_idLookup.id);
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
    record4.set("name", "Intercession");
    record4.set("slug", "intercession");
    record4.set("color", "#10B981");
    record4.set("icon", "hands-praying");
    const record4_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record4_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record4.set("organization_id", record4_organization_idLookup.id);
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