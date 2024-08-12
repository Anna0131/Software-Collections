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
    const result = await axios.get(`${getUrlRootWithPort()}/api/software/agreement?software_id=${software_id}`);
    const suc_msg = "成功建立 Docker Container！";
    if (result.data.includes(suc_msg)) {
	alert(suc_msg);
    }
    else {
	alert("建立 Docker Container 失敗！" + result.data);
    }
    window.location.reload();
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
	    "</tr>";
         }
    }
}


setUserInfo();
setRefs();
getNotPassedSoftwares();
setTabApplication();
