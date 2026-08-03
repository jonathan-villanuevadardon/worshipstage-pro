/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("repertoire_songs");

  const record0 = new Record(collection);
    const record0_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name = 'Domingo 15 de Diciembre - Adoración'");
    if (!record0_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name = 'Domingo 15 de Diciembre - Adoración'\""); }
    record0.set("repertoire_id", record0_repertoire_idLookup.id);
    const record0_song_idLookup = app.findFirstRecordByFilter("songs", "title = 'Eres Digno'");
    if (!record0_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title = 'Eres Digno'\""); }
    record0.set("song_id", record0_song_idLookup.id);
    record0.set("order", 1);
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
    const record1_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name = 'Domingo 15 de Diciembre - Adoración'");
    if (!record1_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name = 'Domingo 15 de Diciembre - Adoración'\""); }
    record1.set("repertoire_id", record1_repertoire_idLookup.id);
    const record1_song_idLookup = app.findFirstRecordByFilter("songs", "title = 'Gracia Soberana'");
    if (!record1_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title = 'Gracia Soberana'\""); }
    record1.set("song_id", record1_song_idLookup.id);
    record1.set("order", 2);
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
    const record2_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name = 'Domingo 15 de Diciembre - Adoración'");
    if (!record2_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name = 'Domingo 15 de Diciembre - Adoración'\""); }
    record2.set("repertoire_id", record2_repertoire_idLookup.id);
    const record2_song_idLookup = app.findFirstRecordByFilter("songs", "title = 'Aleluya'");
    if (!record2_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title = 'Aleluya'\""); }
    record2.set("song_id", record2_song_idLookup.id);
    record2.set("order", 3);
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
    const record3_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name = 'Domingo 15 de Diciembre - Adoración'");
    if (!record3_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name = 'Domingo 15 de Diciembre - Adoración'\""); }
    record3.set("repertoire_id", record3_repertoire_idLookup.id);
    const record3_song_idLookup = app.findFirstRecordByFilter("songs", "title = 'Tu Fidelidad'");
    if (!record3_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title = 'Tu Fidelidad'\""); }
    record3.set("song_id", record3_song_idLookup.id);
    record3.set("order", 4);
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
    const record4_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name = 'Domingo 15 de Diciembre - Adoración'");
    if (!record4_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name = 'Domingo 15 de Diciembre - Adoración'\""); }
    record4.set("repertoire_id", record4_repertoire_idLookup.id);
    const record4_song_idLookup = app.findFirstRecordByFilter("songs", "title = 'Espíritu Santo Ven'");
    if (!record4_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title = 'Espíritu Santo Ven'\""); }
    record4.set("song_id", record4_song_idLookup.id);
    record4.set("order", 5);
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
    const record5_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name = 'Reunión de Oración - Intercesión'");
    if (!record5_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name = 'Reunión de Oración - Intercesión'\""); }
    record5.set("repertoire_id", record5_repertoire_idLookup.id);
    const record5_song_idLookup = app.findFirstRecordByFilter("songs", "title = 'Consagración Total'");
    if (!record5_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title = 'Consagración Total'\""); }
    record5.set("song_id", record5_song_idLookup.id);
    record5.set("order", 1);
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
    const record6_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name = 'Reunión de Oración - Intercesión'");
    if (!record6_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name = 'Reunión de Oración - Intercesión'\""); }
    record6.set("repertoire_id", record6_repertoire_idLookup.id);
    const record6_song_idLookup = app.findFirstRecordByFilter("songs", "title = 'Dios Es Amor'");
    if (!record6_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title = 'Dios Es Amor'\""); }
    record6.set("song_id", record6_song_idLookup.id);
    record6.set("order", 2);
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
    const record7_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name = 'Reunión de Oración - Intercesión'");
    if (!record7_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name = 'Reunión de Oración - Intercesión'\""); }
    record7.set("repertoire_id", record7_repertoire_idLookup.id);
    const record7_song_idLookup = app.findFirstRecordByFilter("songs", "title = 'Maravilloso Eres'");
    if (!record7_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title = 'Maravilloso Eres'\""); }
    record7.set("song_id", record7_song_idLookup.id);
    record7.set("order", 3);
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
    const record8_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name = 'Reunión de Oración - Intercesión'");
    if (!record8_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name = 'Reunión de Oración - Intercesión'\""); }
    record8.set("repertoire_id", record8_repertoire_idLookup.id);
    const record8_song_idLookup = app.findFirstRecordByFilter("songs", "title = 'Roca de Mi Salvación'");
    if (!record8_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title = 'Roca de Mi Salvación'\""); }
    record8.set("song_id", record8_song_idLookup.id);
    record8.set("order", 4);
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
    const record9_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name = 'Servicio Juvenil - Energía'");
    if (!record9_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name = 'Servicio Juvenil - Energía'\""); }
    record9.set("repertoire_id", record9_repertoire_idLookup.id);
    const record9_song_idLookup = app.findFirstRecordByFilter("songs", "title = 'Fuego del Cielo'");
    if (!record9_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title = 'Fuego del Cielo'\""); }
    record9.set("song_id", record9_song_idLookup.id);
    record9.set("order", 1);
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
    const record10_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name = 'Servicio Juvenil - Energía'");
    if (!record10_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name = 'Servicio Juvenil - Energía'\""); }
    record10.set("repertoire_id", record10_repertoire_idLookup.id);
    const record10_song_idLookup = app.findFirstRecordByFilter("songs", "title = 'Canta Alma Mía'");
    if (!record10_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title = 'Canta Alma Mía'\""); }
    record10.set("song_id", record10_song_idLookup.id);
    record10.set("order", 2);
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
    const record11_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name = 'Servicio Juvenil - Energía'");
    if (!record11_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name = 'Servicio Juvenil - Energía'\""); }
    record11.set("repertoire_id", record11_repertoire_idLookup.id);
    const record11_song_idLookup = app.findFirstRecordByFilter("songs", "title = 'Jesús Es Mi Rey'");
    if (!record11_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title = 'Jesús Es Mi Rey'\""); }
    record11.set("song_id", record11_song_idLookup.id);
    record11.set("order", 3);
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
    const record12_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name = 'Servicio Juvenil - Energía'");
    if (!record12_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name = 'Servicio Juvenil - Energía'\""); }
    record12.set("repertoire_id", record12_repertoire_idLookup.id);
    const record12_song_idLookup = app.findFirstRecordByFilter("songs", "title = 'Glorificado'");
    if (!record12_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title = 'Glorificado'\""); }
    record12.set("song_id", record12_song_idLookup.id);
    record12.set("order", 4);
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
    const record13_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name = 'Servicio Juvenil - Energía'");
    if (!record13_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name = 'Servicio Juvenil - Energía'\""); }
    record13.set("repertoire_id", record13_repertoire_idLookup.id);
    const record13_song_idLookup = app.findFirstRecordByFilter("songs", "title = 'Abba Padre'");
    if (!record13_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title = 'Abba Padre'\""); }
    record13.set("song_id", record13_song_idLookup.id);
    record13.set("order", 5);
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
    const record14_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name = 'Boda - Ceremonia'");
    if (!record14_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name = 'Boda - Ceremonia'\""); }
    record14.set("repertoire_id", record14_repertoire_idLookup.id);
    const record14_song_idLookup = app.findFirstRecordByFilter("songs", "title = 'Resurrección'");
    if (!record14_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title = 'Resurrección'\""); }
    record14.set("song_id", record14_song_idLookup.id);
    record14.set("order", 1);
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
    const record15_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name = 'Boda - Ceremonia'");
    if (!record15_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name = 'Boda - Ceremonia'\""); }
    record15.set("repertoire_id", record15_repertoire_idLookup.id);
    const record15_song_idLookup = app.findFirstRecordByFilter("songs", "title = 'Santidad'");
    if (!record15_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title = 'Santidad'\""); }
    record15.set("song_id", record15_song_idLookup.id);
    record15.set("order", 2);
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
    const record16_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name = 'Boda - Ceremonia'");
    if (!record16_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name = 'Boda - Ceremonia'\""); }
    record16.set("repertoire_id", record16_repertoire_idLookup.id);
    const record16_song_idLookup = app.findFirstRecordByFilter("songs", "title = 'Redentor Mío'");
    if (!record16_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title = 'Redentor Mío'\""); }
    record16.set("song_id", record16_song_idLookup.id);
    record16.set("order", 3);
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
    const record17_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name = 'Boda - Ceremonia'");
    if (!record17_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name = 'Boda - Ceremonia'\""); }
    record17.set("repertoire_id", record17_repertoire_idLookup.id);
    const record17_song_idLookup = app.findFirstRecordByFilter("songs", "title = 'Paz Perfecta'");
    if (!record17_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title = 'Paz Perfecta'\""); }
    record17.set("song_id", record17_song_idLookup.id);
    record17.set("order", 4);
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
    const record18_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name = 'Domingo 22 de Diciembre - Navidad'");
    if (!record18_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name = 'Domingo 22 de Diciembre - Navidad'\""); }
    record18.set("repertoire_id", record18_repertoire_idLookup.id);
    const record18_song_idLookup = app.findFirstRecordByFilter("songs", "title = 'Eternidad'");
    if (!record18_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title = 'Eternidad'\""); }
    record18.set("song_id", record18_song_idLookup.id);
    record18.set("order", 1);
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
    const record19_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name = 'Domingo 22 de Diciembre - Navidad'");
    if (!record19_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name = 'Domingo 22 de Diciembre - Navidad'\""); }
    record19.set("repertoire_id", record19_repertoire_idLookup.id);
    const record19_song_idLookup = app.findFirstRecordByFilter("songs", "title = 'Nombre Sobre Todo Nombre'");
    if (!record19_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title = 'Nombre Sobre Todo Nombre'\""); }
    record19.set("song_id", record19_song_idLookup.id);
    record19.set("order", 2);
  try {
    app.save(record19);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record20 = new Record(collection);
    const record20_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name = 'Domingo 22 de Diciembre - Navidad'");
    if (!record20_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name = 'Domingo 22 de Diciembre - Navidad'\""); }
    record20.set("repertoire_id", record20_repertoire_idLookup.id);
    const record20_song_idLookup = app.findFirstRecordByFilter("songs", "title = 'Eres Digno'");
    if (!record20_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title = 'Eres Digno'\""); }
    record20.set("song_id", record20_song_idLookup.id);
    record20.set("order", 3);
  try {
    app.save(record20);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record21 = new Record(collection);
    const record21_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name = 'Domingo 22 de Diciembre - Navidad'");
    if (!record21_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name = 'Domingo 22 de Diciembre - Navidad'\""); }
    record21.set("repertoire_id", record21_repertoire_idLookup.id);
    const record21_song_idLookup = app.findFirstRecordByFilter("songs", "title = 'Gracia Soberana'");
    if (!record21_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title = 'Gracia Soberana'\""); }
    record21.set("song_id", record21_song_idLookup.id);
    record21.set("order", 4);
  try {
    app.save(record21);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record22 = new Record(collection);
    const record22_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name = 'Domingo 22 de Diciembre - Navidad'");
    if (!record22_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name = 'Domingo 22 de Diciembre - Navidad'\""); }
    record22.set("repertoire_id", record22_repertoire_idLookup.id);
    const record22_song_idLookup = app.findFirstRecordByFilter("songs", "title = 'Aleluya'");
    if (!record22_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title = 'Aleluya'\""); }
    record22.set("song_id", record22_song_idLookup.id);
    record22.set("order", 5);
  try {
    app.save(record22);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record23 = new Record(collection);
    const record23_repertoire_idLookup = app.findFirstRecordByFilter("repertoires", "name = 'Domingo 22 de Diciembre - Navidad'");
    if (!record23_repertoire_idLookup) { throw new Error("Lookup failed for repertoire_id: no record in 'repertoires' matching \"name = 'Domingo 22 de Diciembre - Navidad'\""); }
    record23.set("repertoire_id", record23_repertoire_idLookup.id);
    const record23_song_idLookup = app.findFirstRecordByFilter("songs", "title = 'Tu Fidelidad'");
    if (!record23_song_idLookup) { throw new Error("Lookup failed for song_id: no record in 'songs' matching \"title = 'Tu Fidelidad'\""); }
    record23.set("song_id", record23_song_idLookup.id);
    record23.set("order", 6);
  try {
    app.save(record23);
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