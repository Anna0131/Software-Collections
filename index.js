var express = require('express');
var session = require('express-session');
var app = express();
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');
var config = require("config");
const router = require('express').Router();
const server = require('http').Server(app);
app.use(session({secret : 'secret', saveUninitialized: false, resave: true}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
// routing
app.use("/login", require("./login.js"));
app.use("/main", require("./main.js"));
app.use('/js', express.static('./js'));

const db = require("mariadb");
const pool = db.createPool({
    trace : true,
    host : 'localhost',
    user : 'wang',
    password : 'wang313',
    database : 'clinic'
});


server.listen(5000, function () {
    console.log('Node server is running..');
}); 