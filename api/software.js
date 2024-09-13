// Required modules
const router = require("express").Router();
const util = require("./../utilities/utilities.js");
const sendEmail = require("./../utilities/sendEmail.js");
const jwt = require('jsonwebtoken');

function informApplicantAndAdmin(external_port, software_id, user_info, container_name) {
    // send the email to inform the agreement of project to the person who applied this project
    const new_line = "<br/>";
    const software_url = util.system_ip + ':' + external_port;
    const receivers = [user_info.email, sendEmail.admin_email];
    const topic = "軟體庫系統通知 - 申請成功通過";
    let content = `您好，您申請的軟體編號 : ${software_id}，已成功通過申請` + new_line;
    content += `容器名稱：${container_name}` + new_line;
    content += `已成功部屬於：${software_url}`;
    sendEmail.send(receivers, topic, content);
}

async function ckUserPrivileges(user_id) {
    // check whether the privilege of user is not enough to agree the upload of software
    const role_id = await util.getUserRole(user_id);
    if (role_id == 3) {
        // super user's role id is 3
	return true;
    }
    else {
	return false;
    }
}

// create container by pulling the image from docker hub
function createContainer(docker_image, internal_port, ram, cpu, disk, env, volumes, res, user_id) {
    const spawn = require("child_process").spawn;
    const pythonScript = util.getParentPath(__dirname) + "/utilities/createContainer.py"; 
    let index = 0;
    ram += "m"; // unit of ram is gigabytes
    let is_pulling_image = false;
    // as shell is used, so put the text in a set of quote having many lines is necessary
    internal_port = internal_port == null ? "'null'" : internal_port;
    env = env == 'null' || env == null ? 'null' : "'" + env + "'";
    volumes = volumes == 'null' || volumes == null ? 'null' : "'" + volumes + "'";
    const pythonProcess = spawn('python3', [pythonScript, docker_image, internal_port, ram, cpu, disk, env, volumes, user_id], {shell: true});

        return new Promise((resolve, reject) => { // 包裝成 Promise

            pythonProcess.stderr.on('data', (data) => {
		// no such image error is fined, as the python script will pull it later
		if (!data.includes("No such image")) {
                    console.error(`stderr: ${data.toString()}`);
                    resolve([false, data.toString(), is_pulling_image]); // failed to create container, return the error msg
		}
		else {
                    console.log(`stderr: ${data.toString()}`);
		    // return the alert msg first to avoid gateway timeout
		    res.json({msg : "It will take some time to pull image, so you can goto https://sw-registry.im.ncnu.edu.tw/audit to check details."});
    		    is_pulling_image = true; // set this to mark that system already response
		}
            });

            pythonProcess.on('exit', (code) => {
                console.log(`child process exited with code ${code}`);
                if (code !== 0) {
                    reject(new Error(`child process exited with code ${code}`)); // 非 0 退出代碼表示錯誤
                }

            });

            pythonProcess.on('error', (err) => {
                console.error(err);
                // reject(err); // 子進程啟動失敗
                resolve([false, "failed to create container : " + error, is_pulling_image]); // failed to create container, return the error msg
            });

            pythonProcess.stdout.on('data', (data) => {
		if (index++ != 0) {
		    try {
		        const create_suc = data.toString().split("||")[0];
		        const external_port = data.toString().split("||")[1].split('\n')[0];
		        const container_name = data.toString().split("||")[2].split('\n')[0];
                        if (create_suc === "true") {
                            resolve([true, external_port, container_name, is_pulling_image]); // create container successfully, return the external port which the service is deployed on it
                        } 
		        else {
                            resolve([false, external_port, is_pulling_image]); // failed to create container, return the error msg
                        }
		    }
		    catch(e) {
			console.error(e);
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

// return the data of softwares which are not upload successfully
router.get('/not_passed', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const user_id = await util.getTokenUid(req.cookies.token);
	    // check the user id have admin or teacher permisssion
	    if (!util.is_numeric(user_id) || util.getUserRole(user_id) < 1) {
		return res.json({suc : false, msg : "invalid credentials"});
	    }
	    let softwares;
	    let conn;
	    try {
	    	conn = await util.getDBConnection(); // get connection from db
			softwares = await conn.query("select s.software_id, s.topic, s.description, s.create_time, u.name, u.user_id from software as s, user as u where s.success_upload = 0 and s.rejected = 0 and u.user_id = s.owner_user_id;"); // return the softwares which are not passed the approval and have not been rejected
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

// return the all software info of the user
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

async function validCheckContainerInfo(user_id, software_id) {
    // only the owner and super user can check the unapproved container info
    let conn;
    try {
    	conn = await util.getDBConnection(); // get connection from db
	// check the user is the owner or the software is approved
	const is_owner = await conn.query("select COUNT(*) from software where software_id = ? and (owner_user_id = ? or success_upload = 1);", [software_id, user_id]);
	if (is_owner[0]["COUNT(*)"]) {
	    return true;
	}
	else {
	    const is_superuser = await conn.query("select role_id from user where user_id = ?;", [user_id]);
	    if (is_superuser[0]["role_id"] > 1) {
		// not a normal user
		return true;
	    }
	    return false;
	}
    }
    catch(e) {
	console.error(e);
	return false;
    }
    finally {
	util.closeDBConnection(conn); // close db connection
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
	    // only the owner and super user can check the unapproved container info
	    const authen_result = await validCheckContainerInfo(user_id, software_id);
	    if (!authen_result) {
		return res.json({suc : false, msg : "not enough privileged to check the unapproved container info"});
	    }
	    try {
	    	conn = await util.getDBConnection(); // get connection from db
		// get the info of software
		software_info = await conn.query("select s.success_upload, s.view_nums, s.software_id, s.topic, s.description, s.domain, s.create_time, s.external_port, u.name, u.s_num from software as s, user as u where u.user_id = s.owner_user_id and s.software_id = ?;", [software_id]); // return the necessary data which will be display on the page of main
		software_info = software_info[0];
		software_info.ip = util.system_ip;
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
	let pulling_image = false;
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const user_id = await util.getTokenUid(req.cookies.token);
	    const authen_result = await ckUserPrivileges(user_id);
	    if (!authen_result) {
			// privilege of user is not enough to agree the upload of software
			return res.json({msg : "your privilege is not enough to approve the upload of software"});
	    }
	    // update the status of software to upload allowed, and do the other works to create service 
	    const software_id = req.query.software_id;
	    let software_info;
	    let conn;
	    try {
	    	conn = await util.getDBConnection(); // get connection from db
		software_info = await conn.query("select owner_user_id, docker_image, internal_port, memory, cpu, storage, env, volumes from software where software_id = ?", software_id);
	    }
	    catch(e) {
		console.error(e);
		res.json({suc : false});
	    }
	    finally {
		util.closeDBConnection(conn); // close db connection
	    }
	    try {
		// check whether the application includes deploying the container
		if (!util.isEmptyStr(software_info[0].docker_image)) {
	            // pull app image from docker hub, and create the container on the docker server
		    const container_create = await createContainer(software_info[0].docker_image, software_info[0].internal_port, software_info[0].memory, software_info[0].cpu, software_info[0].storage, software_info[0].env, software_info[0].volumes, res, software_info[0].owner_user_id);
		    pulling_image = container_create[container_create.length - 1];
		    if (container_create[0] == false) {
		        // failed to create container, return the error msg
			if (!pulling_image) // not pulling image
		        res.json({msg : "failed to create container : " + container_create[1]}); 
		    }
		    else {
		        // create container successfully
		        // return the external port which the service is deployed on it, and update to the data in db

		        const external_port = container_create[1] == "null" ? null : container_create[1];
		        const container_name = container_create[2];
		        let user_info;
	    	        try {
	    		    conn = await util.getDBConnection(); // get connection from db
	    		    await conn.query("update software set external_port = ?, container_name = ?, success_upload = 1  where software_id = ?;", [external_port, container_name, software_id]);
			    	// get the info of user to send back the email
			    	user_info = await conn.query("select * from user where user_id in (select owner_user_id from software where software_id = ?);", software_id);
	    	        }
	       	        catch(e) {
			    console.error(e);
			    res.json({suc : false});
	    	        }
	    	        finally {
			    util.closeDBConnection(conn); // close db connection
	    	        }
		    
		        // send the email to inform the approval message to the applicant
		        informApplicantAndAdmin(external_port, software_id, user_info[0], container_name);
		    
			if (!pulling_image) // not pulling image
		        res.send("<script>alert('成功建立 Docker Container！');window.location.href = '/audit';</script>");
		    }
		}
		else {
		    // no need to create container
	    	    try {
	    	        conn = await util.getDBConnection(); // get connection from db
	    	        await conn.query("update software set success_upload = 1  where software_id = ?;", [software_id]);
		        // get the info of user to send back the email
		        user_info = await conn.query("select * from user where user_id = ?", user_id);

		        // send the email to inform the approval to the applicant
				const receivers = [user_info[0].email, sendEmail.admin_email]; 
    			const topic = "軟體庫系統通知 - 申請成功通過";
    			const new_line = "<br/>";
    			const content = `您好，您申請的軟體編號 : ${software_id}，已成功通過申請` + new_line;
				sendEmail.send(receivers, topic, content);

				// response
		        res.send("<script>alert('審核成功！');window.location.href = '/audit';</script>");
	    	    }
	       	    catch(e) {
		        console.error(e);
		        res.json({suc : false, msg : e});
	    	    }
	    	    finally {
		        util.closeDBConnection(conn); // close db connection
	    	    }
		}
	    }
	    catch (e) {
		console.log(e);
		if (!pulling_image) // not pulling image
		    res.json({msg : "failed to create container : " + e});
		// send email to inform the failure of creating container to admin
    		const topic = `軟體庫系統通知 - 建立容器 id : ${software_id} 失敗`;
    		const new_line = "<br/>";
    		const content = `軟體編號 : ${software_id}，建立失敗 ${new_line} Error ${e}`;
		sendEmail.send(sendEmail.admin_email, topic, content);
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

// finish the application of creating container when admin press the agree button in email
router.get('/disagreement', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const user_id = await util.getTokenUid(req.cookies.token);
	    const authen_result = await ckUserPrivileges(user_id);
	    if (!authen_result) {
			// privilege of user is not enough to agree the upload of software
			return res.json({msg : "your privilege is not enough to approve the upload of software"});
	    }
	    const software_id = req.query.software_id;
		const rej_msg = req.query.msg;
		if (rej_msg == undefined) {
			// let manager to input the reason about why reject the application
			res.send("<script>const msg = prompt('輸入為何拒絕申請');const searchParams = new URLSearchParams(window.location.search);searchParams.set('msg', msg);window.location.search = searchParams.toString();</script>");
		}
		else {
			// inform the applicant that the application is rejected and the reason
			res.redirect("/audit");
	    	try {
	    	    conn = await util.getDBConnection(); // get connection from db
		        // get the info of user to send back the email
			    user_info = await conn.query("select * from user where user_id in (select owner_user_id from software where software_id = ?);", software_id);

		        // send the email to inform the approval to the applicant
				const receivers = [user_info[0].email]; 
    			const topic = "軟體庫系統通知 - 申請失敗";
    			const new_line = "<br/>";
    			const content = `您好，您申請的軟體編號 : ${software_id}，申請已被拒絕${new_line}理由：${rej_msg}`;
				sendEmail.send(receivers, topic, content);

				// update the rejection status of software to rejected
	    	    await conn.query("update software set rejected = 1  where software_id = ?;", [software_id]);
	    	}
	       	catch(e) {
		        console.error(e);
		        res.json({suc : false, msg : e});
	    	}
	    	finally {
		    	util.closeDBConnection(conn); // close db connection
	    	}
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

function deleteContainer(container_name, user_id) {
            const spawn = require("child_process").spawn;
    	    const pythonScript = util.getParentPath(__dirname) + "/utilities/deleteContainer.py"; 
            const pythonProcess = spawn('python3', [pythonScript, container_name, user_id], {shell: true});

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

async function getContainerName(software_id) {
    let conn;
    try {
    	conn = await util.getDBConnection(); // get connection from db
	const container_name = await conn.query("select container_name from software where software_id = ?", [software_id]);
	return container_name[0]["container_name"];
    }
    catch(e) {
	console.error(e);
	return false;
    }
    finally {
	util.closeDBConnection(conn); // close db connection
    }
}

// delete the software
router.delete('/', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const user_id = await util.getTokenUid(req.cookies.token);
	    const software_id = req.body.software_id;
	    // delete record from db
	    let conn;
	    let container_name;
	    try {
	    	conn = await util.getDBConnection(); // get connection from db
	    	container_name = await getContainerName(software_id);
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
	    deleteContainer(container_name, user_id);
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

// get the logs of the container with py script
async function getContainerLog(container_name, user_id) {
    // call python script
    const pythonScript = util.getParentPath(__dirname) + "/utilities/getContainerInfo.py"; 
    const info_type = "logs";
    const spawn = require("child_process").spawn;
    const pythonProcess = spawn('python3', [pythonScript, container_name, info_type, user_id], {shell: true});

            return new Promise((resolve, reject) => { // 包裝成 Promise

            	pythonProcess.stderr.on('data', (data) => {
                    console.error(`stderr: ${data.toString()}`);
                    resolve([true, data.toString()]); // failed to create container, return the error msg
            	});

            	pythonProcess.on('exit', (code) => {
                    console.log(`child process exited with code ${code}`);
                    if (code !== 0) {
                        reject(new Error(`child process exited with code ${code}`)); // 非 0 退出代碼表示錯誤
                    }
            	});

            	pythonProcess.on('error', (err) => {
                    console.error(err);
                    //reject(err); // 子進程啟動失敗
            	});

            	pythonProcess.stdout.on('data', (data) => {
					try {
		    			data = data.toString().replaceAll("'", '"'); 
		    			data = JSON.parse(data);
					}
					catch (e) {
						data.error = data.toString();
						console.log(e);
					}
                    if (data.suc === "true") {
                       resolve([true, data.result]); // create container successfully, return the external port which the service is deployed on it
                    } 
		    		else {
                        resolve([false, data.error]); // failed to create container, return the error msg
                    }
                });
	    });
}


async function containerOwner(container_name) {
    let conn;
    let owner_id = null;
    try {
    	conn = await util.getDBConnection(); // get connection from db
	owner_id = await conn.query("select owner_user_id from software where container_name = ?", [container_name]);
	if (owner_id[0] != undefined) {
	    owner_id = owner_id[0]["owner_user_id"];
	}
    }
    catch(e) {
	console.error(e);
    }
    finally {
	util.closeDBConnection(conn); // close db connection
    }
    return owner_id;
}

router.get('/info/name', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const software_id = req.query.software_id;
	    // only show the docker log message on owner page
	    const user_id = await util.getTokenUid(req.cookies.token);
	    const container_name = await getContainerName(software_id);
	    const owner_user_id = await containerOwner(container_name);
	    if (container_name==null) {
			return res.json({suc : false, msg : "container can not be null"});
	    }
	    if (owner_user_id == user_id) {
		    res.json({suc : true, result : container_name});
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

router.get('/info/logs', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const software_id = req.query.software_id;
	    // only show the docker log message on owner page
	    const user_id = await util.getTokenUid(req.cookies.token);
	    const container_name = await getContainerName(software_id);
	    const owner_user_id = await containerOwner(container_name);
	    if (container_name==null) {
		return res.json({suc : false, msg : "container can not be null"});
	    }
	    if (owner_user_id == user_id) {
	        const result = await getContainerLog(container_name, user_id);
	        if (result[0] && result[1] != "false") {
		    res.json({suc : true, result : result[1]});
	        }
	        else {
		    res.json({suc : false, msg : result[1]});
	        }
	    }
	    else {
		res.json({suc : false, msg : "invalid credentials"});
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

// get the resource usage of the container with py script
async function getContainerResourceUsage(container_name, user_id) {
    // call python script
    const pythonScript = util.getParentPath(__dirname) + "/utilities/getContainerInfo.py"; 
    const info_type = "resource_usage";
    const spawn = require("child_process").spawn;
    const pythonProcess = spawn('python3', [pythonScript, container_name, info_type, user_id], {shell: true});

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

// extract the usage of ram, cpu, disk from text of docker stats
function seperateResources(origin_resources) {
    origin_resources = origin_resources.split(" ");
    let resources = {};
    let not_empty_index = 0;
    for (let i = 0;i < origin_resources.length;i++) {
	if (origin_resources[i] != "") {
	    not_empty_index++;
	    if (not_empty_index == 3) {
		resources["cpu_usage_percent"] = origin_resources[i];
	    }
	    else if (not_empty_index == 4) {
		resources["ram_usage"] = origin_resources[i];
	    }
	    else if (not_empty_index == 6) {
		resources["ram_limit"] = origin_resources[i];
	    }
	    else if (not_empty_index == 7) {
		resources["ram_usage_percent"] = origin_resources[i];
	    }
	    else if (not_empty_index == 11) {
		resources["disk_usage"] = origin_resources[i];
	    }
	}
    }
    return resources;
}

router.get('/info/resourceUsage', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const software_id = req.query.software_id;
	    const container_name = await getContainerName(software_id);
	    if (container_name==null) {
		return res.json({suc : false, msg : "container can not be null"});
	    }
	    else {
	        const user_id = await util.getTokenUid(req.cookies.token);
	    	const owner_user_id = await containerOwner(container_name);
	    	if (owner_user_id != user_id) {
		    return res.json({suc : false, msg : "invalid credentials"});
		}
	        const result = await getContainerResourceUsage(container_name, user_id);
	        if (result[0]) {
		    // return the usage of ram, cpu, disk
		    const resources = seperateResources(result[1]);
		    // make resource usage output with above info
		    const resource_usage_info = `CPU %     MEM USAGE /   LIMIT     MEM %     BLOCK<br/>${resources.cpu_usage_percent}      ${resources.ram_usage}          /   ${resources.ram_limit}      ${resources.ram_usage_percent}        ${resources.disk_usage}`.replaceAll(" ", "&nbsp;");
		    res.json({suc : true, result : resources});
	        }
	        else {
		    res.json({suc : false, msg : result[1]});
	        }
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

async function updateSoftwareDesciption(software_id, content, user_id) {
    let conn;
    try {
    	conn = await util.getDBConnection(); // get connection from db
	await conn.query("update software set description = ? where software_id = ? and owner_user_id = ?;", [content, software_id, user_id]);
    }
    catch(e) {
	console.error(e);
	return {suc : "false", msg : "sql error"};
    }
    finally {
	util.closeDBConnection(conn); // close db connection
	return {suc : "true"};
    }
}

// update description of software
router.put("/description", async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const software_id = req.body.software_id;
	    const content = req.body.content;
	    const user_id = await util.getTokenUid(req.cookies.token);
	    const result = await updateSoftwareDesciption(software_id, content, user_id);
	    res.json(result);
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
