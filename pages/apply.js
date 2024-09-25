const router = require('express').Router();
const util = require("./../utilities/utilities.js");

// processing request
router.get('/', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
    	    res.sendFile(util.getParentPath(__dirname) + '/templates/apply.html');  //回應靜態文件
        }
        else {
	    res.redirect("/login");
        }
    }
    catch(e) {
        console.error(e);
	res.status(500).sned("Internal Server Error");
    }
    return;
});

module.exports = router;
