async function submit() {
    const account = document.getElementById("account").value;
    const password = document.getElementById("password").value;
    data = {account : account, password : password};
    let suc_login = await axios.post('/api/login', data);
    suc_login = suc_login.data;
    if (suc_login.suc) {
        location.href = '/main';
    }
    else {
	alert(suc_login.authen_result);
    }
}
