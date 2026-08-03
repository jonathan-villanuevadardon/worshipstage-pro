/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("songs");

  const record0 = new Record(collection);
    record0.set("title", "Eres Digno");
    record0.set("artist", "Marcos Witt");
    record0.set("key", "G");
    record0.set("tempo", 90);
    record0.set("genre", "Worship");
    record0.set("theme", ["Adoration"]);
    record0.set("difficulty", "Medium");
    record0.set("language", "Spanish");
    record0.set("status", "active");
    const record0_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record0_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record0.set("organization_id", record0_organization_idLookup.id);
    const record0_created_byLookup = app.findFirstRecordByFilter("users", "id != ''");
    if (!record0_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"id != ''\""); }
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
    record1.set("title", "Gracia Soberana");
    record1.set("artist", "Hillsong");
    record1.set("key", "D");
    record1.set("tempo", 85);
    record1.set("genre", "Worship");
    record1.set("theme", ["Grace"]);
    record1.set("difficulty", "Medium");
    record1.set("language", "Spanish");
    record1.set("status", "active");
    const record1_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record1_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record1.set("organization_id", record1_organization_idLookup.id);
    const record1_created_byLookup = app.findFirstRecordByFilter("users", "id != ''");
    if (!record1_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"id != ''\""); }
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
    record2.set("title", "Aleluya");
    record2.set("artist", "Leonard Cohen");
    record2.set("key", "C");
    record2.set("tempo", 75);
    record2.set("genre", "Hymn");
    record2.set("theme", ["Praise"]);
    record2.set("difficulty", "Easy");
    record2.set("language", "Spanish");
    record2.set("status", "active");
    const record2_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record2_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record2.set("organization_id", record2_organization_idLookup.id);
    const record2_created_byLookup = app.findFirstRecordByFilter("users", "id != ''");
    if (!record2_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"id != ''\""); }
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
    record3.set("title", "Tu Fidelidad");
    record3.set("artist", "Bethel Music");
    record3.set("key", "A");
    record3.set("tempo", 95);
    record3.set("genre", "Contemporary");
    record3.set("theme", ["Faith"]);
    record3.set("difficulty", "Hard");
    record3.set("language", "Spanish");
    record3.set("status", "active");
    const record3_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record3_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record3.set("organization_id", record3_organization_idLookup.id);
    const record3_created_byLookup = app.findFirstRecordByFilter("users", "id != ''");
    if (!record3_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"id != ''\""); }
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
    record4.set("title", "Esp\u00edritu Santo Ven");
    record4.set("artist", "Jes\u00fas Adri\u00e1n Romero");
    record4.set("key", "F");
    record4.set("tempo", 80);
    record4.set("genre", "Worship");
    record4.set("theme", ["Holy Spirit"]);
    record4.set("difficulty", "Medium");
    record4.set("language", "Spanish");
    record4.set("status", "active");
    const record4_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record4_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record4.set("organization_id", record4_organization_idLookup.id);
    const record4_created_byLookup = app.findFirstRecordByFilter("users", "id != ''");
    if (!record4_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"id != ''\""); }
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

  const record5 = new Record(collection);
    record5.set("title", "Consagraci\u00f3n Total");
    record5.set("artist", "Marcos Witt");
    record5.set("key", "Bb");
    record5.set("tempo", 88);
    record5.set("genre", "Worship");
    record5.set("theme", ["Dedication"]);
    record5.set("difficulty", "Medium");
    record5.set("language", "Spanish");
    record5.set("status", "active");
    const record5_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record5_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record5.set("organization_id", record5_organization_idLookup.id);
    const record5_created_byLookup = app.findFirstRecordByFilter("users", "id != ''");
    if (!record5_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"id != ''\""); }
    record5.set("created_by", record5_created_byLookup.id);
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
    record6.set("title", "Dios Es Amor");
    record6.set("artist", "Hillsong");
    record6.set("key", "E");
    record6.set("tempo", 92);
    record6.set("genre", "Contemporary");
    record6.set("theme", ["Love"]);
    record6.set("difficulty", "Medium");
    record6.set("language", "Spanish");
    record6.set("status", "active");
    const record6_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record6_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record6.set("organization_id", record6_organization_idLookup.id);
    const record6_created_byLookup = app.findFirstRecordByFilter("users", "id != ''");
    if (!record6_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"id != ''\""); }
    record6.set("created_by", record6_created_byLookup.id);
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
    record7.set("title", "Maravilloso Eres");
    record7.set("artist", "Jes\u00fas Adri\u00e1n Romero");
    record7.set("key", "G");
    record7.set("tempo", 86);
    record7.set("genre", "Worship");
    record7.set("theme", ["Adoration"]);
    record7.set("difficulty", "Easy");
    record7.set("language", "Spanish");
    record7.set("status", "active");
    const record7_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record7_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record7.set("organization_id", record7_organization_idLookup.id);
    const record7_created_byLookup = app.findFirstRecordByFilter("users", "id != ''");
    if (!record7_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"id != ''\""); }
    record7.set("created_by", record7_created_byLookup.id);
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
    record8.set("title", "Roca de Mi Salvaci\u00f3n");
    record8.set("artist", "Marcos Witt");
    record8.set("key", "D");
    record8.set("tempo", 84);
    record8.set("genre", "Hymn");
    record8.set("theme", ["Salvation"]);
    record8.set("difficulty", "Medium");
    record8.set("language", "Spanish");
    record8.set("status", "active");
    const record8_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record8_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record8.set("organization_id", record8_organization_idLookup.id);
    const record8_created_byLookup = app.findFirstRecordByFilter("users", "id != ''");
    if (!record8_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"id != ''\""); }
    record8.set("created_by", record8_created_byLookup.id);
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
    record9.set("title", "Fuego del Cielo");
    record9.set("artist", "Bethel Music");
    record9.set("key", "A");
    record9.set("tempo", 100);
    record9.set("genre", "Contemporary");
    record9.set("theme", ["Holy Spirit"]);
    record9.set("difficulty", "Hard");
    record9.set("language", "Spanish");
    record9.set("status", "active");
    const record9_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record9_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record9.set("organization_id", record9_organization_idLookup.id);
    const record9_created_byLookup = app.findFirstRecordByFilter("users", "id != ''");
    if (!record9_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"id != ''\""); }
    record9.set("created_by", record9_created_byLookup.id);
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
    record10.set("title", "Canta Alma M\u00eda");
    record10.set("artist", "Hillsong");
    record10.set("key", "C");
    record10.set("tempo", 78);
    record10.set("genre", "Worship");
    record10.set("theme", ["Joy"]);
    record10.set("difficulty", "Easy");
    record10.set("language", "Spanish");
    record10.set("status", "active");
    const record10_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record10_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record10.set("organization_id", record10_organization_idLookup.id);
    const record10_created_byLookup = app.findFirstRecordByFilter("users", "id != ''");
    if (!record10_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"id != ''\""); }
    record10.set("created_by", record10_created_byLookup.id);
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
    record11.set("title", "Jes\u00fas Es Mi Rey");
    record11.set("artist", "Jes\u00fas Adri\u00e1n Romero");
    record11.set("key", "F");
    record11.set("tempo", 90);
    record11.set("genre", "Contemporary");
    record11.set("theme", ["Jesus"]);
    record11.set("difficulty", "Medium");
    record11.set("language", "Spanish");
    record11.set("status", "active");
    const record11_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record11_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record11.set("organization_id", record11_organization_idLookup.id);
    const record11_created_byLookup = app.findFirstRecordByFilter("users", "id != ''");
    if (!record11_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"id != ''\""); }
    record11.set("created_by", record11_created_byLookup.id);
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
    record12.set("title", "Glorificado");
    record12.set("artist", "Marcos Witt");
    record12.set("key", "G");
    record12.set("tempo", 88);
    record12.set("genre", "Worship");
    record12.set("theme", ["Glory"]);
    record12.set("difficulty", "Medium");
    record12.set("language", "Spanish");
    record12.set("status", "active");
    const record12_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record12_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record12.set("organization_id", record12_organization_idLookup.id);
    const record12_created_byLookup = app.findFirstRecordByFilter("users", "id != ''");
    if (!record12_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"id != ''\""); }
    record12.set("created_by", record12_created_byLookup.id);
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
    record13.set("title", "Abba Padre");
    record13.set("artist", "Bethel Music");
    record13.set("key", "Bb");
    record13.set("tempo", 82);
    record13.set("genre", "Worship");
    record13.set("theme", ["Father"]);
    record13.set("difficulty", "Easy");
    record13.set("language", "Spanish");
    record13.set("status", "active");
    const record13_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record13_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record13.set("organization_id", record13_organization_idLookup.id);
    const record13_created_byLookup = app.findFirstRecordByFilter("users", "id != ''");
    if (!record13_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"id != ''\""); }
    record13.set("created_by", record13_created_byLookup.id);
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
    record14.set("title", "Resurrecci\u00f3n");
    record14.set("artist", "Hillsong");
    record14.set("key", "E");
    record14.set("tempo", 96);
    record14.set("genre", "Contemporary");
    record14.set("theme", ["Resurrection"]);
    record14.set("difficulty", "Hard");
    record14.set("language", "Spanish");
    record14.set("status", "active");
    const record14_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record14_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record14.set("organization_id", record14_organization_idLookup.id);
    const record14_created_byLookup = app.findFirstRecordByFilter("users", "id != ''");
    if (!record14_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"id != ''\""); }
    record14.set("created_by", record14_created_byLookup.id);
  try {
    app.save(record14);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record15 = new Record(collection);
    record15.set("title", "Santidad");
    record15.set("artist", "Jes\u00fas Adri\u00e1n Romero");
    record15.set("key", "D");
    record15.set("tempo", 80);
    record15.set("genre", "Hymn");
    record15.set("theme", ["Holiness"]);
    record15.set("difficulty", "Medium");
    record15.set("language", "Spanish");
    record15.set("status", "active");
    const record15_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record15_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record15.set("organization_id", record15_organization_idLookup.id);
    const record15_created_byLookup = app.findFirstRecordByFilter("users", "id != ''");
    if (!record15_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"id != ''\""); }
    record15.set("created_by", record15_created_byLookup.id);
  try {
    app.save(record15);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record16 = new Record(collection);
    record16.set("title", "Redentor M\u00edo");
    record16.set("artist", "Marcos Witt");
    record16.set("key", "A");
    record16.set("tempo", 85);
    record16.set("genre", "Worship");
    record16.set("theme", ["Redemption"]);
    record16.set("difficulty", "Medium");
    record16.set("language", "Spanish");
    record16.set("status", "active");
    const record16_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record16_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record16.set("organization_id", record16_organization_idLookup.id);
    const record16_created_byLookup = app.findFirstRecordByFilter("users", "id != ''");
    if (!record16_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"id != ''\""); }
    record16.set("created_by", record16_created_byLookup.id);
  try {
    app.save(record16);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record17 = new Record(collection);
    record17.set("title", "Paz Perfecta");
    record17.set("artist", "Bethel Music");
    record17.set("key", "G");
    record17.set("tempo", 76);
    record17.set("genre", "Worship");
    record17.set("theme", ["Peace"]);
    record17.set("difficulty", "Easy");
    record17.set("language", "Spanish");
    record17.set("status", "active");
    const record17_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record17_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record17.set("organization_id", record17_organization_idLookup.id);
    const record17_created_byLookup = app.findFirstRecordByFilter("users", "id != ''");
    if (!record17_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"id != ''\""); }
    record17.set("created_by", record17_created_byLookup.id);
  try {
    app.save(record17);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record18 = new Record(collection);
    record18.set("title", "Eternidad");
    record18.set("artist", "Hillsong");
    record18.set("key", "F");
    record18.set("tempo", 89);
    record18.set("genre", "Contemporary");
    record18.set("theme", ["Eternity"]);
    record18.set("difficulty", "Medium");
    record18.set("language", "Spanish");
    record18.set("status", "active");
    const record18_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record18_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record18.set("organization_id", record18_organization_idLookup.id);
    const record18_created_byLookup = app.findFirstRecordByFilter("users", "id != ''");
    if (!record18_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"id != ''\""); }
    record18.set("created_by", record18_created_byLookup.id);
  try {
    app.save(record18);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record19 = new Record(collection);
    record19.set("title", "Nombre Sobre Todo Nombre");
    record19.set("artist", "Jes\u00fas Adri\u00e1n Romero");
    record19.set("key", "C");
    record19.set("tempo", 91);
    record19.set("genre", "Worship");
    record19.set("theme", ["Jesus"]);
    record19.set("difficulty", "Medium");
    record19.set("language", "Spanish");
    record19.set("status", "active");
    const record19_organization_idLookup = app.findFirstRecordByFilter("organizations", "id != ''");
    if (!record19_organization_idLookup) { throw new Error("Lookup failed for organization_id: no record in 'organizations' matching \"id != ''\""); }
    record19.set("organization_id", record19_organization_idLookup.id);
    const record19_created_byLookup = app.findFirstRecordByFilter("users", "id != ''");
    if (!record19_created_byLookup) { throw new Error("Lookup failed for created_by: no record in 'users' matching \"id != ''\""); }
    record19.set("created_by", record19_created_byLookup.id);
  try {
    app.save(record19);
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