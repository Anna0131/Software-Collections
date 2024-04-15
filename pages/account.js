// Required modules
const router = require("express").Router();
const util = require("./../utilities/utilities.js");

// processing request
router.get('/', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
    	    res.sendFile(util.getParentPath(__dirname) + "/templates/account.html");  //回應靜態文件
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

router.post('/', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const account_type = req.body.type; // type of account
	    const total_credit = req.body.total_credit; // credit nums which can be used by this account
	    const name = req.body.name; // name of this account
	    let conn;
	    try {
	    	conn = await util.getDBConnection(); // get connection from db
	    	let role_id = await conn.query("select role_id from role where name = ?;", account_type);
		role_id = role_id[0].role_id;
		// Start Transaction
		await conn.beginTransaction();
		const result = await conn.batch('insert into user(role_id, name, total_credit) values(?,?,?);', [role_id, name, total_credit], async function(err, result, fields) {
		    if (err) throw err;
		});
		const user_id = result.insertId;
		await conn.commit(); // commit changes
	    }
	    catch(e) {
		console.error(e);
		await conn.rollback(); // rollback transaction
		res.json({suc : false});
	    }
	    finally {
		util.closeDBConnection(conn); // close db connection
	    }
        }
        else {
            res.json({msg : "login failed"});
        }
	res.json({suc : true});
    }
    catch(e) {
        console.log(e);
	res.json({suc : false});
    }
});

module.exports = router;
