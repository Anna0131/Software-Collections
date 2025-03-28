// Required modules
const router = require("express").Router();
const util = require("./../utilities/utilities.js");
const fs = require("fs");

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
		res.status(500).json({suc : false});
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

// get headshot of current user
router.get('/headshot', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    let user_id = req.query.user_id; // get user id from query string
	    const current_user_id = await util.getTokenUid(req.cookies.token);
	    if (user_id == "null") {
		// if user_id equal to null, try to get the user id from cookies, which means show the info of themsevles
		user_id = current_user_id
	    }
	    if (fs.existsSync(util.getParentPath(__dirname) + `/media/user_id_${user_id}/headshot.png`)) {
		// headshot of current user is existed
	    	res.sendFile(util.getParentPath(__dirname) + `/media/user_id_${user_id}/headshot.png`);
	    }
	    else {
		// send the default headshot if the user's headshot does not exist
	    	res.sendFile(util.getParentPath(__dirname) + `/media/default.png`);
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

// post headshot of current user
router.post('/headshot', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const user_id = await util.getTokenUid(req.cookies.token);
	    const headshot = req.files.image;
	    console.log(headshot);
	    let suc = false; // whether have set the image of headshot successfully
	    if (headshot != undefined) {
	        const headshot_temp_path = headshot.tempFilePath; // path of temp file uploaded by user
		const headshot_path = util.getParentPath(__dirname) + `/media/user_id_${user_id}/headshot.png`; // the path which actually store img of headshot
		try {
	            // create directory if not existed
		    if (!fs.existsSync(util.getParentPath(__dirname) + `/media/user_id_${user_id}`)){
                        fs.mkdirSync(util.getParentPath(__dirname) + `/media/user_id_${user_id}`);
                    }
		    fs.copyFileSync(headshot_temp_path, headshot_path);
		    suc = true;
		}
		catch (e) {
		    console.error(e);
		}
		fs.unlinkSync(headshot_temp_path); // remove the temp file
	    }
	    if (suc) {
	        res.json({suc});
	    }
	    else {
	        res.status(500).json({suc});
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

// post email of current user
router.post('/email', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    let conn;
	    try {
	    	conn = await util.getDBConnection(); // get connection from db
	    	const user_id = await util.getTokenUid(req.cookies.token);
		const email = req.body.email;
	    	await conn.query("update user set email = ? where user_id = ?;", [email, user_id]);
		res.json({suc : true});
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
