async function getUserInfo() { // get the user info from token of cookies
    let result = await axios.get('/api/user');
    return result.data;
}

async function setUserInfo() {
    const result = await getUserInfo();
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
