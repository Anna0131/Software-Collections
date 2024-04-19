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

async function showSpecifyUserInfo() {
    // show the all of softwares that are passed the verification by supervisors on the table
    const data = await getUserInfo();
    const suc = data.suc;
    if (suc) {
    	const tab = document.getElementById("tab_user_info");
    	// loop to put data into table
	tab.innerHTML += 
	    "<tr/><td/>"+ data.user_id +  
	    "<td>" + data.s_num + "</td>" +
	    "<td>" + data.name + "</td>" +
	    "<td>" + data.email + "</td>" +
	    "<td>" + data.total_credit + "</td>" +
	    "</tr>";
	// if users query the data of themselves, then display the table which users can setting the info
	console.log(data);
	if (data.is_self) {
	    showSettingTab();
	}
    }
    else {
	// failed to get the data of softwares
	alert("failed to get the data of user");
    }
}


setUserInfo();
showSpecifyUserInfo();
