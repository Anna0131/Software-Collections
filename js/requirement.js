
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

function convertStatusToStr(status) {
    // convert int status to str
    if (status == 0) {
        return "未開發";
    }
    else if (status == 1) {
        return "開發中";
    }
    else {
        return "開發完成";
    }
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
	    "<td>" + lessTime(result[i].time) + "</td>" +
	    "<td>" + convertStatusToStr(result[i].status) + "</td>" +
	    "</tr>";
	}
    }
    else {
	// failed to get the data of softwares
	alert("failed to get the data of softwares");
    }
}

async function updateRequirementStatus(req_id, origin_status) {
    if (confirm("確定要更改狀態？")) {
	const new_status = document.getElementById(`sel_${req_id}`).value;
	const result = await axios.put('/api/requirement/status', {new_status, req_id}); 
    }
    else {
	document.getElementById(`sel_${req_id}`).value = origin_status;
    }
}

function makeSelectOptionWithStatus(req_id, status) {
    const all_status = [0, 1, 2]; // all types of status
    all_status.splice(status, 1);
    const rest_status = all_status;
    // show this requirement current status, then the others
    const element = 
	`<select id=sel_${req_id} onchange='updateRequirementStatus(${req_id}, ${status})'>
	<option value='${status}'>${convertStatusToStr(status)}</option>
	<option value='${rest_status[0]}'>${convertStatusToStr(rest_status[0])}</option>
	<option value='${rest_status[1]}'>${convertStatusToStr(rest_status[1])}</option>
	</select>`
    return element;
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
			"<td>" + lessTime(result[i].time) + "</td>" +
			"<td>" + `<button onclick='deleteRequirement(${result[i].req_id})'>刪除</button>` + "</td>" +
			"<td>" + makeSelectOptionWithStatus(result[i].req_id, result[i].status) + "</td>" +
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
