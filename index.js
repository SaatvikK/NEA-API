const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const fs = require("fs");

const controllers = require("./controllers.js");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const version = "v1"
const BaseRoute = `NEA_API/${version}`;
//https://www.domain.name.com/NEA_API/[version]/{GameID}/{collection}/{document}/{key}/{data}

app.get("/", (req, res) => {
  res.json({ message: "hai" });
});

subRouter(app);

app.listen(port);

console.log('RESTful API server started on: ' + port);

function subRouter(app) {
  app.get("/" + BaseRoute + "/users/:user/:pwd", (req, res) => {
    controllers.getLoginInfo(req, res);
  });

  app.post("/" + BaseRoute + "/users/:user/:pwd", (req, res) => {
    controllers.postUserData(req, res);
  });

  app.get("/" + BaseRoute + "/list", (req, res) => {
    controllers.getAllGames(req, res);
  });

  app.get("/" + BaseRoute + "/:GameID/:collection/:document", (req, res) => {
    controllers.getGameData(req, res);
  });
  
  app.get("/" + BaseRoute + "/:GameID", (req, res) => {
    controllers.doesGameExist(req, res);
  });

  app.post("/" + BaseRoute + "/users/:user/:pwd", (req, res) => {
    controllers.putUserData(req, res);
  });
  
  app.post("/" + BaseRoute + "/:GameID/:user", (req, res) => {
    controllers.postGameData(req, res);
  });
  
  app.put("/" + BaseRoute + "/:GameID/:collection/:document/:key/:data", (req, res) => {
    controllers.putGameData(req, res);
  });
  
  app.delete("/" + BaseRoute + "/:GameID", (req, res) => {
    controllers.deleteGameData(req, res);
  });
}
