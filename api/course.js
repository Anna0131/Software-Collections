// Required modules
const router = require("express").Router();
const util = require("./../utilities/utilities.js");

// get info of current user
router.get('/', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const user_id = await util.getTokenUid(req.cookies.token);
	    let conn;
	    try {
	    	conn = await util.getDBConnection(); // get connection from db
	    	const refs_name = await conn.query("select name, val from ref where root_only=False or root_only in (select -role_id+4 from user where user_id = ?);", user_id);
			res.json({suc : true, refs_name});
	    }
	    catch(e) {
			console.error(e);
	        res.status(500).json({msg : "Internal Server Error"});
	    }
	    finally {
			util.closeDBConnection(conn); // close db connection
	    }
    }
    	else {
        	res.status(401).json({msg : "Unauthorized"});
    	}
    }
    catch(e) {
        console.error(e);
	res.status(500).json({msg : "Internal Server Error"});
    }
});

module.exports = router;
