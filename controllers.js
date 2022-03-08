const fs = require("fs");

exports.postUserData = (req, res) => {
  const [usr, pwd] = [req.params.user, req.params.pwd];
  try { fs.mkdirSync(`./database/users/${usr}`); } catch(e) { res.json({ result: false, reason: "Didn't make database.", err: e}); }
  fs.writeFile(`./database/users/${usr}/info.json`, JSON.stringify({ username: usr, password: pwd }), function(err) { 
    if(err) res.json({ result: false, reason: "unable to create collection" }) 
    else res.json({ result: true, reason: null }) 
  });
}

exports.postGameData = (req, res) => {
  function fileErr(e, res, GameID) { res.json({ result: false, message: "Could not make database for game " + GameID + ".", error: e.message, data: null }); console.log(e); }
  const GameID = req.params.GameID;
  if(Number.isInteger(parseInt(GameID))) {
    try {
      fs.mkdirSync(`./database/${GameID}/stats`, { recursive: true });
      fs.writeFile(`./database/${GameID}/stats/score.json`, JSON.stringify({value: 0}), function(err) { if(err) if(err) fileErr(err, res, GameID) });
      fs.writeFile(`./database/${GameID}/stats/wave.json`, JSON.stringify({value: 0}), function(err) { if(err) if(err) fileErr(err, res, GameID) });
      fs.mkdirSync(`./database/${GameID}/settings`, { recursive: true })
      fs.writeFile(`./database/${GameID}/settings/difficulty.json`, JSON.stringify({
        difficulty: "", AlienCooldown: 0, PlayerCooldown: 0, AlienBulletsMax: 0
      }), function(err) { if(err) fileErr(err, res, GameID) });

      fs.writeFile(`./database/${GameID}/settings/lives.json`, JSON.stringify({LivesRemaining: 0, TotalLives: 0}), function(err) { if(err) fileErr(err, res, GameID) });
      fs.writeFile(`./database/${GameID}/settings/user.json`, JSON.stringify({user: req.params.user}), function(err) { if(err) fileErr(err, res, GameID) });

      res.json({ result: true, message: "Game's database has been made, use PUT method to update it.", error: null, data: null });
    } catch(e) {
      res.json({ message: "Could not make database for game " + GameID + ".", err: e.message});
    }

  } else { res.json({ message: "GameID needs to be an integer."}); }
}

exports.getLoginInfo = (req, res) => {
  const [usr, pwd] = [req.params.user, req.params.pwd];
  let data;
  if(fs.existsSync(`./database/users/${usr}/`)) {
    try { 
      data = JSON.parse(fs.readFileSync(`./database/users/${usr}/info.json`, "utf8"));
      if(data.password == pwd) res.json({ result: true, reason: null });
      else res.json({ result: false, reason: "password incorrect" });
    } catch(e) { console.log(e); res.json({ reason: "Error while reading JSON file for user.", error: e})}

    
  } else { res.json({ result: false, reason: "username incorrect" }) }
}

exports.getGameData = (req, res) => {
  const GameID = req.params.GameID;
  if(Number.isInteger(parseInt(GameID)) == false || !fs.existsSync(`./database/${GameID}`)) {
    res.json({ message: "GameID either was not an integer or game database does not exist." });
    return;
  }

  const collection = req.params.collection;
  if(fs.existsSync(`./database/${GameID}/${collection}`) == false) {
    res.json({ message: "Database for this game is corrupted.", where: "collection" });
    return;
  }

  const document = req.params.document;
  console.log(fs.existsSync(`./database/${GameID}/${collection}/${document}.json`))
  if(fs.existsSync(`./database/${GameID}/${collection}/${document}.json`) == false) {
    res.json({ message: "Database for this game is corrupted.", where: "document" });
  }

  try { 
    const data = JSON.parse(fs.readFileSync(`./database/${GameID}/${collection}/${document}.json`, "utf8"));
    res.json({ GameID: GameID, collection: collection, document: data }); 
  }
  catch(e) { res.json({ message: "Could not read document " + document, error: e.message }); }
}

exports.getAllGames = async (req, res) => {
  fs.readdir('./database', { withFileTypes: true }, (error, files) => {
    if (error) throw error;
    const games = files
      .filter((item) => item.isDirectory())
      .map((item) => item.name);

    let [score, difficulty, user, AllGames] = [null, null, null, []];
    for(let i = 0; i < games.length; i++) {
      if(games[i] != "users") {
        score = JSON.parse(fs.readFileSync(`./database/${games[i]}/stats/score.json`)).value;
        difficulty = JSON.parse(fs.readFileSync(`./database/${games[i]}/settings/difficulty.json`)).difficulty;
        user = JSON.parse(fs.readFileSync(`./database/${games[i]}/settings/user.json`)).user;
        AllGames.push({ GameID: games[i], score: score, difficulty: difficulty, usrn: user });
      }
    }
    res.json({ result: true, data: AllGames });
  });  
}

exports.doesGameExist = (req, res) => {
  const GameID = req.params.GameID;
  if(Number.isInteger(parseInt(GameID))) {
    listDBs(req, res);
  } else if(!fs.existsSync(`./database/${GameID}`)) {
    res.json({ DoesGameExist: false });
    return;
  }
  res.json({ DoesGameExist: true });  
}

exports.putGameData = (req, res) => {
  const GameID = req.params.GameID;
  if(Number.isInteger(parseInt(GameID)) == false || !fs.existsSync(`./database/${GameID}`)) {
    res.json({ message: "GameID either was not an integer or game database does not exist." });
    return;
  }

  const collection = req.params.collection;
  if(fs.existsSync(`./database/${GameID}/${collection}`) == false) {
    res.json({ message: "Database for this game is corrupted.", where: "collection" });
    return;
  }

  const document = req.params.document;
  console.log(fs.existsSync(`./database/${GameID}/${collection}/${document}.json`))
  if(fs.existsSync(`./database/${GameID}/${collection}/${document}.json`) == false) {
    res.json({ message: "Database for this game is corrupted.", where: "document" });
  }

  let [key, data, FilePath] = [req.params.key, req.params.data, `./database/${GameID}/${collection}/${document}`];
  let jsonData = JSON.parse(fs.readFileSync(FilePath + ".json"));

  if(document == "score" || document == "wave") {
    const DataAsInt = parseInt(data);
    if(Number.isInteger(DataAsInt)) jsonData.value = DataAsInt;
    else res.json({ message: "Data value must be an integer for any 'score' or 'wave' value."});

  } else if(document == "user") {
    res.json({ message: "Document cannot be the user value as the user value may not be updated."});

  } else if(document == "difficulty") {
    if(data == "Hard" || data == "Medium" || data == "Easy" || data == "Casual" || data == "Normal") {
      if(["Casual", "Normal"].includes(data)) data = "Casual/Normal";
      const DifficultyRules = {
        "Hard":          {"alien": 100, "player": 1000, "AlienBulletsMax": 20},
        "Medium":        {"alien": 300, "player": 500, "AlienBulletsMax": 7},
        "Easy":          {"alien": 3000, "player": 100, "AlienBulletsMax": 3},
        "Casual/Normal": {"alien": 1000, "player": 500, "AlienBulletsMax": 5},
      };

      jsonData.difficulty = data;
      jsonData.AlienCooldown = DifficultyRules[data].alien;
      jsonData.PlayerCooldown = DifficultyRules[data].player;
      jsonData.AlienBulletsMax = DifficultyRules[data].AlienBulletsMax;
    }

  } else if(document == "lives") {
    const DataAsInt = parseInt(data);
    if(Number.isInteger(DataAsInt)) jsonData[key] = DataAsInt;
    else res.json({ message: "Data value must be an integer for any 'lives' value."});
  }
  //Stringify the dictionary.  JSON.stringify() converts the object/value into a JSON string.
  jsonData = JSON.stringify(jsonData);

  //Look for the .json file.  If file exists, write data to it, else create file then write data.

  fs.writeFile(FilePath + ".json", jsonData, function(err) { //function(err) is the callback function
    if(err) {
      res.json({ message: "Error while updating document.", error: err.message});
      console.log(err);
    } else { res.json({ message: "Done."}); }
  });
}

exports.deleteGameData = (req, res) => {
  const GameID = req.params.GameID;
  if(Number.isInteger(parseInt(GameID))) {
    fs.rmSync(`./database/${GameID}`, { recursive: true, force: true });
    res.json({ message: "Done." })
  } else { res.json({ message: "GameID needs to be an integer."}); }
}



