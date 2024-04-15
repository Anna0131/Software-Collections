async function submit() {
    const type = document.getElementById("type").value;
    const total_credit = document.getElementById("total_credit").value;
    const name = document.getElementById("name").value;
    data = {type, total_credit, name};
    let suc_account = await axios.post('/account', data);
    suc_account = suc_account.data;
    if (suc_account.suc) {
	alert("新增成功");
        location.href = '/main';
    }
    console.log(suc_account);
}
