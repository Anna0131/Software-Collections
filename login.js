// Required modules
const router = require('express').Router();
var bodyParser = require("body-parser");
var db = require('mariadb');
//var func = require('../module/func');
var util = require("./utilities.js");
var jwt = require('jsonwebtoken');
const c = require('config');
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

//設定一個 HTTP GET 請求的路由處理 -> 前往根 URL（ '/'）會被觸發
router.get('/', function(req, res) {
    res.sendFile(__dirname + '/templates/login.html');  //回應靜態文件
    return;
});



//設定 POST request 的 routing，當 user 提交表單時會被觸發
router.post('/', async function(req, res) { // 注意這裡加了 async
    try {
        let suc = true;
        const account = req.body.account;
        const password = req.body.password;

        // 使用 await 等待 Promise 解決
        const authen_result = await util.loginAuthentication(account, password); // 加了 await
        
        console.log(`authen_result: ${authen_result}`);

        if (authen_result == true) {
            console.log("valid");
            data = {uid : "5"};
            const token = jwt.sign({ data, exp: Math.floor(Date.now() / 1000) + (60 * 15) }, 'my_secret_key');
            res.cookie("token", token);
        }
        else {
            suc = false;
        }

        res.json({suc : suc});
    }
    catch (e) {
        console.log(e);
        res.json({suc: false}); // 確保出錯時回傳失敗的訊息
    }    
});

module.exports = router;
