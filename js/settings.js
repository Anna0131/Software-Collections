async function submit() {
    const type = document.getElementById("type").value;
    const total_credit = document.getElementById("total_credit").value;
    const account = document.getElementById("account").value;
    const password = document.getElementById("password").value;
    data = {type, total_credit, name, account, password};
    let suc_account = await axios.post('/settings', data);
    suc_account = suc_account.data;
    if (suc_account.suc) {
	alert("新增成功");
        location.href = '/main';
    }
    console.log(suc_account);
}

setUserInfo();
setRefs();
