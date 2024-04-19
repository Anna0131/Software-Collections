// Required modules
const router = require('express').Router();
const util = require("./../utilities/utilities.js");
var jwt = require('jsonwebtoken');

async function insertUser(account, name) {
    // return uid of account and insert into user table if this account not existed
	    let conn;
	    try {
	    	conn = await util.getDBConnection(); // get connection from db
		let user_id;
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
		return user_id.toString();
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

//設定一個 HTTP GET 請求的路由處理 -> 前往根 URL（ '/'）會被觸發
router.get('/', function(req, res) {
    res.sendFile(util.getParentPath(__dirname) + '/templates/login.html');  //回應靜態文件
    return;
});


//設定 POST request 的 routing，當 user 提交表單時會被觸發
router.post('/', async function(req, res) { // 注意這裡加了 async
    try {
        let suc = true;
        const account = req.body.account;
        const password = req.body.password;

        const authen_result = await util.loginAuthentication(account, password);
        if (authen_result != false) {
	    // login successfully
	    const user_id = await insertUser(account, authen_result); // insert into user table if this account not existed
            console.log("valid", user_id);
            data = {uid : user_id};
            const token = jwt.sign({ data, exp: Math.floor(Date.now() / 1000) + (60 * 15) }, 'my_secret_key');
            res.cookie("token", token);
        }
        else {
            suc = false;
        }

        res.json({suc : suc});
    }
    catch (e) {
        console.log(e);
        res.json({suc: false}); // 確保出錯時回傳失敗的訊息
    }    
});

module.exports = router;
