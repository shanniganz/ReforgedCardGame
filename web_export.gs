function gitHubExport() {
  const sheetNames = [
    "Reforged Cards 2.0",
    "New Shards 2.0",
    "New Heroes"
  ];
  const outputFileName = "CardList.json";
  const playtestOutputFileName = "PlaytestCardList.json";
  const imageBaseUrl = "img/";
  const cardBackImageUrl = "https://shanniganz.github.io/ReforgedCardGame/img/Reforged_CardBack.jpg";

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const output = {};
  const playtestOutput = [];
  let cardNumber = 1;

  sheetNames.forEach(sheetName => {
    const sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      Logger.log(`Skipped missing sheet: ${sheetName}`);
      return;
    }

    const data = sheet.getDataRange().getValues();

    if (data.length === 0) {
      return;
    }

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
      cost2: headers.indexOf("Cost 2"),
      cost3: headers.indexOf("Cost 3"),
      cardtext2: headers.indexOf("Card Text 2"),
      cardtext3: headers.indexOf("Card Text 3"),
      setname: headers.indexOf("Set Name"),
      precon: headers.indexOf("Precon"),
      legendary: headers.indexOf("Legendary")
    };

    if (col.name === -1) {
      Logger.log(`Skipped sheet missing Name header: ${sheetName}`);
      return;
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      const name = getCellText(getRowCell(row, col.name));
      if (!name) continue;

      const id = `CARD-${cardNumber}`;
      cardNumber++;
      const faction = getCellText(getRowCell(row, col.region));
      const type = getCellText(getRowCell(row, col.type));
      const subtype = getCellText(getRowCell(row, col.subtype));
      const damagetype = getCellText(getRowCell(row, col.damagetype));
      const cost = getCellNumber(getRowCell(row, col.cost));
      const power = getCellNumber(getRowCell(row, col.power));
      const health = getCellNumber(getRowCell(row, col.health));
      const sparks = getCellNumber(getRowCell(row, col.sparks));
      const cardtext = getCellText(getRowCell(row, col.cardtext));
      const flavortext = getCellText(getRowCell(row, col.flavortext));
      const cost2 = getCellNumber(getRowCell(row, col.cost2));
      const cost3 = getCellNumber(getRowCell(row, col.cost3));
      const cardtext2 = getCellText(getRowCell(row, col.cardtext2));
      const cardtext3 = getCellText(getRowCell(row, col.cardtext3));
      const setname = getCellText(getRowCell(row, col.setname));
      const precon = getCellText(getRowCell(row, col.precon)) || "None";
      const legendary = getCellText(getRowCell(row, col.legendary)).toUpperCase() || "N";

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
        flavortext: flavortext,
        cost2: cost2,
        cost3: cost3,
        cardtext2: cardtext2,
        cardtext3: cardtext3
      };

      playtestOutput.push({
        unique_id: id,
        name: name,
        quantity: 1,
        deck_names: sheetName,
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
        description: "",
        notes: "",
        material: "",
        weight_lbs: "",
        cost_per_unit: ""
      });
    }
  });

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

function getCellText(value) {
  return String(value || "").trim();
}

function getCellNumber(value) {
  if (value === "" || value === null || value === undefined || String(value).trim() === "") {
    return "";
  }

  return Number(value);
}

function getRowCell(row, index) {
  return index === -1 ? "" : row[index];
}
