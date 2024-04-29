// Required modules
const router = require("express").Router();
const util = require("./../utilities/utilities.js");
const fs = require("fs");

// processing request

// get all requirements
router.get('/', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const user_id = await util.getTokenUid(req.cookies.token);
	    let conn;
	    try {
	    	conn = await util.getDBConnection(); // get connection from db
	    	const result = await conn.query("select r.req_id, r.user_id, r.topic, r.description, r.awarded_credit, r.time, u.name from requirement r, user u where r.user_id = u.user_id;");
		res.json({suc : true, result});
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

// post a requirement
router.post('/', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const user_id = await util.getTokenUid(req.cookies.token);
	    const topic = req.body.topic;
	    const description = req.body.description;
	    const awarded_credit = req.body.awarded_credit;
	    const datetime = new Date();
	    let conn;
	    try {
	    	conn = await util.getDBConnection(); // get connection from db
	    	await conn.query("insert into requirement(user_id, topic, description, awarded_credit, time) values(?, ?, ?, ?, ?);", [user_id, topic, description, awarded_credit, datetime]);
		res.json({suc : true});
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
