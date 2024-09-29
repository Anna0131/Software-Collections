function getUrlRootWithPort() {
    // get the root of url with the port
    return document.URL.split("/")[0] + "//" + document.URL.split("/")[2];
}

async function getNotPassedSoftwares() {
    const result = await axios.get("/api/software/not_passed");
    return result.data;
}

function checkSpecifySoftwareInfo(software_id) {
    // open the page of software info
    window.open(`${getUrlRootWithPort()}/software?software_id=${software_id}`, '_blank');
}

async function applicationApproval(software_id) {
	try {
    	const result = await axios.get(`${getUrlRootWithPort()}/api/software/agreement?software_id=${software_id}`);
    	const suc_msg = "成功建立 Docker Container！";
    	const suc_msg1 = "審核成功";
		console.log(result);
    	if (result.data.msg && result.data.msg.includes("It will take some time to pull image")) {
			alert("It will take some time to pull image, so you can go to https://sw-registry.im.ncnu.edu.tw/audit to check detail.");
    	}
    	else if (result.data.suc == false) {
			alert("建立 Docker Container 失敗！" + result.data.msg);
    	}	
    	else if (!result.data.msg && (result.data.includes(suc_msg) || result.data.includes(suc_msg1))) {
			if (result.data.includes(suc_msg))
	    		alert(suc_msg);
		else 
	    	alert(suc_msg1);
    	}
    	else {
			alert("建立 Docker Container 失敗！" + result.data.msg);
    	}
    	window.location.reload();
	}
	catch(e) {
		alert("建立 Docker Container 失敗", e.response.data.msg);
	}
}

async function setTabApplication() {
    const not_passed_application = await getNotPassedSoftwares();
    if (not_passed_application.suc) {
	 // set the data
	const tab = document.getElementById("tab_software_application");
        for (let i = 0;i < not_passed_application.softwares.length;i++) {
			sanitizeObj(DOMPurify.sanitize, not_passed_application.softwares[i]);
	    const user_info = getUrlRootWithPort() + `/user?user_id=${not_passed_application.softwares[i].user_id}`;
	    tab.innerHTML += 
	    "<tr/><td/>"+ not_passed_application.softwares[i].software_id +  
	    "<td>" + not_passed_application.softwares[i].topic + "</td>" +
	    "<td>" + `<a target="_blank" href = "${user_info}">${not_passed_application.softwares[i].name}</a>` + "</td>" +
	    "<td>" + lessTime(not_passed_application.softwares[i].create_time) + "</td>" +
	    "<td>" + `<button onclick="checkSpecifySoftwareInfo(${not_passed_application.softwares[i].software_id})">詳細資訊</button` + "</td>" +
	    "<td>" + `<button onclick="applicationApproval(${not_passed_application.softwares[i].software_id})">同意申請</button` + "</td>" +
	    "<td>" + `<button onclick="applicationReject(${not_passed_application.softwares[i].software_id})">拒絕申請</button` + "</td>" +
	    "</tr>";
         }
    }
}

async function applicationReject(software_id) {
	window.location.href = `/api/software/disagreement?software_id=${software_id}`;
}


setUserInfo();
setRefs();
getNotPassedSoftwares();
setTabApplication();
