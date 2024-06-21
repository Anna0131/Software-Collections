// Required modules
const router = require("express").Router();
const util = require("./../utilities/utilities.js");
const sendEmail = require("./../utilities/sendEmail.js");
const jwt = require('jsonwebtoken');

function informApplicant(external_port, software_id, user_info) {
    // send the email to inform the agreement of project to the person who applied this project
    const new_line = "<br/>";
    const software_url = util.getUrlRoot(util.system_url) + ':' + external_port;
    const receivers = [user_info.email];
    const topic = "軟體庫系統通知 - 申請成功通過";
    let content = `您好，您申請的軟體編號 : ${software_id}，已成功通過申請` + new_line;
    content += `此軟體已部屬於：${software_url}`;
    sendEmail.send(receivers, topic, content);
}

function ckUserPrivileges(user_id) {
    // check whether the privilege of user is not enough to agree the upload of software
    return true;
}

// create container by pulling the image from docker hub
function createContainer(docker_image, internal_port, ram, cpu, disk) {
    const spawn = require("child_process").spawn;
    const pythonScript = util.getParentPath(__dirname) + "/utilities/createContainer.py"; 
    let index = 0;
    ram += "g"; // unit of ram is gigabytes
    const pythonProcess = spawn('python', [pythonScript, docker_image, internal_port, ram, cpu, disk]);

        return new Promise((resolve, reject) => { // 包裝成 Promise

            pythonProcess.stderr.on('data', (data) => {
                console.error(`stderr: ${data.toString()}`);
                resolve([false, data.toString()]); // failed to create container, return the error msg
            });

            pythonProcess.on('exit', (code) => {
                console.log(`child process exited with code ${code}`);
                if (code !== 0) {
                    reject(new Error(`child process exited with code ${code}`)); // 非 0 退出代碼表示錯誤
                }
            });

            pythonProcess.on('error', (err) => {
                console.error(err);
                reject(err); // 子進程啟動失敗
            });

            pythonProcess.stdout.on('data', (data) => {
		if (index++ != 0) {
                    console.log(`returning data of creating container: ${data.toString()}`);
		    console.log("test");
		    const create_suc = data.toString().split("||")[0];
		    const external_port = data.toString().split("||")[1].split('\n')[0];
                    if (create_suc === "true") {
                        resolve([true, external_port]); // create container successfully, return the external port which the service is deployed on it
                    } 
		    else {
                        resolve([false, external_port]); // failed to create container, return the error msg
                    }
		}
            });
	});
}

// processing request

// return the data of softwares which are upload successfully
router.get('/', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const user_id = await util.getTokenUid(req.cookies.token);
	    let softwares;
	    let conn;
	    try {
	    	conn = await util.getDBConnection(); // get connection from db
		softwares = await conn.query("select s.view_nums, s.software_id, s.topic, s.description, s.domain, s.create_time, s.external_port, u.name, u.user_id from software as s, user as u where s.success_upload = 1 and u.user_id = s.owner_user_id;"); // return the necessary data which will be display on the page of main
	    	res.json({suc : true, softwares});
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

// return the data of softwares which are upload successfully
router.get('/self', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const user_id = await util.getTokenUid(req.cookies.token);
	    let softwares;
	    let conn;
	    try {
	    	conn = await util.getDBConnection(); // get connection from db
		//softwares = await conn.query("select * from software where success_upload = 1;");
		softwares = await conn.query("select s.view_nums, s.software_id, s.topic, s.description, s.domain, s.create_time, s.external_port, s.success_upload from software as s where s.owner_user_id = ?;", [user_id]); // return the necessary data which will be display on the page of main
	    	res.json({suc : true, softwares});
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

function verifyLastView(software_last_view_time) {
    try {
	return jwt.verify(software_last_view_time, util.jwt_key).data;
    }
    catch(e) {
	console.log(e);
	return false;
    }
}

// check if the current request is new request to the page of this software
function validNewView(software_last_view_time, res, software_id) {
    const current_time = new Date();
    if (software_last_view_time == undefined || !verifyLastView(software_last_view_time)) {
	// first visit the page or jwt expired, sign a cookie to store the visit time
	const cookie_name = `software_${software_id}_last_view_time`;
	const data = {cookie_name : current_time};
    	const token = jwt.sign({ data, exp: Math.floor(Date.now() / 1000) + (60 * 15) }, util.jwt_key);
    	res.cookie(cookie_name, token);
	return true;
    }
    if ((current_time - new Date(software_last_view_time)) / 60000 > 3) {
	// the time interval is in the valid time, update the cookie
	const cookie_name = `software_${software_id}_last_view_time`;
	const data = {cookie_name : current_time};
    	const token = jwt.sign({ data, exp: Math.floor(Date.now() / 1000) + (60 * 15) }, util.jwt_key);
    	res.cookie(cookie_name, token);
	return true;
    }
    else {
	// not valid new request
	return false;
    }
}

// return the data of a specify software with software id, which is upload successfully
router.get('/specify', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const user_id = await util.getTokenUid(req.cookies.token);
	    let software_id = req.query.software_id; // get user id from query string
	    let software_info;
	    let conn;
	    try {
	    	conn = await util.getDBConnection(); // get connection from db
		// get the info of software
		software_info = await conn.query("select s.view_nums, s.software_id, s.topic, s.description, s.domain, s.create_time, s.external_port, u.name, u.user_id from software as s, user as u where s.success_upload = 1 and u.user_id = s.owner_user_id and s.software_id = ?;", [software_id]); // return the necessary data which will be display on the page of main
		software_info = software_info[0];
		// add the view nums
		const cookie_name = `software_${software_id}_last_view_time`;
		const software_last_view_time = req.cookies[cookie_name];
		if (validNewView(software_last_view_time, res, software_id)) {
		    conn.query("update software set view_nums = view_nums + 1 where software.software_id = ?", [software_id]);
		}
	    	res.json({suc : true, software_info});
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

// return the data of a specify software with software id, which is upload successfully
router.get('/bulletin', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const user_id = await util.getTokenUid(req.cookies.token);
	    const software_id = req.query.software_id; // get user id from query string
	    let bulletin;
	    let conn;
	    try {
	    	conn = await util.getDBConnection(); // get connection from db
		bulletin = await conn.query("select b.software_id, b.comment_user_id, b.content, b.create_time, u.name from bulletin as b, software as s, user as u where s.success_upload = 1 and u.user_id = b.comment_user_id and b.software_id = s.software_id and b.software_id = ?;", [software_id]); // return the necessary data which will be display on the page of main
	    	res.json({suc : true, bulletin});
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

// post a comment to a software on the bulletin
router.post('/bulletin', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const user_id = await util.getTokenUid(req.cookies.token);
	    const software_id = req.body.software_id;
	    const content = req.body.content;
	    const create_time = new Date();
	    let conn;;
	    try {
	    	conn = await util.getDBConnection(); // get connection from db
		await conn.query("insert into bulletin(software_id, comment_user_id, content, create_time) values(?, ?, ?, ?);", [software_id, user_id, content, create_time]); // return the necessary data which will be display on the page of main
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

// finish the application of creating container when admin press the agree button in email
router.get('/agreement', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const user_id = await util.getTokenUid(req.cookies.token);
	    if (!ckUserPrivileges(user_id)) {
		// privilege of user is not enough to agree the upload of software
		res.json({msg : "privilege of user is not enough to agree the upload of software"});
	    }
	    // update the status of software to upload allowed, and do the other works to create service 
	    const software_id = req.query.software_id;
	    let software_info;
	    let conn;
	    try {
	    	conn = await util.getDBConnection(); // get connection from db
	    	await conn.query("update software set success_upload = 1 where software_id = ?;", software_id);
		software_info = await conn.query("select docker_image, internal_port, memory, cpu, storage from software where software_id = ?", software_id);
	    }
	    catch(e) {
		console.error(e);
		res.json({suc : false});
	    }
	    finally {
		util.closeDBConnection(conn); // close db connection
	    }
	    // pull app image from docker hub, and create the container on the docker server
	    try {
		const container_create = await createContainer(software_info[0].docker_image, software_info[0].internal_port, software_info[0].memory, software_info[0].cpu, software_info[0].storage);
		if (container_create[0] == false) {
		    // failed to create container, return the error msg
		    res.json({msg : "failed to create container : " + container_create[1]}); 
		}
		else {
		    // create container successfully
		    // return the external port which the service is deployed on it, and update to the data in db

		    const external_port = container_create[1];
		    let user_info;
	    	    try {
	    		conn = await util.getDBConnection(); // get connection from db
	    		await conn.query("update software set external_port = ? where software_id = ?;", [external_port, software_id]);
			// get the info of user to send back the email
			user_info = await conn.query("select * from user where user_id = ?", user_id);
	    	    }
	    	    catch(e) {
			console.error(e);
			res.json({suc : false});
	    	    }
	    	    finally {
			util.closeDBConnection(conn); // close db connection
	    	    }
		    
		    // send the email to inform the agreement of project to the person who applied this project
		    informApplicant(external_port, software_id, user_info[0]);
		    
	    	    //res.json({suc : "true", external_port});
		    res.send("<script>alert('成功建立 Docker Container！');window.location.href = '/main';</script>");
		}
	    }
	    catch (e) {
		console.log(e);
		res.json({msg : "failed to create container : " + e});
	    }
	}
	else {
	    res.redirect("/login");
        }
    }
    catch(e) {
        console.log(e);
	res.redirect("/login");
    }
});

function deleteContainer(container_name) {
            const spawn = require("child_process").spawn;
    	    const pythonScript = util.getParentPath(__dirname) + "/utilities/deleteContainer.py"; 
            const pythonProcess = spawn('python', [pythonScript, container_name]);

            //console.log(`account: ${account}`);
            //console.log(`password: ${password}`);

            pythonProcess.stdout.on('data', (data) => {
		data = data.toString().slice(0, -1); // remove the last char 
                if (data === 'false') {
                    return false; // 刪除失敗
                } else {
                    return true; // 刪除成功
                }
            });

            pythonProcess.stderr.on('data', (data) => {
                console.error(`stderr: ${data.toString()}`);
		return false;
            });

            pythonProcess.on('exit', (code) => {
                //console.log(`child process exited with code ${code}`);
                if (code !== 0) {
                    //reject(new Error(`child process exited with code ${code}`)); // 非 0 退出代碼表示錯誤
		    console.error(`child process exited with code ${code}`);
		    return false;
                }
            });

            pythonProcess.on('error', (err) => {
                console.error(err);
                //reject(err); // 子進程啟動失敗
            });
}

// delete the software
router.delete('/', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const user_id = await util.getTokenUid(req.cookies.token);
	    const software_id = req.body.software_id;
	    const external_port = req.body.external_port;
	    // delete record from db
	    let conn;
	    try {
	    	conn = await util.getDBConnection(); // get connection from db
		await conn.query("delete from software where software_id = ? and owner_user_id = ?", [software_id, user_id]);
	    	res.json({suc : true});
	    }
	    catch(e) {
		console.error(e);
		res.json({suc : false, msg : "sql error"});
	    }
	    finally {
		util.closeDBConnection(conn); // close db connection
	    }
	    // delete container from docker server
	    deleteContainer(external_port)
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

// get the detailed info of specify container

// get the logs of the container
async function getContainerLog(container_name) {
    // call python script
    const pythonScript = util.getParentPath(__dirname) + "/utilities/getContainerInfo.py"; 
    const info_type = "logs";
    const spawn = require("child_process").spawn;
    const pythonProcess = spawn('python', [pythonScript, container_name, info_type]);

            return new Promise((resolve, reject) => { // 包裝成 Promise

            	pythonProcess.stderr.on('data', (data) => {
                    console.error(`stderr: ${data.toString()}`);
                    resolve([false, data.toString()]); // failed to create container, return the error msg
            	});

            	pythonProcess.on('exit', (code) => {
                    console.log(`child process exited with code ${code}`);
                    if (code !== 0) {
                        reject(new Error(`child process exited with code ${code}`)); // 非 0 退出代碼表示錯誤
                    }
            	});

            	pythonProcess.on('error', (err) => {
                    console.error(err);
                    reject(err); // 子進程啟動失敗
            	});

            	pythonProcess.stdout.on('data', (data) => {
                    console.log(`returning data of creating container: ${data.toString()}`);
		    data = data.toString().replaceAll("'", '"'); 
		    data = JSON.parse(data);
                    if (data.suc === "true") {
                       resolve([true, data.result]); // create container successfully, return the external port which the service is deployed on it
                    } 
		    else {
                        resolve([false, data.error]); // failed to create container, return the error msg
                    }
                });
	    });
}


router.get('/info/logs', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const container_name = req.query.external_port;
	    const user_id = await util.getTokenUid(req.cookies.token);
	    const result = await getContainerLog(container_name);
	    if (result[0]) {
		res.json({suc : true, result : result[1]});
	    }
	    else {
		res.json({suc : false, msg : result[1]});
	    }
	}
	else {
            res.json({msg : "login failed"});
        }
    }
    catch(e) {
        console.log(e);
        res.json({msg : "error occured"});
    }
});

// get the logs of the container
async function getContainerResourceUsage(container_name) {
    // call python script
    const pythonScript = util.getParentPath(__dirname) + "/utilities/getContainerInfo.py"; 
    const info_type = "resource_usage";
    const spawn = require("child_process").spawn;
    const pythonProcess = spawn('python', [pythonScript, container_name, info_type]);

            return new Promise((resolve, reject) => { // 包裝成 Promise

            	pythonProcess.stderr.on('data', (data) => {
                    console.error(`stderr: ${data.toString()}`);
                    resolve([false, data.toString()]); // failed to create container, return the error msg
            	});

            	pythonProcess.on('exit', (code) => {
                    console.log(`child process exited with code ${code}`);
                    if (code !== 0) {
                        reject(new Error(`child process exited with code ${code}`)); // 非 0 退出代碼表示錯誤
                    }
            	});

            	pythonProcess.on('error', (err) => {
                    console.error(err);
                    reject(err); // 子進程啟動失敗
            	});

            	pythonProcess.stdout.on('data', (data) => {
                    console.log(`returning data of creating container: ${data.toString()}`);
		    data = (data.toString()).replaceAll("'", '"'); 
		    data = JSON.parse(data);
                    if (data.suc === "true") {
                       resolve([true, data.result]); // create container successfully, return the external port which the service is deployed on it
                    } 
		    else {
                        resolve([false, data.error]); // failed to create container, return the error msg
                    }
                });
	    });
}


router.get('/info/resourceUsage', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const container_name = req.query.external_port;
	    const user_id = await util.getTokenUid(req.cookies.token);
	    const result = await getContainerResourceUsage(container_name);
	    if (result[0]) {
		res.json({suc : true, result : result[1]});
	    }
	    else {
		res.json({suc : false, msg : result[1]});
	    }
	}
	else {
            res.json({msg : "login failed"});
        }
    }
    catch(e) {
        console.log(e);
        res.json({msg : "error occured"});
    }
});

module.exports = router;
