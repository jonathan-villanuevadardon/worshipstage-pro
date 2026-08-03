/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("songs");

  const record0 = new Record(collection);
    const record0_organization_idLookup = app.findFirstRecordByFilter("organizations", "slug='iglesia-central'");
    if (!record0_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"slug='iglesia-central'\""); }
    record0.set("organization_id", record0_organization_idLookup.id);
    record0.set("title", "Gracia Asombrosa");
    record0.set("artist", "John Newton");
    record0.set("composer", "John Newton");
    record0.set("category", "hymn");
    record0.set("bpm", 80);
    record0.set("key", "G");
    record0.set("time_signature", "4/4");
    record0.set("duration_seconds", 240);
    record0.set("version", 1);
    record0.set("is_archived", false);
    const record0_created_byLookup = app.findFirstRecordByFilter("users", "email='lider@iglesia.local'");
    if (!record0_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"email='lider@iglesia.local'\""); }
    record0.set("created_by", record0_created_byLookup.id);
    record0.set("notes", "Himno cl\u00e1sico de adoraci\u00f3n");
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
    record1.set("title", "Eres Digno");
    record1.set("artist", "Marcos Witt");
    record1.set("composer", "Marcos Witt");
    record1.set("category", "contemporary");
    record1.set("bpm", 120);
    record1.set("key", "D");
    record1.set("time_signature", "4/4");
    record1.set("duration_seconds", 300);
    record1.set("version", 1);
    record1.set("is_archived", false);
    const record1_created_byLookup = app.findFirstRecordByFilter("users", "email='lider@iglesia.local'");
    if (!record1_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"email='lider@iglesia.local'\""); }
    record1.set("created_by", record1_created_byLookup.id);
    record1.set("notes", "Canci\u00f3n contempor\u00e1nea de adoraci\u00f3n");
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
    record2.set("title", "Aleluya");
    record2.set("artist", "Hillsong United");
    record2.set("composer", "Hillsong United");
    record2.set("category", "worship");
    record2.set("bpm", 140);
    record2.set("key", "A");
    record2.set("time_signature", "4/4");
    record2.set("duration_seconds", 280);
    record2.set("version", 1);
    record2.set("is_archived", false);
    const record2_created_byLookup = app.findFirstRecordByFilter("users", "email='lider@iglesia.local'");
    if (!record2_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"email='lider@iglesia.local'\""); }
    record2.set("created_by", record2_created_byLookup.id);
    record2.set("notes", "Canci\u00f3n de alabanza moderna");
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
    record3.set("title", "Dios Es Amor");
    record3.set("artist", "Consagrados");
    record3.set("composer", "Consagrados");
    record3.set("category", "gospel");
    record3.set("bpm", 100);
    record3.set("key", "C");
    record3.set("time_signature", "4/4");
    record3.set("duration_seconds", 260);
    record3.set("version", 1);
    record3.set("is_archived", false);
    const record3_created_byLookup = app.findFirstRecordByFilter("users", "email='lider@iglesia.local'");
    if (!record3_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"email='lider@iglesia.local'\""); }
    record3.set("created_by", record3_created_byLookup.id);
    record3.set("notes", "Canci\u00f3n de gospel tradicional");
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
    const record4_organization_idLookup = app.findFirstRecordByFilter("organizations", "slug='iglesia-central'");
    if (!record4_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"slug='iglesia-central'\""); }
    record4.set("organization_id", record4_organization_idLookup.id);
    record4.set("title", "Yo Vivo Por Ti");
    record4.set("artist", "Bethel Music");
    record4.set("composer", "Bethel Music");
    record4.set("category", "worship");
    record4.set("bpm", 110);
    record4.set("key", "E");
    record4.set("time_signature", "4/4");
    record4.set("duration_seconds", 290);
    record4.set("version", 1);
    record4.set("is_archived", false);
    const record4_created_byLookup = app.findFirstRecordByFilter("users", "email='lider@iglesia.local'");
    if (!record4_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"email='lider@iglesia.local'\""); }
    record4.set("created_by", record4_created_byLookup.id);
    record4.set("notes", "Canci\u00f3n de adoraci\u00f3n profunda");
  try {
    app.save(record4);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record5 = new Record(collection);
    const record5_organization_idLookup = app.findFirstRecordByFilter("organizations", "slug='iglesia-central'");
    if (!record5_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"slug='iglesia-central'\""); }
    record5.set("organization_id", record5_organization_idLookup.id);
    record5.set("title", "Firme y Adelante");
    record5.set("artist", "Himnario Cristiano");
    record5.set("composer", "Himnario Cristiano");
    record5.set("category", "hymn");
    record5.set("bpm", 90);
    record5.set("key", "F");
    record5.set("time_signature", "4/4");
    record5.set("duration_seconds", 250);
    record5.set("version", 1);
    record5.set("is_archived", false);
    const record5_created_byLookup = app.findFirstRecordByFilter("users", "email='lider@iglesia.local'");
    if (!record5_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"email='lider@iglesia.local'\""); }
    record5.set("created_by", record5_created_byLookup.id);
    record5.set("notes", "Himno de fe y confianza");
  try {
    app.save(record5);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record6 = new Record(collection);
    const record6_organization_idLookup = app.findFirstRecordByFilter("organizations", "slug='iglesia-central'");
    if (!record6_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"slug='iglesia-central'\""); }
    record6.set("organization_id", record6_organization_idLookup.id);
    record6.set("title", "Canta Aleluya");
    record6.set("artist", "Jenn Johnson");
    record6.set("composer", "Jenn Johnson");
    record6.set("category", "contemporary");
    record6.set("bpm", 130);
    record6.set("key", "B");
    record6.set("time_signature", "4/4");
    record6.set("duration_seconds", 310);
    record6.set("version", 1);
    record6.set("is_archived", false);
    const record6_created_byLookup = app.findFirstRecordByFilter("users", "email='lider@iglesia.local'");
    if (!record6_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"email='lider@iglesia.local'\""); }
    record6.set("created_by", record6_created_byLookup.id);
    record6.set("notes", "Canci\u00f3n de alabanza energizante");
  try {
    app.save(record6);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record7 = new Record(collection);
    const record7_organization_idLookup = app.findFirstRecordByFilter("organizations", "slug='iglesia-central'");
    if (!record7_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"slug='iglesia-central'\""); }
    record7.set("organization_id", record7_organization_idLookup.id);
    record7.set("title", "Eres Mi Rey");
    record7.set("artist", "Redimi2");
    record7.set("composer", "Redimi2");
    record7.set("category", "gospel");
    record7.set("bpm", 95);
    record7.set("key", "G");
    record7.set("time_signature", "4/4");
    record7.set("duration_seconds", 270);
    record7.set("version", 1);
    record7.set("is_archived", false);
    const record7_created_byLookup = app.findFirstRecordByFilter("users", "email='lider@iglesia.local'");
    if (!record7_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"email='lider@iglesia.local'\""); }
    record7.set("created_by", record7_created_byLookup.id);
    record7.set("notes", "Canci\u00f3n de adoraci\u00f3n urbana");
  try {
    app.save(record7);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record8 = new Record(collection);
    const record8_organization_idLookup = app.findFirstRecordByFilter("organizations", "slug='iglesia-central'");
    if (!record8_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"slug='iglesia-central'\""); }
    record8.set("organization_id", record8_organization_idLookup.id);
    record8.set("title", "Maravilloso Es");
    record8.set("artist", "Marcos Brunet");
    record8.set("composer", "Marcos Brunet");
    record8.set("category", "worship");
    record8.set("bpm", 115);
    record8.set("key", "D");
    record8.set("time_signature", "4/4");
    record8.set("duration_seconds", 295);
    record8.set("version", 1);
    record8.set("is_archived", false);
    const record8_created_byLookup = app.findFirstRecordByFilter("users", "email='lider@iglesia.local'");
    if (!record8_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"email='lider@iglesia.local'\""); }
    record8.set("created_by", record8_created_byLookup.id);
    record8.set("notes", "Canci\u00f3n de adoraci\u00f3n contemplativa");
  try {
    app.save(record8);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record9 = new Record(collection);
    const record9_organization_idLookup = app.findFirstRecordByFilter("organizations", "slug='iglesia-central'");
    if (!record9_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"slug='iglesia-central'\""); }
    record9.set("organization_id", record9_organization_idLookup.id);
    record9.set("title", "Sublime Gracia");
    record9.set("artist", "Himnario Antiguo");
    record9.set("composer", "Himnario Antiguo");
    record9.set("category", "hymn");
    record9.set("bpm", 75);
    record9.set("key", "A");
    record9.set("time_signature", "4/4");
    record9.set("duration_seconds", 240);
    record9.set("version", 1);
    record9.set("is_archived", false);
    const record9_created_byLookup = app.findFirstRecordByFilter("users", "email='lider@iglesia.local'");
    if (!record9_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"email='lider@iglesia.local'\""); }
    record9.set("created_by", record9_created_byLookup.id);
    record9.set("notes", "Himno cl\u00e1sico de gracia");
  try {
    app.save(record9);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record10 = new Record(collection);
    const record10_organization_idLookup = app.findFirstRecordByFilter("organizations", "slug='iglesia-central'");
    if (!record10_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"slug='iglesia-central'\""); }
    record10.set("organization_id", record10_organization_idLookup.id);
    record10.set("title", "Vencedor");
    record10.set("artist", "Elevation Worship");
    record10.set("composer", "Elevation Worship");
    record10.set("category", "contemporary");
    record10.set("bpm", 125);
    record10.set("key", "C");
    record10.set("time_signature", "4/4");
    record10.set("duration_seconds", 305);
    record10.set("version", 1);
    record10.set("is_archived", false);
    const record10_created_byLookup = app.findFirstRecordByFilter("users", "email='lider@iglesia.local'");
    if (!record10_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"email='lider@iglesia.local'\""); }
    record10.set("created_by", record10_created_byLookup.id);
    record10.set("notes", "Canci\u00f3n de victoria y triunfo");
  try {
    app.save(record10);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record11 = new Record(collection);
    const record11_organization_idLookup = app.findFirstRecordByFilter("organizations", "slug='iglesia-central'");
    if (!record11_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"slug='iglesia-central'\""); }
    record11.set("organization_id", record11_organization_idLookup.id);
    record11.set("title", "Eres Santo");
    record11.set("artist", "Christy Nockels");
    record11.set("composer", "Christy Nockels");
    record11.set("category", "worship");
    record11.set("bpm", 105);
    record11.set("key", "E");
    record11.set("time_signature", "4/4");
    record11.set("duration_seconds", 280);
    record11.set("version", 1);
    record11.set("is_archived", false);
    const record11_created_byLookup = app.findFirstRecordByFilter("users", "email='lider@iglesia.local'");
    if (!record11_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"email='lider@iglesia.local'\""); }
    record11.set("created_by", record11_created_byLookup.id);
    record11.set("notes", "Canci\u00f3n de santidad divina");
  try {
    app.save(record11);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record12 = new Record(collection);
    const record12_organization_idLookup = app.findFirstRecordByFilter("organizations", "slug='iglesia-central'");
    if (!record12_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"slug='iglesia-central'\""); }
    record12.set("organization_id", record12_organization_idLookup.id);
    record12.set("title", "Poder en la Sangre");
    record12.set("artist", "Lewis E. Jones");
    record12.set("composer", "Lewis E. Jones");
    record12.set("category", "gospel");
    record12.set("bpm", 110);
    record12.set("key", "F");
    record12.set("time_signature", "4/4");
    record12.set("duration_seconds", 265);
    record12.set("version", 1);
    record12.set("is_archived", false);
    const record12_created_byLookup = app.findFirstRecordByFilter("users", "email='lider@iglesia.local'");
    if (!record12_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"email='lider@iglesia.local'\""); }
    record12.set("created_by", record12_created_byLookup.id);
    record12.set("notes", "Canci\u00f3n de redenci\u00f3n");
  try {
    app.save(record12);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record13 = new Record(collection);
    const record13_organization_idLookup = app.findFirstRecordByFilter("organizations", "slug='iglesia-central'");
    if (!record13_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"slug='iglesia-central'\""); }
    record13.set("organization_id", record13_organization_idLookup.id);
    record13.set("title", "Infinito");
    record13.set("artist", "Skillet");
    record13.set("composer", "Skillet");
    record13.set("category", "contemporary");
    record13.set("bpm", 135);
    record13.set("key", "G");
    record13.set("time_signature", "4/4");
    record13.set("duration_seconds", 320);
    record13.set("version", 1);
    record13.set("is_archived", false);
    const record13_created_byLookup = app.findFirstRecordByFilter("users", "email='lider@iglesia.local'");
    if (!record13_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"email='lider@iglesia.local'\""); }
    record13.set("created_by", record13_created_byLookup.id);
    record13.set("notes", "Canci\u00f3n de adoraci\u00f3n moderna y din\u00e1mica");
  try {
    app.save(record13);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record14 = new Record(collection);
    const record14_organization_idLookup = app.findFirstRecordByFilter("organizations", "slug='iglesia-central'");
    if (!record14_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"slug='iglesia-central'\""); }
    record14.set("organization_id", record14_organization_idLookup.id);
    record14.set("title", "Refugio Seguro");
    record14.set("artist", "Himnario Moderno");
    record14.set("composer", "Himnario Moderno");
    record14.set("category", "hymn");
    record14.set("bpm", 85);
    record14.set("key", "B");
    record14.set("time_signature", "4/4");
    record14.set("duration_seconds", 255);
    record14.set("version", 1);
    record14.set("is_archived", false);
    const record14_created_byLookup = app.findFirstRecordByFilter("users", "email='lider@iglesia.local'");
    if (!record14_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"email='lider@iglesia.local'\""); }
    record14.set("created_by", record14_created_byLookup.id);
    record14.set("notes", "Himno de protecci\u00f3n divina");
  try {
    app.save(record14);
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