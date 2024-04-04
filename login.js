const router = require('express').Router();
var bodyParser = require("body-parser");
var db = require('mariadb');
//var func = require('../module/func');
var util = require("./utilities.js");
var jwt = require('jsonwebtoken');
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
    res.sendFile(__dirname + '/templates/login.html');  //回應靜態文件
    return;
});

router.post('/', function(req, res) {
    try {
        let suc = false;
        suc = true;
        const account = req.body.account;
        const password = req.body.password;
        if (util.loginAuthentication(account, password)) {
            // 帳號驗證成功, 簽發 jwt token into cookie
            console.log("valid");
            data = {uid : "5"};
            const token = jwt.sign({ data, exp: Math.floor(Date.now() / 1000) + (60 * 15) }, 'my_secret_key');
            res.cookie("token", token);
        }
        res.json({suc : suc});
    }
    catch (e) {
        console.log(e);
    }    
});

module.exports = router;
