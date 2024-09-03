// get software id from query string
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const software_id = urlParams.get("software_id");

async function getSoftwareInfo() {
    // get specify software info with the software id from query string
    if (software_id == undefined) {
	alert("software id is undefined");
	window.location.href = "/main";
	return false;
    }
    else {
        const result = await axios.get(`/api/software/specify/?software_id=${software_id}`);
        return result.data;
    }
}

function getHost() {
    // get the host from url
    return document.URL.split(":")[1].split("//")[1];
}

function getUrlRootWithPort() {
    // get the root of url with the port
    return document.URL.split("/")[0] + "//" + document.URL.split("/")[2];
}

async function getContainerLogs(software_id) {
    //get the logs of this container
    const result = await axios.get(`/api/software/info/logs?software_id=${software_id}`);
    return result.data;
}

async function getContainerResourceUsage(software_id) {
    //get the info of the resource usage by this container
    const result = await axios.get(`/api/software/info/resourceUsage?software_id=${software_id}`);
    return result.data;
}

async function getContainerName(software_id) {
    //get the info of the resource usage by this container
    const result = await axios.get(`/api/software/info/name?software_id=${software_id}`);
    return result.data;
}

async function setContainerName(software_id) {
    const container_name = await getContainerName(software_id);
    if (container_name.suc) {
    	document.getElementById("container_name").innerHTML = container_name.result;
    }
    else {
		console.log(container_name.msg);
    }
}

async function setContainerLogs(external_port, software_id) {
    const container_logs = await getContainerLogs(software_id);
    if (container_logs.suc) {
		document.getElementById("container_info").style.display = "block";
    	document.getElementById("container_logs").innerHTML = container_logs.result.toString().replaceAll("\n", "<br/>");
    }
    else {
	console.log(container_logs.msg);
    }
}

async function setContainerResourceUsage(external_port, software_id) {
    const container_resource_usage = await getContainerResourceUsage(software_id);
    if (container_resource_usage.suc) {
	document.getElementById("container_info").style.display = "block";
        document.getElementById("container_resource_usage").innerHTML += 
    	`
    	<tr>
    	<td>${container_resource_usage.result.cpu_usage_percent}</td>
    	<td>${container_resource_usage.result.ram_usage}</td>
    	<td>${container_resource_usage.result.ram_limit}</td>
    	<td>${container_resource_usage.result.ram_usage_percent}</td>
    	<td>${container_resource_usage.result.disk_usage}</td>
    	</tr>
        `;
    }
    else {
	console.log(container_resource_usage.msg);
    }
}

function setEditSoftware() {
    // make owner can edit the software
    document.getElementById("bt_update_description").style.display = "inline"; 
    document.getElementById("description").readOnly = false;
}

async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


async function showSoftwareCollections() {
    // show the all of softwares that are passed the verification by supervisors on the table
    const data = await getSoftwareInfo();
    const suc = data.suc;
    const software_info = data.software_info;
	sanitizeObj(DOMPurify.sanitize, software_info);
    if (suc) {
    	const tab = document.getElementById("software_info");
	let url = getHost() + ":" + software_info.external_port; // make the url of project with external port and root of current url
	let user_info = getUrlRootWithPort() + `/user?user_id=${software_info.user_id}`;
	tab.innerHTML += 
	"<tr/><td/>"+ software_info.software_id +  
	"<td>" + software_info.topic + "</td>" +
	`<td><a target="_blank" href = "${user_info}">` + software_info.name + "</a></td>" +  
	"<td>" + software_info.ip + "</td>" +
	"<td>" + software_info.external_port + "</td>" +
	"<td>" + software_info.domain + ".im.ncnu.edu.tw" + "</td>" +
	"<td>" + lessTime(software_info.create_time) + "</td>" +
	"<td>" + software_info.view_nums + "</td>" +
	"</tr>";
	const tab_description = document.getElementById("tab_description");
        tab_description.innerHTML += 
	"<tr><textarea id='description' rows='10' cols='80' readonly>" + software_info.description + "</textarea></td></tr>";
	
	// set the container info if the user is owner
	await sleep(100); // prevent from getting default user info as too early to fetch innerHTML
	const s_num = document.getElementById("user_info").innerHTML.split(" ")[0];
	if (s_num == software_info.s_num) {
	    setEditSoftware();
	    setContainerLogs(software_info.external_port, software_info.software_id);
		setContainerName(software_id);
	    setContainerResourceUsage(software_info.external_port, software_info.software_id);
	}
    }
    else {
	// failed to get the data of softwares
	alert("failed to get the info of software");
    }
}

async function getBulletin() {
    // get specify software info with the software id from query string
    if (software_id == undefined) {
	alert("software id is undefined");
	window.location.href = "/main";
	return false;
    }
    else {
        const result = await axios.get(`/api/software/bulletin/?software_id=${software_id}`);
        return result.data;
    }
}

async function showBulletin() {
    // show the all of softwares that are passed the verification by supervisors on the table
    const data = await getBulletin();
    const suc = data.suc;
    const bulletin = data.bulletin;
    if (suc) {
    	const tab = document.getElementById("bulletin");
	for (let i = 0;i < bulletin.length;i++) {
    	    // loop to put data into table
	    sanitizeObj(DOMPurify.sanitize, bulletin[i]);
	    let user_info = getUrlRootWithPort() + `/user?user_id=${bulletin[i].comment_user_id}`;
	    tab.innerHTML += 
	    "<tr/><td/>"+ bulletin[i].software_id +  
	    "<td>" + bulletin[i].content + "</td>" +
	    `<td><a target="_blank" href = "${user_info}">` + bulletin[i].name + "</a></td>" +
	    "<td>" + lessTime(bulletin[i].create_time) + "</td>" +
	    "</tr>";
	}
    }
    else {
	// failed to get the data of softwares
	alert("failed to get the info of software");
    }
}

async function postComment() {
    const content = document.getElementById("comment").value;
    data = {content, software_id};
    let result = await axios.post('/api/software/bulletin', data);
    result = result.data;
    if (result.suc == true) {
	alert("新增留言成功");
    }
    else {
	alert("新增留言失敗，" + result.msg);
    }
}

async function updateDescription() {
    const content = document.getElementById("description").value;
    const data = {software_id, content};
    const result = await axios.put("/api/software/description", data);
    if (result.data.suc) {
        alert("更新成功！");
    }
    else {
	alert("更新失敗！");
    }
    window.location.reload();
}

setUserInfo();
showSoftwareCollections();
showBulletin();
setRefs();
