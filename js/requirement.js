
async function getRequirements() {
    const result = await axios.get("/api/requirement");
    return result.data;
}

function getUrlRoot() {
    // get the root of url
    return document.URL.split(":")[0] + ":" + document.URL.split(":")[1];
}

function getUrlRootWithPort() {
    // get the root of url with the port
    return document.URL.split("/")[0] + "//" + document.URL.split("/")[2];
}

// show all requirements
async function showRequirements() {
    const data = await getRequirements();
    console.log(data);
    const result = data.result;
    const suc = data.suc;
    if (suc) {
    	const tab = document.getElementById("tab_requirements");
    	// loop to put data into table
	 console.log(result);
    	for (let i = 0;i < result.length;i++) { 
			sanitizeObj(DOMPurify.sanitize, result[i]);
	    let user_info = getUrlRootWithPort() + `/user?user_id=${result[i].user_id}`;
	    tab.innerHTML += 
	    "<tr/><td/>"+ result[i].req_id +  
	    "<td>" + result[i].topic + "</td>" +
	    "<td>" + result[i].description + "</td>" +
	    `<td><a target="_blank" href = "${user_info}">` + result[i].name + "</a></td>" +
	    "<td>" + result[i].awarded_credit + "</td>" +
		"<td>" + lessTime(result[i].time) + "</td>" +
	    "</tr>";
	}
    }
    else {
	// failed to get the data of softwares
	alert("failed to get the data of softwares");
    }
}

// show self requirements
async function showSelfRequirements() {
    const data = await getRequirements();
    const result = data.result;
    const suc = data.suc;
	const user = await getCurrentUserInfo();
    if (suc) {
    	const tab = document.getElementById("tab_self_requirements");
    	// loop to put data into table
    	for (let i = 0;i < result.length;i++) { 
			sanitizeObj(DOMPurify.sanitize, result[i]);
			if (result[i].user_id != user.user_id) {
				console.log(result[i].user_id, user.user_id)
				continue;
			}
	    	let user_info = getUrlRootWithPort() + `/user?user_id=${result[i].user_id}`;
	    	tab.innerHTML += 
	    	"<tr/><td/>"+ result[i].req_id +  
	    	"<td>" + result[i].topic + "</td>" +
	    	"<td>" + result[i].description + "</td>" +
	    	`<td><a target="_blank" href = "${user_info}">` + result[i].name + "</a></td>" +
	    	"<td>" + result[i].awarded_credit + "</td>" +
			"<td>" + lessTime(result[i].time) + "</td>" +
			"<td>" + `<button onclick='deleteRequirement(${result[i].req_id})'>刪除</button>` + "</td>" +
	    	"</tr>";
		}
    }
    else {
	// failed to get the data of softwares
	alert("failed to get the data of softwares");
    }
}

async function deleteRequirement(req_id) {
	const api = "/api/requirement";
	const data = {req_id};
	const result = await axios.delete(api, {data : data});
    if (result.data.suc == true) {
		alert("刪除成功");
    }
    else {
		alert("刪除失敗" + result.data.msg);
    }
	window.location.reload();
}

async function postApplyInfo() {
    const topic = document.getElementById("topic").value;
    const description = document.getElementById("description").value;
    const awarded_credit = document.getElementById("awarded_credit").value;
    data = {topic, description, awarded_credit};
    let result = await axios.post('/api/requirement', data);
    result = result.data;
    console.log(result);
    if (result.suc == true) {
		alert("申請已成功送出");
    }
    else {
		alert("申請無法正確送出" + result.msg);
    }
	window.location.reload();
}
setUserInfo();
showRequirements();
showSelfRequirements();
setRefs();
