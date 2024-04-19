/*
function ckLogin() {
    // if page return msg of login failed, then redirect to login page
    try {
	const json_obj = JSON.parse(document.getElementsByTagName("pre")[0].innerHTML);
	console.log(json_obj);
	if (json_obj.msg != undefined && json_obj.msg == "login failed") {
	    alert("登入失敗！");
	    window.location.href = "/login";
	}
    }
    catch(e) {
        console.log(e);
    }
}
*/
    

async function getCurrentUserInfo() { // get the current user info from token of cookies
    let result = await axios.get('/api/user');
    return result.data;
}

async function setUserInfo() {
    const result = await getCurrentUserInfo();
    if (result.suc != true) {
	console.log("error get the user info", result);
    }
    // put user info into span section
    let user_info = document.getElementById("user_info");
    if (result.s_num != null) {
	user_info.innerHTML = result.s_num + " " + result.name;
    }
    else {
	user_info.innerHTML = result.name;
    }
}
