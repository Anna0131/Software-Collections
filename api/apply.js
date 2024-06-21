const router = require('express').Router();
const bodyParser = require("body-parser");
const util = require("./../utilities/utilities.js");
const sendEmail = require("./../utilities/sendEmail.js");

function ckFormat(topic, tags, description, docker_image, domain, cpu, ram, disk) {
    if (ram != undefined || cpu != undefined || disk != undefined) {
	// check docker spec
	if (util.isEmptyStr(docker_image) || util.isEmptyStr(ram) || util.isEmptyStr(cpu) || util.isEmptyStr(disk)) {
	    // check whether necessary column is empty
	    return false;
	}
    }
    return true;
}

function mkContent(name, topic, tags, description, docker_image, domain, create_time, software_id, internal_port, ram, cpu, disk) {
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
	content += new_line;
    }
    // apply time
    content += "申請時間：" + create_time + new_line;
    // button of agreement
    content += `<button><a style='text-decoration: none;color: black;' href='${util.system_url}/api/software/agreement?software_id=${software_id}'>同意申請</a></button>`;
    // end of content
    content += "</html>";
    return content;
}

router.post('/info', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    // request data
	    const topic = req.body.topic;
	    const tags = req.body.tags.split("、");
	    const description = req.body.description;
	    const name = req.body.name; // user name
	    // docker spec
	    const docker_image = req.body.docker_image;
	    const domain = req.body.domain;
	    const internal_port = req.body.internal_port;
	    const ram = req.body.ram;
	    const cpu = req.body.cpu;
	    const disk = req.body.disk;

	    const user_id = await util.getTokenUid(req.cookies.token);
	    const datetime = new Date();

	    // check the data comply the format
	    if (!ckFormat(topic, tags, description, docker_image, domain, internal_port, ram, cpu, disk)) {
		return res.json({msg : "wrong format"});
	    }

	    // insert data into db
	    let conn;
	    let software_id;
	    try {
	    	conn = await util.getDBConnection(); // get connection from db
		// Start Transaction
		await conn.beginTransaction();
		// software
	    	const software_result = await conn.batch("insert into software(owner_user_id, topic, description, docker_image, domain, create_time, internal_port, memory, cpu, storage) values(?,?,?,?,?,?,?,?,?,?);", [user_id, topic, description, docker_image, domain, datetime, internal_port, ram, cpu, disk]);
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
		res.json({suc : false});
	    }
	    finally {
		util.closeDBConnection(conn); // close db connection
	    }

	    // send email
	    try {
        	receivers = ["s109213059@mail1.ncnu.edu.tw", "tommy50508@gmail.com"];
        	content = mkContent(name, topic, tags, description, docker_image, domain, datetime, software_id, internal_port, ram, cpu, disk);
        	sendEmail.send(receivers, topic, content);
	    }
	    catch(e) {
		console.log(e);
		res.json({msg : "send email failed"});
	    }
	    res.json({suc : true});
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
