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

function getUrlRoot() {
    // get the root of url
    return document.URL.split(":")[0] + ":" + document.URL.split(":")[1];
}

function getUrlRootWithPort() {
    // get the root of url with the port
    return document.URL.split("/")[0] + "//" + document.URL.split("/")[2];
}

async function getContainerLogs(external_port) {
    const result = await axios.get(`/api/software/info/logs?external_port=${external_port}`);
    return result.data;
}

async function getContainerResourceUsage(external_port) {
    const result = await axios.get(`/api/software/info/resourceUsage?external_port=${external_port}`);
    return result.data;
}

async function setContainerLogs(external_port) {
    const container_logs = await getContainerLogs(external_port);
    document.getElementById("container_logs").innerHTML = container_logs.result.toString().replaceAll("\n", "<br/>");
}

async function setContainerResourceUsage(external_port) {
    const container_resource_usage = await getContainerResourceUsage(external_port);
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

async function showSoftwareCollections() {
    // show the all of softwares that are passed the verification by supervisors on the table
    const data = await getSoftwareInfo();
    const suc = data.suc;
    const software_info = data.software_info;
    if (suc) {
    	const tab = document.getElementById("software_info");
	let url = getUrlRoot() + ":" + software_info.external_port; // make the url of project with external port and root of current url
	let user_info = getUrlRootWithPort() + `/user?user_id=${software_info.user_id}`;
	tab.innerHTML += 
	"<tr/><td/>"+ software_info.software_id +  
	"<td>" + software_info.topic + "</td>" +
	"<td>" + software_info.description + "</td>" +
	`<td><a target="_blank" href = "${user_info}">` + software_info.name + "</a></td>" +
	`<td><a target="_blank" href = "${url}">` + url + "</a></td>" +
	"<td>" + software_info.domain + ".im.ncnu.edu.tw" + "</td>" +
	"<td>" + lessTime(software_info.create_time) + "</td>" +
	"<td>" + software_info.view_nums + "</td>" +
	"</tr>";
	
	// set the container info
	setContainerLogs(software_info.external_port);
	setContainerResourceUsage(software_info.external_port);
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
	    let url = getUrlRoot() + ":" + bulletin[i].external_port; // make the url of project with external port and root of current url
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

setUserInfo();
showSoftwareCollections();
showBulletin();
setRefs();
