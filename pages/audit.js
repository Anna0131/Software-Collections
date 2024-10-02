// Required modules
const router = require("express").Router();
const util = require("./../utilities/utilities.js");

// processing request
router.get('/', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const user_id = await util.getTokenUid(req.cookies.token);
	    const authen_result = await util.ckUserPrivileges(user_id);
	    if (!authen_result) {
			// privilege of user is not enough to agree the upload of software
			return res.json({msg : "your privilege is not enough to visit the page"});
	    }
    	    res.sendFile(util.getParentPath(__dirname) + "/templates/audit.html");  //回應靜態文件
        }
        else {
	    	res.redirect("/login/sso");
        }
    }
    catch(e) {
        console.error(e);
	res.status(500).sned("Internal Server Error");
    }
});

module.exports = router;
