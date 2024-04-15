// Required modules
const router = require("express").Router();
const util = require("./../utilities/utilities.js");

// processing request
router.get('/', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const user_id = await util.getTokenUid(req.cookies.token);
	    let conn;
	    try {
	    	conn = await util.getDBConnection(); // get connection from db
	    	let user = await conn.query("select s_num, name from user where user_id = ?;", user_id);
		const s_num = user[0].s_num;
		const name = user[0].name;
		res.json({suc : true, s_num, name});
	    }
	    catch(e) {
		console.error(e);
		res.json({suc : false});
	    }
	    finally {
		util.closeDBConnection(conn); // close db connection
	    }
        }
        else {
            res.json({msg : "login failed"});
        }
    }
    catch(e) {
        console.log(e);
        res.json({msg : "login failed"});
    }
});

module.exports = router;
