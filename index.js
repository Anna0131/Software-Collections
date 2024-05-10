//基於 Node.js Express 的主要設定檔
var express = require('express');
var session = require('express-session');
var app = express();
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var fileupload = require("express-fileupload");
var jwt = require('jsonwebtoken');
var config = require("config");
const router = require('express').Router();
const server = require('http').Server(app);


//處理 session
app.use(session({secret : 'secret', saveUninitialized: false, resave: true}));
//bodyParser: 解析 HTTP 請求的 body
app.use(bodyParser.urlencoded({ extended: false }));
//express.json: 處理 JSON 資料
app.use(express.json());
app.use(cookieParser()); //解析 HTTP 請求的 cookie
// 處理上傳的 file
// Use temp files instead of memory for managing the upload process.
app.use(fileupload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

// routing
// pages
app.use("/login", require("./pages/login.js"));
app.use("/main", require("./pages/main.js"));
app.use("/user", require("./pages/user.js"));
app.use("/apply", require("./pages/apply.js"));
app.use("/account", require("./pages/account.js"));
app.use("/requirement", require("./pages/requirement.js"));
app.use("/tutorial", require("./pages/tutorial.js"));
// api
app.use("/api/user", require("./api/user.js"));
app.use("/api/software", require("./api/software.js"));
app.use("/api/requirement", require("./api/requirement.js"));
// static files
app.use('/js', express.static('./js'));
app.use('/css', express.static('./css'));
app.use('/public', express.static('./media/public'));


//建 MariaDB 設定主機名稱、使用者名稱、密碼和 DB 名稱
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
