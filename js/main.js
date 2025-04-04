async function getSoftwareCollections() {
    const result = await axios.get("/api/software");
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

function showSoftwareInfo(software_id) {
    window.location.href = `/software?software_id=${software_id}`;
}

async function showSoftwareCollections() {
    // show the all of softwares that are passed the verification by supervisors on the table
    const data = await getSoftwareCollections();
    const suc = data.suc;
    const softwares = data.softwares;
    console.log(data);
    if (suc) {
    	const tab = document.getElementById("tab_software_collections");
    	// loop to put data into table
    	for (let i = 0;i < softwares.length;i++) { 
			sanitizeObj(DOMPurify.sanitize, softwares[i]);
	    let url = getUrlRoot() + ":" + softwares[i].external_port; // make the url of project with external port and root of current url
	    let user_info = getUrlRootWithPort() + `/user?user_id=${softwares[i].user_id}`;
	    tab.innerHTML += 
	    "<tr/><td/>"+ softwares[i].software_id +  
	    "<td>" + softwares[i].topic + "</td>" +
	    `<td><a target="_blank" href = "${user_info}">` + softwares[i].name + "</a></td>" +
	    "<td>" + softwares[i].view_nums + "</td>" +
	    //`<td><a target="_blank" href = "${url}">` + url + "</a></td>" +
	    //"<td>" + softwares[i].domain + ".im.ncnu.edu.tw" + "</td>" +
	    "<td>" + `<button onclick="showSoftwareInfo(${softwares[i].software_id})">詳細資訊</button>` + "</td>" +
	    "</tr>";
	}
    }
    else {
	// failed to get the data of softwares
	alert("failed to get the data of softwares");
    }
}

async function deleteSoftware(software_id, external_port) {
    const confirm_content = `是否確定刪除軟體編號：${software_id} 的軟體？\n注意，會連 container 和 domain 一併刪除。`;
    const result = confirm(confirm_content);
    if (result) {
		const data = {software_id, external_port};
		try {
        	const result = await axios.delete("/api/software", { data: data });
			if (result.data.suc) {
	    		alert("刪除成功");
			}
			else {
	    		alert("刪除失敗，" + result.data.msg);
			}
			// reload the page to refresh the new software collections
			window.location.reload();
    	}
		catch(e) {
			alert("刪除失敗", e.response.data.msg);
		}
	}
}

async function getMySoftwareCollections() {
    const result = await axios.get("/api/software/self");
    return result.data;
}

async function updateSoftwarePublic(software_id) {
    const set_public = document.getElementById(`select_set_public_${software_id}`).value;
    if (confirm(`確定將軟體編號 ${software_id} 設為 ${set_public == true ? '公開' : '不公開'}`)) {
		const data = {software_id, set_public}
		try {
			const res = await axios.put("/api/software/public", { data });
			if (res.data.suc) {
            	alert("更新成功！");
			}
			else {
            	alert("更新失敗！");
        	}
			location.reload();
		}
		catch(e) {
			alert("更新失敗", e.response.data.msg);
		}
    }
}

async function showMySoftwareCollections() {
    // show the all of this user's softwares that are passed the verification by supervisors on the table
    const data = await getMySoftwareCollections();
    const suc = data.suc;
    const softwares = data.softwares;
    if (suc) {
    	const tab = document.getElementById("tab_my_software_collections");
    	// loop to put data into table
    	for (let i = 0;i < softwares.length;i++) { 
	    sanitizeObj(DOMPurify.sanitize, softwares[i]);
	    let url = getUrlRoot() + ":" + softwares[i].external_port; // make the url of project with external port and root of current url
	    tab.innerHTML += 
	    "<tr/><td/>"+ softwares[i].software_id +  
	    "<td>" + softwares[i].topic + "</td>" +
	    "<td>" + `${softwares[i].success_upload ? "是" : "否"}` + "</td>" +
	    "<td>" + softwares[i].view_nums + "</td>" +
	    //`<td><a target="_blank" href = "${url}">` + url + "</a></td>" +
	    //"<td>" + softwares[i].domain + ".im.ncnu.edu.tw" + "</td>" +
	    "<td>" + `<button onclick="showSoftwareInfo(${softwares[i].software_id})">詳細資訊</button>` + "</td>" +
	    "<td>" + `<select id='select_set_public_${softwares[i].software_id}' onchange="updateSoftwarePublic(${softwares[i].software_id})">` + 
	    `${softwares[i].set_public ? "<option value='1'>公開</option><option value='0'>不公開</option></select>" : "<option value='0'>不公開</option><option value='1'>公開</option></select>"}` + "</td>" +
	    "<td>" + `<button onclick="deleteSoftware(${softwares[i].software_id}, ${softwares[i].external_port})">刪除</button>` + "</td>" +
	    "</tr>";
	}
    }
    else {
	// failed to get the data of softwares
	alert("failed to get the data of softwares");
    }
}

setUserInfo();
showSoftwareCollections();
showMySoftwareCollections();
setRefs();
