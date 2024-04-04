async function submit() {
    const account = document.getElementById("account").value;
    const password = document.getElementById("password").value;
    console.log(account, password);
    data = {account : account, password : password};
    let suc_login = await axios.post('/login', data);
    suc_login = suc_login.data;
    if (suc_login.suc) {
        location.href = '/main';
    }
    console.log(suc_login.suc);
}
