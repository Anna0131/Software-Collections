const router = require('express').Router();
var bodyParser = require("body-parser");
var db = require('mariadb');
var util = require("./../utilities/utilities.js");
const sendEmail = require("./../utilities/sendEmail.js");
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
router.get('/', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
    	    res.sendFile(util.getParentPath(__dirname) + '/templates/main.html');  //回應靜態文件
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

router.post('/email', function(req, res) {
    try {
        receivers = ["s109213059@mail1.ncnu.edu.tw", "tommy50508@gmail.com"];
        topic = "test topic";
        content = "hello";
        sendEmail.send(receivers, topic, content);
    }
    catch(e) {
        console.log(e);
    }
    return;
});

module.exports = router;
