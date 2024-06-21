// Required modules
const router = require("express").Router();
const util = require("./../utilities/utilities.js");
const jwt = require('jsonwebtoken');

async function insertUser(account, name) {
    // return uid of account and insert into user table if this account not existed
	let conn;
	let user_id;
	try {
		conn = await util.getDBConnection(); // get connection from db
		let user = await conn.query("select * from user where s_num = ?;", account);
		// account not existed
		if (user.length == 0) {
			let role_id; // check the role_id of different role with length of account
			let total_credit;
			if (account.length == 5) {
			// account of teacher or other school employee
			total_credit = 10000;
				role_id = await conn.query("select role_id from role where name = ?;", "teacher");
			role_id = role_id[0].role_id;
			}
			else {
			// account of student
			total_credit = 0;
				role_id = await conn.query("select role_id from role where name = ?;", "student");
			role_id = role_id[0].role_id;
			}
			const result = await conn.batch('insert into user(role_id, name, total_credit, s_num) values(?,?,?,?);', [role_id, name, total_credit, account]);
			user_id = result.insertId;
			await conn.commit(); // commit changes
		}
		else {
			user_id = user[0].user_id;
		}
	}
	catch(e) {
		console.error(e);
		await conn.rollback(); // rollback transaction
		res.json({suc : false});
	}
	finally {
		util.closeDBConnection(conn); // close db connection
		return user_id.toString();
	}
}

async function checkAddingUser(account, password) {
    // if this account can not login on moodle, then check if this account is additionally added by root
	let conn;
	let user_id;
	try {
		conn = await util.getDBConnection(); // get connection from db
		const user = await conn.query("select user_id from user where name = ? and password = ?;", [account, password]);
		// account exists or not
		if (user[0] != undefined && user[0]["user_id"]) {
		    return user[0]["user_id"];
		}
		else {
		    return false;
		}
	}
	catch(e) {
		console.error(e);
		await conn.rollback(); // rollback transaction
		return false;
	}
	finally {
		util.closeDBConnection(conn); // close db connection
	}
}

router.post('/', async function(req, res) { // 注意這裡加了 async
    try {
        let suc = true;
        const account = req.body.account;
        const password = req.body.password;

        let authen_result = await util.loginAuthentication(account, password);
        if (authen_result != "login failed") {
	    // login successfully
	    const user_id = await insertUser(account, authen_result); // insert into user table if this account not existed
            data = {uid : user_id};
            const token = jwt.sign({ data, exp: Math.floor(Date.now() / 1000) + (60 * 15) }, util.jwt_key);
            res.cookie("token", token);
        }
        else {
	    // if this account can not login on moodle, then check if this account is additionally added by root
	    const user_id = await checkAddingUser(account, password);
	    if (user_id) {
	        // login successfully
	        authen_result = user_id;
                data = {uid : user_id};
                const token = jwt.sign({ data, exp: Math.floor(Date.now() / 1000) + (60 * 15) }, util.jwt_key);
                res.cookie("token", token);
	    }
	    else {
	        suc = false;
	    }
        }

        res.json({suc : suc, authen_result : authen_result});
    }
    catch (e) {
        console.log(e);
        res.json({suc: false}); // 確保出錯時回傳失敗的訊息
    }    
});

module.exports = router;
