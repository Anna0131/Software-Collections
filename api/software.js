// Required modules
const router = require("express").Router();
const util = require("./../utilities/utilities.js");

function informApplicant(external_port, software_id) {
    // send the email to inform the agreement of project to the person who applied this project
}

function ckUserPrivileges(user_id) {
    // check whether the privilege of user is not enough to agree the upload of software
    return true;
}

// create container by pulling the image from docker hub
function createContainer(docker_image, internal_port) {
    const spawn = require("child_process").spawn;
    const pythonScript = util.getParentPath(__dirname) + "/utilities/createContainer.py"; 
    let index = 0;
    const pythonProcess = spawn('python', [pythonScript, docker_image, internal_port]);

        return new Promise((resolve, reject) => { // 包裝成 Promise
            pythonProcess.stdout.on('data', (data) => {
		if (index++ != 0) {
                    console.log(`returning data of creating container: ${data.toString()}`);
		    const create_suc = data.toString().split("||")[0];
		    const external_port = data.toString().split("||")[1].split('\n')[0];
                    if (create_suc === "true") {
                        resolve([true, external_port]); // create container successfully, return the external port which the service is deployed on it
                    } else {
                        resolve([false, external_port]); // failed to create container, return the error msg
                    }
		}
            });

            pythonProcess.stderr.on('data', (data) => {
                console.error(`stderr: ${data.toString()}`);
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
		//softwares = await conn.query("select * from software where success_upload = 1;");
		softwares = await conn.query("select s.software_id, s.topic, s.description, s.domain, s.create_time, s.external_port, u.name from software as s, user as u where s.success_upload = 1 and u.user_id = s.owner_user_id;"); // return the necessary data which will be display on the page of main
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
		software_info = await conn.query("select docker_image, internal_port from software where software_id = ?", software_id);
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
		const container_create = await createContainer(software_info[0].docker_image, software_info[0].internal_port);
		console.log(container_create);
		if (container_create[0] == false) {
		    // failed to create container, return the error msg
		    res.json({msg : "failed to create container : " + container_create[1]}); 
		}
		else {
		    // create container successfully
		    // return the external port which the service is deployed on it, and update to the data in db

		    const external_port = container_create[1];
	    	    try {
	    		conn = await util.getDBConnection(); // get connection from db
	    		await conn.query("update software set external_port = ? where software_id = ?;", [external_port, software_id]);
	    	    }
	    	    catch(e) {
			console.error(e);
			res.json({suc : false});
	    	    }
	    	    finally {
			util.closeDBConnection(conn); // close db connection
	    	    }
		    
		    // send the email to inform the agreement of project to the person who applied this project
		    informApplicant(external_port, software_id);
		    
	    	    res.json({suc : "true", external_port});
		}
	    }
	    catch (e) {
		console.log(e);
		res.json({msg : "failed to create container : " + e});
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
