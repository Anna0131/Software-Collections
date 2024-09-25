// Required modules
const router = require('express').Router();
const util = require("./../utilities/utilities.js");

//設定一個 HTTP GET 請求的路由處理 -> 前往根 URL（ '/'）會被觸發
router.get('/', async function(req, res) {
    try {
        res.sendFile(util.getParentPath(__dirname) + '/templates/login.html');  //回應靜態文件
    }
    catch(e) {
        console.error(e);
	res.status(500).sned("Internal Server Error");
    }
});

module.exports = router;
