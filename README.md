# NEA Space Invaders API Documentation
## About
This markdown file explains how the RESTful API I built for my Computer Science NEA works.

The API was made to take requests to use CRUD operations on the game's NoSQL database (which can be accessed by both the website and the actual game).
Before requests were made to a MongoDB Atlas server, however I chose to create my own API and use a local database.


## Create
### Create [GAME]
  The `POST` HTTP method is used to create a new resource. The `POST` method is used when a new resource is to be made.
  The GameID is passed into the URL as an endpoint:  
  `https://www.domain.name.com/NEA_API/[version]/{GameID}/{user}`  
  Where:  
  `[version]` is the version of the API that is to be used. Currently, the newest version is `v1`,  
  `{GameID}` is the ID of the game that should be passed into the URL, and
  `{user}` is the username that will own the game.
  
  When creating the database for a new game, the API will automatically create all the necessary collections (stats/settings) and documents (score/wave/user/difficulty/lives).
  If the operation was successful, the API will return a JSON message:  
  ```json
  { result: true, reason: "Game's database has been made, use PUT method to update it.", error: null, data: null }
  ```
  This will also be sent with a HTTP code of 200 (OK).  
  
  If the operation was unsuccessful, the API will return one of the following messages:  
  - GameID was not a number (HTTP status 400 - Bad Request):
    ```json
    { result: false, reason: "GameID needs to be an integer.", error: null, data: null }
    ```

  - Internal Server Error (HTTP status 500) as database was unable to be made:
    ```json
    { result: false, reason: "Could not make database for game.", err: "[error]", data: null }
    ```

### Create [User]
  This uses the `POST` HTTP method to register a new account. It creates the collection for a new user in the `./database/users/` database. 
  The following endpoint is used:
  `https://www.domain.name.com/NEA_API/[version]/users/{username}/{password}`

  Where:
  `[version]` is the version of the API that is to be used. Currently, the newest version is `v1`,
  `{username}` is the username of the new account that is being registered, and
  `{password}` is the hashed version of the password of the new account that is being registered.

  If the operation was successful, the API will respond with:
  ```json
  { result: true, reason: null, error: null, data: null }
  ```

  If the operation was unsuccessful, the API will respond with one of the following:
  - Error whilst making the collection - Internal Server Error (HTTP 500):
    ```json
    { result: false, reason: "Unable to create collection folder for new user.", error: "[error]", data: null }
    ```

  - Error whilst creating the document - Internal Server Error (HTTP 500):
    ```json
    { result: false, reason: "Unable to create document for new user.", error: "[error]", data: null }
    ```


## Read
### Reading Different Documents of Game Databases
  The `GET` HTTP method is used by the client to request a certain resource. In this case, it is being used to request the data of a document in a specific game database. To make a valid GET request to the API, the following endpoint format should be used: 
  `https://www.domain.name.com/NEA_API/[version]/{GameID}/{collection}/{document}`  
  Where:  
  `[version]` is the version of the API that is to be used. Currently, the newest version is `v1`, and  
  `{GameID}` is the ID of the game that should be passed into the URL,
  `{collection}` is the collection name of the resource collection (stats or settings), and
  `{document}` is the document that is to be retrieved (score/wave/user/difficulty/lives).  

  A successful request should return:  
  ```json
  { result: true, reason: "Data retrieved from GameID {GameID} in the {collection}/{document} document", error: null, data: [data] }
  ```
  With `[data]` representing the actual contents of the desired document.
  For example, if a request was made for the `difficulty.json` document in the game of ID = 1, the endpoint would be:
  `https://www.domain.name.com/NEA_API/v1/1/settings/difficulty`, and the response would be:  
  ```json
  {
    result: true,
    reason: "Data retrieved from GameID 1 in the settings/difficulty document",
    error: null,
    data: {
      "difficulty": "Easy",
      "AlienCooldown": 3000,
      "PlayerCooldown": 100,
      "AlienBulletsMax": 0
    }
  }
  ```
  This would also come with a HTTP status code of 200 (OK).

  If the operation was unsuccessful, the API will respond with one of the following:
  - GameID was not a number or the database doesn't exist (HTTP 400 - Bad Request):
    ```json
    { result: false, reason: "GameID either was not an integer or game database does not exist.", error: null, data: null }
    ```
  
  - Collection doesn't exist (HTTP 404 - Not Found):
    ```json
    { result: false, reason: "Database for this game is corrupted.", where: "collection", error: null, data: null }
    ```
  
  - Document doesn't exist (HTTP 404 - Not Found):
    ```json
    { result: false, reason: "Database for this game is corrupted.", where: "document", error: null, data: null }
    ```
  
  - Error while reading the document (HTTP 500 - Internal Server Error):
    ```json
    { result: false, reason: "Could not read document [document]", error: "[error]", data: null }
    ```

### Reading - Getting Account Usernames for Logins
  The `GET` HTTP method is used by the client to request a certain resource. In this case, it is being used to request the username and hashed password of a certain user. To make a valid GET request to the API, the following endpoint format should be used: 
  `https://www.domain.name.com/NEA_API/[version]/users/{username}/{password}`  
  Where:  
  `[version]` is the version of the API that is to be used. Currently, the newest version is `v1`,
  `{username}` is the username of the account being requested, and
  `{password}` is the hashed version of the password of the account being requested.

  If the operation is successful, the API will respond with HTTP 200 (OK):
  ```json
  { result: true, reason: "Login successful.", error: null, data: null }
  ```

  If the operation is unsuccessful, the API will respond with one of the following:
  - The password was incorrect (HTTP 401 - Unauthorized):
    ```json
    { result: false, reason: "Password incorrect.", error: null, data: null }
    ```
  
  - The username was incorrect (HTTP 401 - Unauthorized):
    ```json
    { result: false, reason: "Username incorrect.", error: null, data: null }
    ```
  
  - There was an error while reading the document (HTTP 500 - Internal Server Error):
    ```json
    { result: false, reason: "Error while reading JSON file for user.", error: "[error]", data: null }
    ```

### Reading the General Database and Getting All Games in the DB
  The `GET` HTTP method is used by the client to request a certain resource. In this case, it is being used to request the data of a document in a specific game database. To make a valid GET request to the API, the following endpoint format should be used: 
  `https://www.domain.name.com/NEA_API/[version]/list`  
  Where:  
  `[version]` is the version of the API that is to be used. Currently, the newest version is `v1`.

  If the operation is successful, the API will respond with:
  ```json
  { result: true, reason: "eh", error: null, data: [content] }
  ```
  The `data` key contents various information of the game:
    - Score,
    - Difficulty,
    - User (the user that owns the game).
  
  The value of `data` is an array composed of dictionaries:
  ```json
  [
    {
      "GameID": int,
      "score": int,
      "difficulty": string,
      "usrn": string
    },
    ...,
    {
      "GameID": int,
      "score": int,
      "difficulty": string,
      "usrn": string
    },
  ]
  ```

### Read - Checking if a Game Database Exists
  The `GET` HTTP method is used by the client to request a certain resource. In this case, it is being used to check if a game has a database in the server. To make a valid GET request to the API, the following endpoint format should be used: 
  `https://www.domain.name.com/NEA_API/[version]/{GameID}`  
  Where:  
  `[version]` is the version of the API that is to be used. Currently, the newest version is `v1`. 

  If the operation is successful, one of two responses can be given (both with HTTP 200 - OK):
    1. The game *does* have a database in the server.
      ```json
      { DoesGameExist: true }
      ```
    2. The game *does not* have a database in the server.
      ```json
      { DoesGameExist: false }
      ```

## Update
The `PUT` HTTP method is used to update an existing database for a given game.
To make a valid PUT request to the API, the following endpoint format should be used:  
`https://www.domain.name.com/NEA_API/[version]/{GameID}/{collection}/{document}/{key}/{data}`  
Where:  
`[version]` is the version of the API that is to be used. Currently, the newest version is `v1`, and  
`{GameID}` is the ID of the game that should be passed into the URL,
`{collection}` is the collection name of the resource collection (stats or settings), and
`{document}` is the document that is to be retrieved (score/wave/user/difficulty/lives).  
`{key}` is the key of the data attempting to be updated.
`{value}` is the actual value that should be used to update the data.

_**Note:**_  
When updating the `settings/difficulty.json` document, the `{key}` value is not **NOT** required. However, if a value is entered it will simply be ignored.
Instead, enter the new difficulty setting ("Hard", "Medium", "Easy", or "Casual/Normal") into the `{data}` parameter, and set the `{key}` parameter to some value, such as `0`.

A successful request should return:  
```json
{ result: true, reason: "Updated document.", error: null, data: null }
```
This would also come with a HTTP status code of 200 (OK).


An unsuccessful operation would return the status code 400 (Bad Request):
- GameID was not a number (HTTP 400 - Bad Request):
  ```json
  { result: false, reason: "GameID either was not an integer or game database does not exist.", error: null, data: null }
  ```
- Collection was invalid (HTTP 404 - Not Found):
  ```json
  { result: false, reason: "Database for this game is corrupted.", where: "collection" }
  ```
- Document was invalid (HTTP 404 - Not Found):
  ```json
  { result: false, reason: "Database for this game is corrupted.", where: "document" }
  ```

- Data value was invalid (all of these are HTTP 400 - Bad Request):
  - If the data value was for the score/wave document:
    ```json
    { result: false, reason: "Data value must be an integer for any 'score' or 'wave' value.", error: null, data: null }
    ```
  - If the document was for `user.json` (the username attached/associated with the game):
    ```json
    { result: false, reason: "Document cannot be the user value as the user value may not be updated.", error: null, data: null }
    ```
    The user value is permenantly binded to the GameID and cannot be transferred.
  - If the data for `difficulty.json` was invalid:
    ```json
    { result: false, reason: "Difficulty must be 'Hard', 'Medium', 'Easy', or 'Casual/Normal'", error: null, data: null }
    ```
  - If the data for `lives.json` document was invalid:
    ```json
    { result: false, reason: "Data value must be an integer for any 'lives' value.", error: null, data: null }
    ```
    
## Delete
The `DELETE` HTTP method is used to delete the database of a given name.
To request the deletion of a database:  
`https://www.domain.name.com/NEA_API/[version]/{GameID}`
Where:  
`[version]` is the version of the API that is to be used. Currently, the newest version is `v1`, and  
`{GameID}` is the ID of the game that should be passed into the URL.  

The `DELETE` method does not take any more parameters as certain parts of the database cannot be deleted. This is to avoid certain games being rendered unplayable and undisplayable on the website.
Instead, only the whole database for a specific game can be deleted. 
If certain parts of the database are needed to be "deleted", the `PUT` method can be used to "reset" them.

If the operation was successful, the following will be received by the client:
```json
{ result: true, reason: "Done.", error: null, data: null }
```
This will be attached with a HTTP 200 status (OK).

If the operation was unsuccessful (HTTP 400 - Bad Request):
```json
{ result: false, reason: "GameID needs to be an integer.", error: null, data: null }
```