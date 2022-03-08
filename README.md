# NEA Space Invaders API Documentation
## About
This markdown file explains how the RESTful API I built for my Computer Science NEA works.

The API was made to take requests to use CRUD operations on the game's NoSQL database (which can be accessed by both the website and the actual game).
Before requests were made to a MongoDB Atlas server, however I chose to create my own API and use a local database.

## Create
The `POST` HTTP method is used to create a new resource. The `POST` method is used when a new resource is to be made.
The GameID is passed into the URL as an endpoint:  
`https://www.domain.name.com/NEA_API/[version]/{GameID}`  
Where:  
`[version]` is the version of the API that is to be used. Currently, the newest version is `v1`, and  
`{GameID}` is the ID of the game that should be passed into the URL.  

When creating the database for a new game, the API will automatically create all the necessary collections (stats/settings) and documents (score/wave/user/difficulty/lives).
If the operation was successful, the API will return a JSON message:  
```json
{"message":"Create game database. Use the PUT method to update the database for this game."}
```
This will also be sent with a HTTP code of 200 (OK).  

If the operation was unsuccessful, the API will return one of the following messages:  
- GameID was not a number:
  ```json
  {"message": "Needs to be a number."}
  ```
  
- Internal Server Error (i.e. database was unable to be made):
  ```json
  {"message": [error]}
  ```
In any unsuccessful scenario, a HTTP code of 500 (Internal Server Error) will be returned.

## Read
The `GET` HTTP method is used by the client to request a certain resource. To make a valid GET request to the API, the following endpoint format should be used:  
`https://www.domain.name.com/NEA_API/[version]/{GameID}/{collection}/{document}`  
Where:  
`[version]` is the version of the API that is to be used. Currently, the newest version is `v1`, and  
`{GameID}` is the ID of the game that should be passed into the URL,
`{collection}` is the collection name of the resource collection (stats or settings), and
`{document}` is the document that is to be retrieved (score/wave/user/difficulty/lives).  

A successful request should return:  
```json
{ "GameID": int, "collection": string, "document": { [content] } }
```
With `[content]` representing the actual contents of the desired document.
For example, if a request was made for the `difficulty.json` document in the game of ID = 1, the endpoint would be:
`https://www.domain.name.com/NEA_API/v1/1/settings/difficulty`, and the response would be:  
```json
{
  "GameID": 1,
  "collection": "settings",
  "document": {
    "difficulty": "Easy",
    "AlienCooldown": 3000,
    "PlayerCooldown": 100,
    "AlienBulletsMax": 0
  }
}
```
This would also come with a HTTP status code of 200 (OK).

An unsuccessful operation would return the status code 400 (Bad Request):
- GameID was not a number:
  ```json
  {"message": "Needs to be a number."}
  ```
- Document was invalid:
  ```json
  {"message": "Document must be score/wave/difficulty/lives"}
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
{"message": "Done."}
```
This would also come with a HTTP status code of 200 (OK).


An unsuccessful operation would return the status code 400 (Bad Request):
- GameID was not a number:
  ```json
  {"message": "Needs to be a number."}
  ```
- Document was invalid:
  ```json
  {"message": "Document must be score/wave/difficulty/lives"}
  ```
- Collection was invalid:
  ```json
  {"message": "Collection needs to be either 'settings' or 'stats'."}
  ```

- Data value was invalid:
  - If the data value was for the score/wave document:
    ```json
    {"message": "Data value must be an integer for score/wave."}
    ```
  - If the document was for `user.js` (the username attached/associated with the game):
    ```json
    {"message": "Document cannot be the user value as the user value may not be updated."}
    ```
    The user value is permenantly binded to the GameID and cannot be transferred.
  - If the data for `difficulty.json` was invalid:
    ```json
    {"message": "Data for difficulty.json must be 'Hard', 'Medium', 'Easy', or 'Casual/Normal'."}
    ```
  - If the data for `lives.json` document was invalid:
    ```json
    {"message": "Data value must be an integer for any 'lives' value."}
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