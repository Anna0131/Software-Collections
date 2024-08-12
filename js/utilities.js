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

function lessTime(times) { // 把時間弄得好看一點
    if (times == null) // 如果還沒有時間
        return null;
    let new_time = '';
    let dash_is_breaked = false; // 只要把第一個 dash 換行，因為是年分
    for (let i = 0;i < times.length-5;i++) { // 不要後面五個字元
	if (times[i] == '-' && !dash_is_breaked) {
            new_time += '-';
            dash_is_breaked = true;
            continue;
        }
        if (times[i] == 'T') { // 把 T 換掉
            new_time += ' ';
            continue;
        }
        new_time += times[i];
    }
    return new_time;
}

async function getAllRefs() {
    // get all references
    let result = await axios.get('/api/refs');
    return result.data.refs_name;
}

async function setRefs() {
    let ref_list = document.getElementById("ref_list");

    // get all references
    const all_refs = await getAllRefs();

    for (let i = 0;i < all_refs.length;i++) {
        let li_element = document.createElement("li");
	let a_element = document.createElement("a");
	a_element.href = all_refs[i].val;
	a_element.innerHTML = all_refs[i].name;
	li_element.appendChild(a_element);
	ref_list.appendChild(li_element);
    }
}

function logout() {
    // clean the cookies
    const allCookies = document.cookie.split(';'); 
    // The "expire" attribute of every cookie is  Set to "Thu, 01 Jan 1970 00:00:00 GMT" 
    for (var i = 0; i < allCookies.length; i++) 
        document.cookie = allCookies[i] + "=;expires=" + new Date(0).toUTCString(); 
    window.location.href="/main";
}


function sanitizeObj(sanitize, obj) {
	const keys = Object.keys(obj);
	for (let i = 0;i < keys.length;i++) {
		if (obj[keys[i]] == '0') {
			continue;	
		}
		obj[keys[i]] = sanitize(obj[keys[i]]);
	}
	return obj;
}
