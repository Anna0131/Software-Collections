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
	    	const result = await conn.query("select r.req_id, r.user_id, r.topic, r.description, r.status, r.time, u.name from requirement r, user u where r.user_id = u.user_id;");
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
			// check the credits given by user are less than user have.
			const user_credit = await conn.query("select total_credit from user where user_id = ?", [user_id]);
			if (awarded_credit <= user_credit[0].total_credit) {
	    		    await conn.query("insert into requirement(user_id, topic, description, awarded_credit, time) values(?, ?, ?, ?, ?);", [user_id, topic, description, awarded_credit, datetime]);
			    res.json({suc : true});
			}
			else {
			    res.json({suc : false, msg : "You have not enough credit to award"});
			}
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

// delete a requirement
router.delete('/', async function(req, res) {
    try {
		const result = await util.authenToken(req.cookies.token);
		if (result) {
	    	const user_id = await util.getTokenUid(req.cookies.token);
	    	const req_id = req.body.req_id;
	    	let conn;
	    	try {
	    		conn = await util.getDBConnection(); // get connection from db
				await conn.query("delete from requirement where req_id = ? and user_id = ?", [req_id, user_id]);
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

// update a requirement by requirement id
router.put('/status', async function(req, res) {
    try {
		const result = await util.authenToken(req.cookies.token);
		if (result) {
	    	const user_id = await util.getTokenUid(req.cookies.token);
	    	const req_id = req.body.req_id;
	    	const status = req.body.new_status;
	    	let conn;
	    	try {
	    		conn = await util.getDBConnection(); // get connection from db
				await conn.query("update requirement set status = ? where req_id = ? and user_id = ?", [status, req_id, user_id]);
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
