// Required modules
const router = require("express").Router();
const util = require("./../utilities/utilities.js");

// processing request

// get info of current user
router.get('/', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const user_id = await util.getTokenUid(req.cookies.token);
	    let conn;
	    try {
	    	conn = await util.getDBConnection(); // get connection from db
	    	let user = await conn.query("select user_id, s_num, name, email, total_credit from user where user_id = ?;", user_id);
		const s_num = user[0].s_num;
		const name = user[0].name;
		const email = user[0].email;
		const total_credit = user[0].total_credit;
		res.json({suc : true, s_num, name, user_id, email, total_credit});
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

/*
// get info of all users
router.get('/all', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const user_id = await util.getTokenUid(req.cookies.token);
	    let conn;
	    try {
	    	conn = await util.getDBConnection(); // get connection from db
	    	const user = await conn.query("select user_id, s_num, name, email, total_credit from user;");
		res.json({suc : true, user});
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
*/

// get info of specify user
router.get('/specify', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    let conn;
	    try {
	    	conn = await util.getDBConnection(); // get connection from db
	    	let user_id = req.query.user_id; // get user id from query string
		let is_self = false; // whether query the data of themselves
	    	const current_user_id = await util.getTokenUid(req.cookies.token);
		if (user_id == "null") {
		    // if user_id equal to null, try to get the user id from cookies, which means show the info of themsevles
		    user_id = current_user_id
		    is_self = true; // is query the data of themselves
		}
		else if (user_id == current_user_id) {
		    is_self = true;
		}
	    	let user = await conn.query("select user_id, s_num, name, email, total_credit from user where user_id = ?;", user_id);
		const s_num = user[0].s_num;
		const name = user[0].name;
		const email = user[0].email;
		const total_credit = user[0].total_credit;
		res.json({suc : true, s_num, name, user_id, email, total_credit, is_self});
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
