// Required modules
const router = require("express").Router();
const util = require("./../utilities/utilities.js");

// add a new user manually
router.post('/', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const user_id = await util.getTokenUid(req.cookies.token);
	    const authen_result = await util.ckUserPrivileges(user_id);
	    if (!authen_result) {
			// privilege of user is not enough to agree the upload of software
			return res.json({msg : "your privilege is not enough to approve the upload of software"});
	    }
	    const account_type = req.body.type; // type of account
	    const total_credit = req.body.total_credit; // credit nums which can be used by this account
	    const account = req.body.account; // name of this account
	    const password = req.body.password; // name of this account
	    let conn;
	    try {
	    	conn = await util.getDBConnection(); // get connection from db
		// ensure the account name does not conflicted with the data in db
	    	const same_name = await conn.query("select COUNT(*) from user where name = ?;", account);
		if (same_name[0]["COUNT(*)"] > 0) {
		    res.json({suc : false, msg : "conflicted account"});
		}
		else {
	    	    let role_id = await conn.query("select role_id from role where name = ?;", account_type);
		    role_id = role_id[0].role_id;
		    // Start Transaction
		    await conn.beginTransaction();
	    	    const user_num = await conn.query("select COUNT(*) from user;");
		    const s_num = Number(user_num[0]["COUNT(*)"]) + 1;
		    const result = await conn.batch('insert into user(role_id, name, password, total_credit, s_num) values(?,?,?,?,?);', [role_id, account, password, total_credit, s_num], async function(err, result, fields) {
		        if (err) throw err;
		    });
		    const user_id = result.insertId;
		    await conn.commit(); // commit changes
		    res.json({suc : true});
		}
	    }
	    catch(e) {
		console.error(e);
	        res.status(500).json({msg : "Internal Server Error"});
		await conn.rollback(); // rollback transaction
	    }
	    finally {
		util.closeDBConnection(conn); // close db connection
	    }
        }
        else {
            res.status(401).json({msg : "login failed"});
        }
    }
    catch(e) {
        console.error(e);
	res.status(500).json({msg : "Internal Server Error"});
    }
});

// get docker spec is no need for the manager privilege, as these infos need to be display on apply page.
router.get('/dockerSpec', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    let conn;
	    try {
	    	conn = await util.getDBConnection(); // get connection from db
	    	const result = await conn.query("select * from docker_spec;");
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
	res.json({suc : false});
    }
});

function checkSpecFormat(ram, cpu, disk) {
    // check the format of docker spec is valid
    return true;
}

// update the spec of docker limitation
router.post('/dockerSpec', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const user_id = await util.getTokenUid(req.cookies.token);
	    const authen_result = await util.ckUserPrivileges(user_id);
	    if (!authen_result) {
			// privilege of user is not enough to agree the upload of software
			return res.json({msg : "your privilege is not enough to approve the upload of software"});
	    }
	    const ram = req.body.ram; // spec of ram
	    const cpu = req.body.cpu; // spec of cpu
	    const disk = req.body.disk; // spec of cpu
	    const port = req.body.port; // spec of port
	    if (checkSpecFormat(ram, cpu, disk)) {
	        let conn;
	        try {
	    	    conn = await util.getDBConnection(); // get connection from db
		    // Start Transaction
		    await conn.beginTransaction();
		    // reset the spec
		    await conn.batch("delete from docker_spec where docker_spec_id > ?;", [0]); // batch must have value set
		    // set new spec
		    // RAM
		    const ram_list = ram.split(",");
		    for (let i = 0;i < ram_list.length;i++) {
		        await conn.batch('insert into docker_spec(spec_type, spec_info) values(?,?);', ["ram", ram_list[i]]);
		    }
		    // CPU
		    const cpu_list = cpu.split(",");
		    for (let i = 0;i < cpu_list.length;i++) {
		        await conn.batch('insert into docker_spec(spec_type, spec_info) values(?,?);', ["cpu", cpu_list[i]]);
		    }
		    // DISK
		    const disk_list = disk.split(",");
		    for (let i = 0;i < disk_list.length;i++) {
		        await conn.batch('insert into docker_spec(spec_type, spec_info) values(?,?);', ["disk", disk_list[i]]);
		    }
		    // external Port nums
		    await conn.batch('insert into docker_spec(spec_type, spec_info) values(?,?);', ["port", port]);

		    await conn.commit(); // commit changes
		    res.json({suc : true});
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
	}
    }
    catch(e) {
        console.log(e);
	res.json({suc : false});
    }
});

// update maximum numbers of limitation of application in a single day
router.post('/max_application_nums', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const user_id = await util.getTokenUid(req.cookies.token);
	    const authen_result = await util.ckUserPrivileges(user_id);
	    if (!authen_result) {
			// privilege of user is not enough to agree the upload of software
			return res.json({msg : "your privilege is not enough to approve the upload of software"});
	    }
	    const max_application_nums = req.body.max_nums; //
	    let conn;
	    try {
	    	conn = await util.getDBConnection(); // get connection from db
	    	await conn.query("update general_settings set value = ? where settings_name = 'max_application_nums';", [max_application_nums]);
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
	res.json({suc : false});
    }
});

module.exports = router;
