//--------- IMPORT MODULES ---------\\

const express = require('express');
const port = process.env.PORT || 8080;
const fs = require("fs");
const MarkdownIt = require('markdown-it');
const controllers = require("./controllers.js");
//-----------------------------------\\

//----- Initialize Express Server -----\\
const routerv1 = express.Router();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


const version = "v1"
const BaseRoute = `NEA_API/${version}`;
//https://www.domain.name.com/NEA_API/[version]/{GameID}/{collection}/{document}/{key}/{data}

app.get("/", (req, res) => {
  const md = new MarkdownIt();
  const data = fs.readFileSync("README.md", "utf8");
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
  res.send(style + md.render(data));
});
subRouter(routerv1, app);
app.use("/" + BaseRoute, routerv1);

app.listen(port);

console.log('RESTful API server started on: ' + port);

function subRouter(router) {
  router.get("/users/:user/:pwd", (req, res) => {
    controllers.getLoginInfo(req, res);
  });

  router.get("/list", (req, res) => {
    controllers.getAllGames(req, res);
  });

  router.get("/:GameID/:collection/:document", (req, res) => {
    controllers.getGameData(req, res);
  });
  
  router.get("/:GameID", (req, res) => {
    controllers.doesGameExist(req, res);
  });

  router.post("/users/:user/:pwd", (req, res) => {
    controllers.postUserData(req, res);
  });
  
  router.post("/:GameID/:user", (req, res) => {
    controllers.postGameData(req, res);
  });
  
  router.put("/:GameID/:collection/:document/:key/:data", (req, res) => {
    console.log("hi")
    controllers.putGameData(req, res);
  });
  
  router.delete("/:GameID", (req, res) => {
    controllers.deleteGameData(req, res);
  }); 
}
