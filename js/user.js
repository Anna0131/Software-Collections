function showSettingTab() {
    // if users query the data of themselves, then display the table which users can setting the info
    document.getElementById("section_update_info").style.display = "block";
}

async function getUserInfo() {
    // get uid from query string
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const user_id = urlParams.get("user_id");
    const result = await axios.get(`/api/user/specify?user_id=${user_id}`);
    return result.data;
}

function setHeadshot(user_id) {
    const url = `api/user/headshot?user_id=${user_id}`;
    document.getElementById("headshot").src = url;
}    


async function showSpecifyUserInfo() {
    // show the all of softwares that are passed the verification by supervisors on the table
    const data = await getUserInfo();
    const suc = data.suc;
    if (suc) {
	// set headshot of user
	setHeadshot(data.user_id);
    	const tab = document.getElementById("tab_user_info");
    	// loop to put data into table
	sanitizeObj(DOMPurify.sanitize, data);
	tab.innerHTML += 
	    "<tr/><td/>"+ data.user_id +  
	    "<td>" + data.s_num + "</td>" +
	    "<td>" + data.name + "</td>" +
	    "<td>" + `<a href="mailto:${data.email}">${data.email}</a>` + "</td>" +
	    "</tr>";
	// if users query the data of themselves, then display the table which users can setting the info
	if (data.is_self) {
	    showSettingTab();
	}
    }
    else {
	// failed to get the data of softwares
	alert("failed to get the data of user");
    }
}

// update the headshot
async function postHeadshot() {
    // post headshot
    const formData = new FormData();
    const imagefile = document.querySelector('#headshot_upload');
    formData.append("image", imagefile.files[0]);
	try {
    	const result = await axios.post('/api/user/headshot', formData, {
        	headers: {
            	'Content-Type': 'multipart/form-data'
        	}
    	});
    
    	if (result.data.suc == true) {
			// successfully update headshot
			alert("更新照片成功");
    	}
    	else {
			alert("更新照片失敗", result.data.msg);
    	}
    	// reload the page to refresh the new data
    	window.location.reload();
	}
	catch(e) {
		alert("更新照片失敗", e.response.data.msg);
	}
}

// update the email
async function postEmail() {
    const email = document.getElementById("email_upload").value;
    data = {email};
	try {
    	let result = await axios.post('/api/user/email', data);
    	result = result.data;
    	if (result.suc == true) {
			alert("更新 email 成功");
    	}
    	else {
			alert("更新 email 失敗" + result.msg);
    	}
    	// reload the page to refresh the new data
    	window.location.reload();
	}	
	catch(e) {
		alert("更新 email 失敗" + e.response.data.msg);
	}	
}

showSpecifyUserInfo();
setUserInfo();
setRefs();
