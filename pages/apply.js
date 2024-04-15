const router = require('express').Router();
const bodyParser = require("body-parser");
const util = require("./../utilities/utilities.js");

// processing request
router.get('/', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
    	    res.sendFile(util.getParentPath(__dirname) + '/templates/apply.html');  //回應靜態文件
        }
        else {
            res.json({msg : "login failed"});
        }
    }
    catch(e) {
        console.log(e);
        res.json({msg : "login failed"});
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
