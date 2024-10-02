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
			let email = null;
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
				email = `s${account}@mail1.ncnu.edu.tw`;
			}
			const result = await conn.batch('insert into user(role_id, name, total_credit, s_num, email) values(?,?,?,?,?);', [role_id, name, total_credit, account, email]);
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

async function insertLoginRecord(suc, account, ip) {
    // record the login record no matter successful or not
	// convert ipv6 to ipv4
	ip = ip.split(":");
	ip = ip[ip.length-1];
    
	let conn;
	let user_id;
	const time = new Date();
	try {
		conn = await util.getDBConnection(); // get connection from db
		await conn.query("insert into login_record(ip, account, time, suc) values(?, ?, ?, ?);", [ip, account, time, suc]);
	}
	catch(e) {
		console.error(e);
	}
	finally {
		util.closeDBConnection(conn); // close db connection
	}
}

async function blockBruteForce(ip) {
    // convert ipv6 to ipv4
    ip = ip.split(":");
    ip = ip[ip.length-1];

    // block rule
    const block_rule = {failed_nums : 3, period : 10}; // ban the ip from login, if it failed over {failed_nums} times in {period} min

    // check if this ip should be banned
	let conn;
	let user_id;
	let is_blocked = true;
	const MS_PER_MINUTE = 60000;
	const time = new Date();
	const period_start = new Date(time - block_rule.period * MS_PER_MINUTE);
	try {
		conn = await util.getDBConnection(); // get connection from db
		// get the number of failure in the period of this ip
		const result = await conn.query("select COUNT(*) from login_record where ip = ? and time >= ? and suc = 0;", [ip, period_start]);
		if (result[0]["COUNT(*)"] < block_rule.failed_nums) {
		    is_blocked = false;
		}
	}
	catch(e) {
		console.error(e);
	}
	finally {
		util.closeDBConnection(conn); // close db connection
	}
	return is_blocked
}

// process login request
router.post('/', async function(req, res) { // 注意這裡加了 async
    try {
        let suc = true;
        const account = req.body.account;
        const password = req.body.password;

		// check if this ip exceed the limitation of login failure in a period of time
		const is_blocked = await blockBruteForce(req.ip);
		if (is_blocked) {
	    	suc = false;
	    	res.status(403).json({suc : suc, authen_result : "超過一段時間內限制的失敗次數"});
		}
		else {
        	let authen_result = await util.loginAuthentication(account, password);
        	if (authen_result != "login failed") {
	        	// login successfully
	        	const user_id = await insertUser(account, authen_result); // insert into user table if this account not existed
            	data = {uid : user_id};
            	const token = jwt.sign({ data, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30) }, util.jwt_key);
            	res.cookie("token", token);
        	}
        	else {
	        	// if this account can not login on moodle, then check if this account is additionally added by root
	        	const user_id = await checkAddingUser(account, password);
	        	if (user_id) {
	            	// login successfully
	            	authen_result = user_id;
                    data = {uid : user_id};
                	const token = jwt.sign({ data, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30) }, util.jwt_key);
                    res.cookie("token", token);
	        	}
	        	else {
	            	suc = false;
	        	}	
        	}
            res.json({suc : suc, authen_result : authen_result});
	    	insertLoginRecord(suc, account, req.ip);
		}
    }
    catch (e) {
        console.error(e);
		res.status(500).json({msg : "Internal Server Error"});
    }    
});

// process login request
router.post('/sso', async function(req, res) { // 注意這裡加了 async
    try {
        let suc = true;
        const account = req.body.account;
        const password = req.body.password;
        const xsrf = req.body.xsrf;
        const session = req.body.session;
        const captcha = req.body.captcha;
        const csrf = req.body.csrf;

		// check if this ip exceed the limitation of login failure in a period of time
		const is_blocked = await blockBruteForce(req.ip);
		if (is_blocked) {
	    	suc = false;
	    	res.status(403).json({suc : suc, authen_result : "超過一段時間內限制的失敗次數"});
		}
		else {
        	let authen_result = await util.loginAuthenticationSSO(account, password, xsrf, session, captcha, csrf);
			console.log(authen_result);
        	if (authen_result != "login failed") {
	        	// login successfully
	        	const user_id = await insertUser(account, authen_result); // insert into user table if this account not existed
            	data = {uid : user_id};
            	const token = jwt.sign({ data, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30) }, util.jwt_key);
            	res.cookie("token", token);
        	}
        	else {
	        	// if this account can not login on moodle, then check if this account is additionally added by root
	        	const user_id = await checkAddingUser(account, password);
	        	if (user_id) {
	            	// login successfully
	            	authen_result = user_id;
                    data = {uid : user_id};
                	const token = jwt.sign({ data, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30) }, util.jwt_key);
                    res.cookie("token", token);
	        	}
	        	else {
	            	suc = false;
	        	}	
        	}
            res.json({suc : suc, authen_result : authen_result});
	    	insertLoginRecord(suc, account, req.ip);
		}
    }
    catch (e) {
        console.error(e);
		res.status(500).json({msg : "Internal Server Error"});
    }    
});

module.exports = router;
