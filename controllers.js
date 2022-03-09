const fs = require("fs");

exports.postUserData = (req, res) => {
  const [usr, pwd] = [req.params.user, req.params.pwd];

  // Trying to make the collection for the user using mkdirSync().
  // Also wrapping the function around a try-catch so that the server code doesnt stop execute and we can send the client
  // an error message.

  try { fs.mkdirSync(`./database/users/${usr}`); } catch(e) { res.status(500); res.json({ result: false, reason: "Unable to create collection folder for new user.", error: e.message, data: null }); }
  
  // Here, we are creating the info.json document with the username and password that was sent in the URL request.
  // Instead of a try-catch, we use a callback function. This function is one that gets executed after fs.writeFile() finishes.
  // It is equivalent to a try-catch.
  fs.writeFile(`./database/users/${usr}/info.json`, JSON.stringify({ username: usr, password: pwd }), function(err) { 
    // Checking if there is an error. If so, we send an error message to the client along with a HTTP 500 status.
    if(err) { res.status(500); res.json({ result: false, reason: "Unable to create document for new user.", error: err, data: null }); }
    // Else, we can assume that the document was created and written to successfully, and so we send a HTTP 200 (OK) success status.
    else { res.status(200); res.json({ result: true, reason: null, error: null, data: null }); }
  });
}

exports.postGameData = (req, res) => {
  function fileErr(e, res, GameID) { res.status(500); res.json({ result: false, reason: "Could not make database for game.", error: e.message, data: null }); console.log(e); }
  const GameID = req.params.GameID;
  if(Number.isInteger(parseInt(GameID))) { // GameID must be an integer, so checking if it is.
    try {
      // Creating the two required collections and all the required documents for the database.
      // First, each key-value pair for all documents are initialized to `0` (if the value is an int) or "" (if the value is a string)
      fs.mkdirSync(`./database/${GameID}/stats`, { recursive: true });
      fs.writeFile(`./database/${GameID}/stats/score.json`, JSON.stringify({value: 0}), function(err) { if(err) if(err) fileErr(err, res, GameID) });
      fs.writeFile(`./database/${GameID}/stats/wave.json`, JSON.stringify({value: 0}), function(err) { if(err) if(err) fileErr(err, res, GameID) });
      fs.mkdirSync(`./database/${GameID}/settings`, { recursive: true })
      fs.writeFile(`./database/${GameID}/settings/difficulty.json`, JSON.stringify({
        difficulty: "", AlienCooldown: 0, PlayerCooldown: 0, AlienBulletsMax: 0
      }), function(err) { if(err) fileErr(err, res, GameID) });

      fs.writeFile(`./database/${GameID}/settings/lives.json`, JSON.stringify({LivesRemaining: 0, TotalLives: 0}), function(err) { if(err) fileErr(err, res, GameID) });
      fs.writeFile(`./database/${GameID}/settings/user.json`, JSON.stringify({user: req.params.user}), function(err) { if(err) fileErr(err, res, GameID) });
      
      // Responding to the client with success.
      res.status(200);
      res.json({ result: true, reason: "Game's database has been made, use PUT method to update it.", error: null, data: null });
    } catch(e) {
      // Responding to the client with an internal server error.
      res.status(500);
      res.json({ result: false, reason: "Could not make database for game.", err: e.message, data: null });
    }

  } else { res.status(400); res.json({ result: false, reason: "GameID needs to be an integer.", error: null, data: null }); }
}

exports.getLoginInfo = (req, res) => {
  const [usr, pwd] = [req.params.user, req.params.pwd];
  let data;
  // Checking if the collection for the requested username exists, i.e. does the user have an account?
  if(fs.existsSync(`./database/users/${usr}/`)) { // If true
    try {
      // Get the data of the document in the collection and compare the database password with the one received in the request.
      // If the two passwords are the same, the server sends back a success message.
      data = JSON.parse(fs.readFileSync(`./database/users/${usr}/info.json`, "utf8"));
      if(data.password == pwd) { res.status(200); res.json({ result: true, reason: "Login successful.", error: null, data: null }); }
      else { res.status(401); res.json({ result: false, reason: "Password incorrect.", error: null, data: null }); }
    } catch(e) { console.log(e); res.status(500); res.json({ result: false, reason: "Error while reading JSON file for user.", error: e.message, data: null }); }

    
  } else { res.json({ result: false, reason: "Username incorrect." }) }
}

exports.getGameData = (req, res) => {
  const GameID = req.params.GameID;
  if(Number.isInteger(parseInt(GameID)) == false || !fs.existsSync(`./database/${GameID}`)) {
    res.status(400);
    res.json({ result: false, reason: "GameID either was not an integer or game database does not exist.", error: null, data: null });
    return;
  }

  const collection = req.params.collection;
  if(fs.existsSync(`./database/${GameID}/${collection}`) == false) {
    res.status(404);
    res.json({ result: false, reason: "Database for this game is corrupted.", where: "collection", error: null, data: null });
    return;
  }

  const document = req.params.document;
  if(fs.existsSync(`./database/${GameID}/${collection}/${document}.json`) == false) {
    res.status(404);
    res.json({ result: false, reason: "Database for this game is corrupted.", where: "document", error: null, data: null });
  }

  try { 
    const data = JSON.parse(fs.readFileSync(`./database/${GameID}/${collection}/${document}.json`, "utf8"));
    res.status(200);
    res.json({ result: true, reason: `Data retrieved from GameID ${GameID} in the ${collection}/${document} document`, error: null, data: data }); 
  }
  catch(e) { res.status(500); res.json({ result: false, reason: "Could not read document " + document, error: e.message, data: null }); }
}

exports.getAllGames = (req, res) => {
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
    res.json({ result: true, reason: "eh", error: null, data: AllGames });
  });  
}

exports.doesGameExist = (req, res) => {
  const GameID = req.params.GameID;
  if(Number.isInteger(parseInt(GameID))) {
    listDBs(req, res);
  } else if(!fs.existsSync(`./database/${GameID}`)) {
    res.status(200);
    res.json({ DoesGameExist: false });
    return;
  }
  res.status(200);
  res.json({ DoesGameExist: true });  
}

exports.putGameData = (req, res) => {
  const GameID = req.params.GameID;
  if(Number.isInteger(parseInt(GameID)) == false || !fs.existsSync(`./database/${GameID}`)) {
    res.status(400);
    res.json({ result: false, reason: "GameID either was not an integer or game database does not exist.", error: null, data: null });
    return;
  }

  const collection = req.params.collection;
  if(fs.existsSync(`./database/${GameID}/${collection}`) == false) {
    res.status(404);
    res.json({ result: false, reason: "Database for this game is corrupted.", where: "collection" });
    return;
  }

  const document = req.params.document;
  console.log(fs.existsSync(`./database/${GameID}/${collection}/${document}.json`))
  if(fs.existsSync(`./database/${GameID}/${collection}/${document}.json`) == false) {
    res.status(404);
    res.json({ result: false, reason: "Database for this game is corrupted.", where: "document" });
  }

  let [key, data, FilePath] = [req.params.key, req.params.data, `./database/${GameID}/${collection}/${document}`];
  let jsonData = JSON.parse(fs.readFileSync(FilePath + ".json"));

  if(document == "score" || document == "wave") {
    const DataAsInt = parseInt(data);
    if(Number.isInteger(DataAsInt)) jsonData.value = DataAsInt;
    else { res.status(400); res.json({ result: false, reason: "Data value must be an integer for any 'score' or 'wave' value.", error: null, data: null }); }

  } else if(document == "user") {
    res.status(400);
    res.json({ result: false, reason: "Document cannot be the user value as the user value may not be updated.", error: null, data: null });

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
    } else {
      res.status(400);
      res.json({ result: false, reason: "Difficulty must be 'Hard', 'Medium', 'Easy', or 'Casual/Normal'", error: null, data: null });
    }

  } else if(document == "lives") {
    const DataAsInt = parseInt(data);
    if(Number.isInteger(DataAsInt)) jsonData[key] = DataAsInt;
    else { res.status(400); res.json({ result: false, reason: "Data value must be an integer for any 'lives' value.", error: null, data: null }); }
  }
  //Stringify the dictionary.  JSON.stringify() converts the object/value into a JSON string.
  jsonData = JSON.stringify(jsonData);

  //Look for the .json file.  If file exists, write data to it, else create file then write data.

  fs.writeFile(FilePath + ".json", jsonData, function(err) { //function(err) is the callback function
    if(err) {
      res.status(500);
      res.json({ result: false, reason: "Error while updating document.", error: err.message, data: null });
      console.log(err);
    } else { res.status(200); res.json({ result: true, reason: "Updated document.", error: null, data: null }); }
  });
}

exports.deleteGameData = (req, res) => {
  const GameID = req.params.GameID;
  if(Number.isInteger(parseInt(GameID))) {
    fs.rmSync(`./database/${GameID}`, { recursive: true, force: true });
    res.status(200);
    res.json({ result: true, reason: "Done.", error: null, data: null });
  } else { res.status(400); res.json({ result: true, reason: "GameID needs to be an integer.", error: null, data: null }); }
}



