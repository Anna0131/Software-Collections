function showOrHideLoading() {
	const spinner = document.getElementsByClassName("spinner")[0];
	if (spinner.style.display === 'none' || spinner.style.display === '') {
    	spinner.style.display = 'block';
    }
	else {
        spinner.style.display = 'none';
    }
}

async function submit() {
	showOrHideLoading();
    const account = document.getElementById("account").value;
    const password = document.getElementById("password").value;
    data = {account : account, password : password};
    try {
        let suc_login = await axios.post('/api/login', data);
        showOrHideLoading();
        suc_login = suc_login.data;
        console.log(suc_login);
        if (suc_login.suc) {
            location.href = '/main';
        }
        else {
	    	alert(suc_login.authen_result);
        }
		showOrHideLoading();
    }
    catch(e) {
       	alert("login failed " + e.response.data.authen_result);
		showOrHideLoading();
    }
}
