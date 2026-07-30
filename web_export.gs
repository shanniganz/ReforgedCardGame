function gitHubExport() {
  const sheetName = "Reforged Cards 2.0";
  const outputFileName = "CardList.json";
  const playtestOutputFileName = "PlaytestCardList.json";
  const imageBaseUrl = "img/";
  const cardBackImageUrl = "https://shanniganz.github.io/ReforgedCardGame/img/Reforged_CardBack.jpg";

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();

  const headers = data[0].map(h => String(h).trim());

  const col = {
    name: headers.indexOf("Name"),
    region: headers.indexOf("Region"),
    type: headers.indexOf("Type"),
    subtype: headers.indexOf("Sub Type"),
    damagetype: headers.indexOf("Damage Type"),
    cost: headers.indexOf("Cost"),
    power: headers.indexOf("Power"),
    health: headers.indexOf("Health"),
    sparks: headers.indexOf("Sparks"),
    cardtext: headers.indexOf("Card Text"),
    flavortext: headers.indexOf("Flavor Text"),
    setname: headers.indexOf("Set Name"),
    precon: headers.indexOf("Precon"),
    legendary: headers.indexOf("Legendary")
  };

  for (const key in col) {
    if (col[key] === -1) {
      throw new Error(`Missing required header: ${key}`);
    }
  }

  const output = {};
  const playtestOutput = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    const name = String(row[col.name]).trim();
    if (!name) continue;

    const id = `CARD-${i}`;
    const faction = String(row[col.region]).trim();
    const type = String(row[col.type]).trim();
    const subtype = String(row[col.subtype]).trim();
    const damagetype = String(row[col.damagetype]).trim();
    const cost = Number(row[col.cost]);
    const power = Number(row[col.power]);
    const health = Number(row[col.health]);
    const sparks = Number(row[col.sparks]);
    const cardtext = String(row[col.cardtext]).trim();
    const flavortext = String(row[col.flavortext]).trim();
    const setname = String(row[col.setname]).trim();
    const precon = String(row[col.precon] || "None").trim();
    const legendary = String(row[col.legendary] || "").trim().toUpperCase() || "N";

    const imageName = name.replace(/\s+/g, "_");
    const image = `${imageBaseUrl}${imageName}.webp`;

    const isHorizontal =
      type.toLowerCase() === "artifact" ||
      type.toLowerCase() === "quest";

    output[id] = {
      id: id,
      setname: setname,
      precon: precon,
      name: name,
      type: type,
      subtype: subtype,
      damagetype: damagetype,
      cost: cost,
      power: power,
      health: health,
      sparks: sparks,
      image: image,
      isHorizontal: isHorizontal,
      faction: faction,
      legendary: legendary,
      cardtext: cardtext,
      flavortext: flavortext
    };

    playtestOutput.push({
      unique_id: id,
      name: name,
      quantity: 1,
      deck_names: precon || "Deck 1",
      sort_order: 1,
      size: "",
      phys_width_in: 2.5,
      phys_height_in: 3.5,
      color: "",
      color_back: "",
      image_url: image,
      back_image_url: cardBackImageUrl,
      image_rotation: 0,
      facing: "",
      card_mask_type: "",
      playtest_scale_x: 1.000,
      playtest_scale_y: 1.000,
      description: cardtext,
      notes: flavortext,
      material: "",
      weight_lbs: "",
      cost_per_unit: ""
    });
  }

  const json = JSON.stringify(output, null, 2);
  const playtestJson = JSON.stringify(playtestOutput, null, 2);

  upsertJsonFile(outputFileName, json);
  upsertJsonFile(playtestOutputFileName, playtestJson);
}

function upsertJsonFile(fileName, json) {
  const files = DriveApp.getFilesByName(fileName);

  if (files.hasNext()) {
    const file = files.next();
    file.setContent(json);
    Logger.log("Updated existing file: " + file.getUrl());
  } else {
    const file = DriveApp.createFile(fileName, json, MimeType.PLAIN_TEXT);
    Logger.log("Created new file: " + file.getUrl());
  }
}
