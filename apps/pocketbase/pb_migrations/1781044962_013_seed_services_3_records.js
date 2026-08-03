/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("services");

  const record0 = new Record(collection);
    const record0_organization_idLookup = app.findFirstRecordByFilter("organizations", "slug='iglesia-central'");
    if (!record0_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"slug='iglesia-central'\""); }
    record0.set("organization_id", record0_organization_idLookup.id);
    record0.set("title", "Servicio Dominical - Semana 1");
    record0.set("date", "2025-02-09");
    record0.set("start_time", "10:00");
    record0.set("end_time", "11:30");
    record0.set("location", "Santuario Principal");
    record0.set("theme", "Fe y Confianza");
    record0.set("sermon_title", "Caminando en Fe");
    const record0_preacher_idLookup = app.findFirstRecordByFilter("users", "email='pastor@iglesia.local'");
    if (!record0_preacher_idLookup) { throw new Error("Lookup failed for preacher_id: no record in 'users' matching \"email='pastor@iglesia.local'\""); }
    record0.set("preacher_id", record0_preacher_idLookup.id);
    const record0_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name='Servicio Dominical - Semana 1'");
    if (!record0_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name='Servicio Dominical - Semana 1'\""); }
    record0.set("repertoire_id", record0_repertoire_idLookup.id);
    record0.set("status", "scheduled");
    record0.set("notes", "Servicio regular del domingo");
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
    record1.set("title", "Servicio Dominical - Semana 2");
    record1.set("date", "2025-02-16");
    record1.set("start_time", "10:00");
    record1.set("end_time", "11:30");
    record1.set("location", "Santuario Principal");
    record1.set("theme", "Amor Divino");
    record1.set("sermon_title", "El Amor de Dios");
    const record1_preacher_idLookup = app.findFirstRecordByFilter("users", "email='pastor@iglesia.local'");
    if (!record1_preacher_idLookup) { throw new Error("Lookup failed for preacher_id: no record in 'users' matching \"email='pastor@iglesia.local'\""); }
    record1.set("preacher_id", record1_preacher_idLookup.id);
    record1.set("status", "planning");
    record1.set("notes", "Servicio regular del domingo");
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
    record2.set("title", "Servicio Dominical - Semana 3");
    record2.set("date", "2025-02-23");
    record2.set("start_time", "10:00");
    record2.set("end_time", "11:30");
    record2.set("location", "Santuario Principal");
    record2.set("theme", "Esperanza Eterna");
    record2.set("sermon_title", "Viviendo en Esperanza");
    const record2_preacher_idLookup = app.findFirstRecordByFilter("users", "email='pastor@iglesia.local'");
    if (!record2_preacher_idLookup) { throw new Error("Lookup failed for preacher_id: no record in 'users' matching \"email='pastor@iglesia.local'\""); }
    record2.set("preacher_id", record2_preacher_idLookup.id);
    record2.set("status", "planning");
    record2.set("notes", "Servicio regular del domingo");
  try {
    app.save(record2);
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