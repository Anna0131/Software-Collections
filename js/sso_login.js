async function submitLogin() {
	// get data from input element
    const account = document.getElementById("account").value;
    const password = document.getElementById("password").value;
    const captcha = document.getElementById("captcha").value;
	const csrf = document.getElementById("csrf").innerHTML;
	const xsrf = document.getElementById("xsrf").innerHTML;
	const session = document.getElementById("session").innerHTML;
	try {
		const data = {account, password, captcha, csrf, xsrf, session};
		const res = await axios.post("/api/login/sso", data);
        if (res.data.suc) {
            location.href = '/main';
        }
        else {
	    	alert(res.data.authen_result);
			location.reload();
        }
	}
	catch(e) {
		alert("登入失敗" + e);
		location.reload();
	}
}
