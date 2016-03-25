This application is a realtime multiplayer game related to auctions and bids. It's a demo project to test websocket on nodejs.

## Backend (API) 

The backend is written in Nodejs and works with a MySQL database. The source code is inside `backend` folder.

### Install dependencies

    * Node.js (http://nodejs.org)
    * Mysql Server

To install the modules used by the backend execute:
```
cd backend
npm install
```

### Setup database
The script to create the database schema is in the file `backend/database/create-schema.sql`,
and the database connection parameters are in the file `backend/src/configuration/database.js`.

### Run test
Go to `backend` folder, and there you have to execute `npm test` for run the unit tests.

### Start backend server
In the `backend` folder execute the command `npm start`. The API will be available on http://localhost:8080/

## Frontend (Web app)
The frontend is written in Javascript using AngularJS. The source code is inside `frontend` folder.

### Install dependencies
To install all the dependecies used by the frontend execute:
```
npm install gulp -g
npm install bower -g
cd frontend
npm install
bower install
```

### Start frontend app

In the `frontend` folder execute the command `gulp server`. The application will be available on http://localhost:8082/

The last command creates a folder called `dist`, in the root of the `frontend` folder, if you want to install the web client application in a server, copy the content of this folder.
