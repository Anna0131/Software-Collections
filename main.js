const router = require('express').Router();
var bodyParser = require("body-parser");
var db = require('mariadb');
var util = require("./utilities.js");
/*
const pool = db.createPool({
    host : 'localhost',
    user : 'wang',
    password : 'wang313',
    database : 'auction'
});
*/
//var config = require("config"); // 設定檔
//var root = config.get('server.root'); // 根目錄位置

// processing request
router.get('/', function(req, res) {
    try {
        if (util.authenToken(req.cookies.token)) {
            res.sendFile(__dirname + '/templates/main.html');  //回應靜態文件
        }
        else {
            res.json({msg : "login failed"});
        }
    }
    catch(e) {
        console.log(e);
    }
    return;
});

module.exports = router;