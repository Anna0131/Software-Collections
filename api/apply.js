const router = require('express').Router();
const bodyParser = require("body-parser");
const util = require("./../utilities/utilities.js");
const sendEmail = require("./../utilities/sendEmail.js");

function ckFormat(topic, tags, description, docker_image, domain, internal_port, ram, cpu, disk, env, volumes, set_public) {
    if (ram != undefined || cpu != undefined || disk != undefined) {
	// check docker spec
	if (util.isEmptyStr(docker_image) || util.isEmptyStr(ram) || util.isEmptyStr(cpu) || util.isEmptyStr(disk)) {
	    // check whether required column is empty
	    return {result : false, msg : "required column is empty"};
	}
	// check the format of env and volumes if one of them are not empty
	// env
	if (!util.isEmptyStr(env)) {
	    env = env.split("\n");
	    for (let i = 0;i < env.length;i++) {
	        // check the num of = in each line
	        if (env[i].split("=").length != 2) {
	            return {result : false, msg : "wrong env format"};
	        }
	    }
	}
	// volumes
	if (!util.isEmptyStr(volumes)) {
	    volumes = volumes.split("\n");
	    for (let i = 0;i < volumes.length;i++) {
	        if (volumes[i][0] != "/") {
	            return {result : false, msg : "wrong volumes format"};
	        }
	    }
        }
    }
    return {result : true};
}

function mkContent(name, topic, tags, description, docker_image, domain, create_time, software_id, internal_port, ram, cpu, disk, env, volumes) {
    const new_line = "<br/>";
    let content = "<!DOCTYPE html>";
    // username
    content += "申請人：" + name + new_line;
    // topic
    content += "主題：" + topic + new_line;
    // tags
    content += "標籤："
    for (let i = 0;i < tags.length;i++) {
	content += tags[i] + '、';
    }
    content = content.slice(0, -1); // remove last char
    content += new_line;
    // description
    content += "敘述：" + description + new_line;
    // docker spec
    if (ram != undefined) {
	// replace new line in env and volumes
	env = env == null ? null : env.replaceAll("\n", new_line);
	volumes = volumes == null ? null : volumes.replaceAll("\n", new_line);
	
	// make email context
	content += new_line + "有申請放置 Container，規格如下：" + new_line;
    	// docker image
    	content += "Docker Image：" + docker_image + new_line;
    	content += "Docker Image URL：" + `https://hub.docker.com/r/${docker_image.split(":")[0]}` + new_line;
    	// internal port of service in container
    	content += "Mapping 到內部的 Port：" + internal_port + new_line;
    	// domain
    	content += "Domain：" + domain + ".im.ncnu.edu.tw" + new_line;
	// ram
	content += "RAM：" + ram + " GB" + new_line;
	// cpu
	content += "CPU：" + cpu + " 顆" + new_line;
	// disk
	content += "Disk：" + disk + " GB" + new_line;
	// env
	content += "ENV Variables：" + new_line + env + new_line;
	// volumes
	content += "Volumes：" + new_line + volumes + new_line;
	content += new_line;
    }
    // apply time
    content += "申請時間：" + create_time + new_line;
    // button of agreement
    content += `<button><a style='text-decoration: none;color: black;' href='${util.system_url}/api/software/agreement?software_id=${software_id}'>同意申請</a></button>`;
	// button of disagreement
    content += `&nbsp;<button><a style='text-decoration: none;color: black;' href='${util.system_url}/api/software/disagreement?software_id=${software_id}'>拒絕申請</a></button>`;
    // end of content
    content += "</html>";
    return content;
}

async function overApplicationLimit(user_id) {
    let conn;
    let application_nums;
    let max_application_nums;
    try {
    	conn = await util.getDBConnection(); // get connection from db
	const date = new Date();
	const result = await conn.query("select COUNT(*) from software where owner_user_id = ? and create_time >= ?;", [user_id, date]); // return the nums of application of this user in today
    	application_nums = result[0]["COUNT(*)"];
	max_application_nums = await conn.query("select value from general_settings where settings_name = 'max_application_nums';");
	max_application_nums = max_application_nums[0].value;

    }
    catch(e) {
	console.error(e);
    }
    finally {
	util.closeDBConnection(conn); // close db connection
    }

    if (application_nums >= max_application_nums) {
	return true;
    }
    else {
	return false;
    }
}

function onlyOneOrZero(val) {
    // return only one or zero to prevent invalid input store in db
    if (val == true) {
	return 1;
    }
    else {
	return 0;
    }
}

router.post('/info', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const user_id = await util.getTokenUid(req.cookies.token);

	    // check if over the limit of one user can apply in a single day
	    const check_over_application_limit = await overApplicationLimit(user_id);
	    if (check_over_application_limit) {
		return res.json({"suc" : false, "msg" : "your application numbers in today are exceeding the maximum of one user can apply in a single day"});
	    }

	    // request data
	    const topic = req.body.topic;
	    const tags = req.body.tags.split("、");
	    const description = req.body.description;
	    // docker spec
	    const docker_image = req.body.docker_image;
	    const domain = req.body.domain;
	    const internal_port = req.body.internal_port == '' ? null : req.body.internal_port;
	    const ram = req.body.ram;
	    const cpu = req.body.cpu;
	    const disk = req.body.disk;
	    const env = req.body.env == '' ? null : req.body.env;
	    const volumes = req.body.volumes == '' ? null : req.body.volumes;
	    const set_public = onlyOneOrZero(req.body.set_public);
	    const ssl = onlyOneOrZero(req.body.ssl);

	    const datetime = new Date();
	
	    // check the data comply the format
	    const check_format_result = ckFormat(topic, tags, description, docker_image, domain, internal_port, ram, cpu, disk, env, volumes, set_public);
	    if (check_format_result.result == false) {
		return res.json({msg : "wrong format : " + check_format_result.msg});
	    }

	    // insert data into db
	    let conn;
	    let software_id;
	    let name;
	    try {
	    	conn = await util.getDBConnection(); // get connection from db
		// get user name
		name = await conn.query("select name from user where user_id = ?", user_id);
		name = name[0]["name"];

		// Start Transaction
		await conn.beginTransaction();
		// software
	    	const software_result = await conn.batch("insert into software(owner_user_id, topic, description, docker_image, domain, create_time, internal_port, memory, cpu, storage, env, volumes, set_public, `ssl`) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?);", [user_id, topic, description, docker_image, domain, datetime, internal_port, ram, cpu, disk, env, volumes, set_public, ssl]);
		software_id = software_result.insertId;
		// tags
		for (let i = 0;i < tags.length;i++) {
		    await conn.batch("insert into tag(software_id, name) values(?,?)", [software_id, tags[i]]); 
		}
		await conn.commit(); // commit changes
	    }
	    catch(e) {
		console.error(e);
		await conn.rollback(); // rollback transaction
		return res.json({suc : false});
	    }
	    finally {
		util.closeDBConnection(conn); // close db connection
	    }

	    // send email
	    try {
        	receivers = ["s109213059@mail1.ncnu.edu.tw", "tommy50508@gmail.com"];
        	content = mkContent(name, topic, tags, description, docker_image, domain, datetime, software_id, internal_port, ram, cpu, disk, env, volumes);
        	sendEmail.send(receivers, topic, content);
	    	res.json({suc : true});
	    }
	    catch(e) {
		console.log(e);
		res.json({msg : "send email failed"});
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
