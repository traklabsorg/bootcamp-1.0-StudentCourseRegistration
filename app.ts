// lib/app.ts
import express = require('express');
let cors = require('cors');

const authorization = require('./authorization');
const authentication = require("./authentication");
const configuration = require("./configuration");
const ejs = require('ejs');
const routes = require('./app/1.routes/routes');
require('dotenv').config();

// Create a new express application instance
const app: express.Application = express();
const PORT = process.env.API_PORT || 3000;

let corsOptions = {
    origin: '*',
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    allowedHeaders: ['appid', 'authorization', 'cache-control', 'expires', 'if-modified-since', 'pragma', 'accept', 'content-type', 'idtoken'],
    maxAge: 3600, // Time in seconds
    preflightContinue: false, // Pass the CORS preflight response to the next handler.
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.set("view engine","ejs");

app.use(express.json());
app.options('*', cors());
app.use(cors(corsOptions));
app.use("/",routes);

app.get('/', function (req:any, res:any) {
    // let a=1;
    // let count = ()=>{
    //   setInterval(()=>console.log(a++),1000);
    // }
    // count();
    res.send('Hello World!');
});

app.listen(PORT, function () {
  console.log('App listening on port --> ' + PORT + '!');
});