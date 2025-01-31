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

// cors
cors = require('cors');
app.use(cors());

// 處理上傳的 file
// Use temp files instead of memory for managing the upload process.
app.use(fileupload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));
app.set('trust proxy', true); // trust first proxy to get the client IP address

// routing
// pages
app.get("/", (req, res) => {
    res.redirect("/main");
});
app.use("/login", require("./pages/login.js"));
app.use("/main", require("./pages/main.js"));
app.use("/user", require("./pages/user.js"));
app.use("/apply", require("./pages/apply.js"));
app.use("/settings", require("./pages/settings.js"));
app.use("/requirement", require("./pages/requirement.js"));
app.use("/tutorial", require("./pages/tutorial.js"));
app.use("/software", require("./pages/software.js"));
app.use("/audit", require("./pages/audit.js"));
// api
app.use("/api/user", require("./api/user.js"));
app.use("/api/software", require("./api/software.js"));
app.use("/api/requirement", require("./api/requirement.js"));
app.use("/api/refs", require("./api/refs.js"));
app.use("/api/login", require("./api/login.js"));
app.use("/api/settings", require("./api/settings.js"));
app.use("/api/apply", require("./api/apply.js"));
app.use("/api/course", require("./api/course.js"));
// static files
app.use('/js', express.static('./js'));
app.use('/css', express.static('./css'));
app.use('/public', express.static('./media/public'));
const puppeteer = require('puppeteer');
app.get('/screenshot', async (req, res) => {
    const url = "https://sso.ncnu.edu.tw/login"; // 前端提供的 URL
    const browser = await puppeteer.launch({
    	args: ['--no-sandbox'],
    	timeout: 10000,
  	});
    const page = await browser.newPage();
    const response = await page.goto(url);
    const screenshot = await page.screenshot({ encoding: 'base64' }); // 使用 base64 格式傳遞
	const source = await response.text();
	const csrf = source.split("csrf-token")[1].split('content="')[1].split('"')[0];
	const cookies = await page.cookies();
	const session = JSON.parse(JSON.stringify(Object.values(cookies)[0])).value;
	const xsrf = JSON.parse(JSON.stringify(Object.values(cookies)[1])).value;
    await browser.close();
    res.send(`<div>帳號：<input id='account'/>密碼：<input type='password' id='password'/>驗證碼：<input id='captcha'/><button onclick='submitLogin()'>送出</button></div><div style='display:none'><div id='csrf'>${csrf}</div><div id='xsrf'>${xsrf}</div><div id = 'session'>${session}</div></div><img src="data:image/png;base64,${screenshot}"/><script src = "js/sso_login.js"></script><script src = 'https://cdnjs.cloudflare.com/ajax/libs/axios/0.27.2/axios.min.js'></script>`); // 回傳圖片
});


//建 MariaDB 設定主機名稱、使用者名稱、密碼和 DB 名稱
const db = require("mariadb");
const pool = db.createPool({
    trace : true,
    host : 'localhost',
    user : 'wang',
    password : 'wang313',
    database : 'clinic'
});


const port = 5000;
server.listen(port, function () {
    console.log('Node server is running at port', port);
}); 

module.exports = server;
