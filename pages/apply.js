const router = require('express').Router();
const bodyParser = require("body-parser");
const util = require("./../utilities/utilities.js");
const sendEmail = require("./../utilities/sendEmail.js");

function ckFormat(topic, tags, description, docker_image, domain) {
    return true;
}

function mkContent(name, topic, tags, description, docker_image, domain, create_time, software_id, internal_port) {
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
    // docker image
    content += "Docker Image：" + docker_image + new_line;
    // internal port of service in container
    content += "服務在容器內架設於哪個 port：" + internal_port + new_line;
    // domain
    content += "domain：" + domain + ".im.ncnu.edu.tw" + new_line;
    // apply time
    content += "申請時間：" + create_time + new_line;
    // button of agreement
    content += `<button><a style='text-decoration: none;color: black;' href='${util.system_url}/api/software/agreement?software_id=${software_id}'>同意申請</a></button>`;
    // end of content
    content += "</html>";
    return content;
}

// processing request
router.get('/', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
    	    res.sendFile(util.getParentPath(__dirname) + '/templates/apply.html');  //回應靜態文件
        }
        else {
	    res.redirect("/login");
        }
    }
    catch(e) {
        console.log(e);
	res.redirect("/login");
    }
    return;
});

router.post('/info', async function(req, res) {
    try {
	const result = await util.authenToken(req.cookies.token);
	if (result) {
	    const topic = req.body.topic;
	    const tags = req.body.tags.split("、");
	    const description = req.body.description;
	    const docker_image = req.body.docker_image;
	    const domain = req.body.domain;
	    const name = req.body.name; // user name
	    const internal_port = req.body.internal_port;
	    const user_id = await util.getTokenUid(req.cookies.token);
	    const datetime = new Date();
	    console.log(domain);
	    // check the data comply the format
	    if (!ckFormat(topic, tags, description, docker_image, domain)) {
		res.json({msg : "wrong format"});
	    }
	    // insert data into db
	    let conn;
	    let software_id;
	    try {
	    	conn = await util.getDBConnection(); // get connection from db
		// Start Transaction
		await conn.beginTransaction();
		// software
	    	const software_result = await conn.batch("insert into software(owner_user_id, topic, description, docker_image, domain, create_time, internal_port) values(?,?,?,?,?,?,?);", [user_id, topic, description, docker_image, domain, datetime, internal_port]);
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
        	content = mkContent(name, topic, tags, description, docker_image, domain, datetime, software_id, internal_port);
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
        res.json({msg : "login failed"});
    }
    return;
});

module.exports = router;
