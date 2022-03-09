//--------- IMPORT MODULES ---------\\
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const fs = require("fs");
const MarkdownIt = require('markdown-it');
const controllers = require("./controllers.js");
//-----------------------------------\\

//----- Initialize Express Server -----\\
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set("view engine", "ejs");


const version = "v1"
const BaseRoute = `NEA_API/${version}`;
//https://www.domain.name.com/NEA_API/[version]/{GameID}/{collection}/{document}/{key}/{data}

// This is the function that handles GET requests for the base route.
// When a client sends a GET request for a URL with no resource endpoint (i.e. www.domain.name.com), 
// this is the function that will be triggered.
// In this case, the server simply responds with the API documentation.
app.get("/", (req, res) => {
  const md = new MarkdownIt();
  const data = fs.readFileSync("README.md", "utf8"); // Reading the documentation file.
  const style = `
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@300&display=swap');
    h1 {
      font-family: 'Montserrat', sans-serif;
      font-size: 50px;
    }
    
    h3 {
      font-family: 'Montserrat', sans-serif;
    }
    
    h2 {
      font-family: 'Montserrat', sans-serif;
    }
    
    p {
      font-family: 'Ubuntu', sans-serif;
    }
    </style>
  `;
  res.send(style + md.render(data)); // Rendering the documentation and adding the styles before it.
});

subRouter(app);

// The server is now listening for requests on the predetermined port. Because this is a HTTP(S) application, the port is 8080.
app.listen(port);

console.log('RESTful API server started on: ' + port);

function subRouter(app) {
  // Below are the various endpoints that can be used to request resources from the databse using the API.
  // Each combination of HTTP method (POST, GET, PUT, DELETE) and URL endpoints must be entirely unique.
  // Endpoints can be dynamic, to allow the client to add parameters into it. This way, information and data can be easily
  // sent to the server.
  // In express, URL/endpoint parameters can be identified using a colon then the parameter name, like declaring a variable.
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
