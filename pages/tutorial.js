// Required modules
const router = require('express').Router();
const util = require("./../utilities/utilities.js");

router.get('/', function(req, res) {
    res.sendFile(util.getParentPath(__dirname) + '/templates/tutorial.html');  //回應靜態文件
    return;
});

module.exports = router;
