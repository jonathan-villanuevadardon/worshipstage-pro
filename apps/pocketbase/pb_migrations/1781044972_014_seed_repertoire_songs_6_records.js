/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("repertoire_songs");

  const record0 = new Record(collection);
    const record0_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name='Servicio Dominical - Semana 1'");
    if (!record0_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name='Servicio Dominical - Semana 1'\""); }
    record0.set("repertoire_id", record0_repertoire_idLookup.id);
    const record0_song_idLookup = app.findFirstRecordByFilter("songs", "title='Gracia Asombrosa'");
    if (!record0_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title='Gracia Asombrosa'\""); }
    record0.set("song_id", record0_song_idLookup.id);
    record0.set("order", 1);
    const record0_leader_idLookup = app.findFirstRecordByFilter("users", "email='lider@iglesia.local'");
    if (!record0_leader_idLookup) { throw new Error("Lookup failed for leader_id: no record in 'users' matching \"email='lider@iglesia.local'\""); }
    record0.set("leader_id", record0_leader_idLookup.id);
    record0.set("notes", "Canci\u00f3n de apertura");
    record0.set("duration_seconds", 240);
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
    const record1_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name='Servicio Dominical - Semana 1'");
    if (!record1_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name='Servicio Dominical - Semana 1'\""); }
    record1.set("repertoire_id", record1_repertoire_idLookup.id);
    const record1_song_idLookup = app.findFirstRecordByFilter("songs", "title='Eres Digno'");
    if (!record1_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title='Eres Digno'\""); }
    record1.set("song_id", record1_song_idLookup.id);
    record1.set("order", 2);
    const record1_leader_idLookup = app.findFirstRecordByFilter("users", "email='lider@iglesia.local'");
    if (!record1_leader_idLookup) { throw new Error("Lookup failed for leader_id: no record in 'users' matching \"email='lider@iglesia.local'\""); }
    record1.set("leader_id", record1_leader_idLookup.id);
    record1.set("notes", "Canci\u00f3n de adoraci\u00f3n");
    record1.set("duration_seconds", 300);
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
    const record2_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name='Servicio Dominical - Semana 1'");
    if (!record2_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name='Servicio Dominical - Semana 1'\""); }
    record2.set("repertoire_id", record2_repertoire_idLookup.id);
    const record2_song_idLookup = app.findFirstRecordByFilter("songs", "title='Aleluya'");
    if (!record2_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title='Aleluya'\""); }
    record2.set("song_id", record2_song_idLookup.id);
    record2.set("order", 3);
    const record2_leader_idLookup = app.findFirstRecordByFilter("users", "email='lider@iglesia.local'");
    if (!record2_leader_idLookup) { throw new Error("Lookup failed for leader_id: no record in 'users' matching \"email='lider@iglesia.local'\""); }
    record2.set("leader_id", record2_leader_idLookup.id);
    record2.set("notes", "Canci\u00f3n de alabanza");
    record2.set("duration_seconds", 280);
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
    const record3_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name='Servicio Especial - Adoración'");
    if (!record3_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name='Servicio Especial - Adoración'\""); }
    record3.set("repertoire_id", record3_repertoire_idLookup.id);
    const record3_song_idLookup = app.findFirstRecordByFilter("songs", "title='Yo Vivo Por Ti'");
    if (!record3_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title='Yo Vivo Por Ti'\""); }
    record3.set("song_id", record3_song_idLookup.id);
    record3.set("order", 1);
    const record3_leader_idLookup = app.findFirstRecordByFilter("users", "email='lider@iglesia.local'");
    if (!record3_leader_idLookup) { throw new Error("Lookup failed for leader_id: no record in 'users' matching \"email='lider@iglesia.local'\""); }
    record3.set("leader_id", record3_leader_idLookup.id);
    record3.set("notes", "Adoraci\u00f3n profunda");
    record3.set("duration_seconds", 290);
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
    const record4_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name='Servicio Especial - Adoración'");
    if (!record4_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name='Servicio Especial - Adoración'\""); }
    record4.set("repertoire_id", record4_repertoire_idLookup.id);
    const record4_song_idLookup = app.findFirstRecordByFilter("songs", "title='Maravilloso Es'");
    if (!record4_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title='Maravilloso Es'\""); }
    record4.set("song_id", record4_song_idLookup.id);
    record4.set("order", 2);
    const record4_leader_idLookup = app.findFirstRecordByFilter("users", "email='lider@iglesia.local'");
    if (!record4_leader_idLookup) { throw new Error("Lookup failed for leader_id: no record in 'users' matching \"email='lider@iglesia.local'\""); }
    record4.set("leader_id", record4_leader_idLookup.id);
    record4.set("notes", "Adoraci\u00f3n contemplativa");
    record4.set("duration_seconds", 295);
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
    const record5_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name='Servicio Especial - Adoración'");
    if (!record5_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name='Servicio Especial - Adoración'\""); }
    record5.set("repertoire_id", record5_repertoire_idLookup.id);
    const record5_song_idLookup = app.findFirstRecordByFilter("songs", "title='Eres Santo'");
    if (!record5_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title='Eres Santo'\""); }
    record5.set("song_id", record5_song_idLookup.id);
    record5.set("order", 3);
    const record5_leader_idLookup = app.findFirstRecordByFilter("users", "email='lider@iglesia.local'");
    if (!record5_leader_idLookup) { throw new Error("Lookup failed for leader_id: no record in 'users' matching \"email='lider@iglesia.local'\""); }
    record5.set("leader_id", record5_leader_idLookup.id);
    record5.set("notes", "Adoraci\u00f3n de santidad");
    record5.set("duration_seconds", 280);
  try {
    app.save(record5);
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