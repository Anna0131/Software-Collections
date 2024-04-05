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
router.post('/', function(req, res) {
    try {
        let suc = true;
        const account = req.body.account;
        const password = req.body.password;
        //驗證帳號和密碼
        const authen_result = util.loginAuthentication(account, password);//呼叫 utilities.js 中的 loginAuthentication 函數
        console.log(`authen_result: ${authen_result}`);
        
        
        if (authen_result == true) {
            // 驗證成功 -> 創建一個 JWT 存在 cookie 中
            console.log("valid");
            data = {uid : "5"};
            // JWT 的過期時間是當前時間加上 15 min
            const token = jwt.sign({ data, exp: Math.floor(Date.now() / 1000) + (60 * 15) }, 'my_secret_key');
            res.cookie("token", token);
        }
        else {
            suc = false;
        }
        //不管驗證是否成功，都會將 suc 的值作為 JSON 回傳給 user
        res.json({suc : suc});
    }
    catch (e) {
        console.log(e);
    }    
});


module.exports = router;
