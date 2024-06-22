async function submit() {
    // post the new account info
    const type = document.getElementById("type").value;
    const total_credit = document.getElementById("total_credit").value;
    const account = document.getElementById("account").value;
    const password = document.getElementById("password").value;
    const data = {type, total_credit, name, account, password};
    let suc_account = await axios.post('/api/settings', data);
    suc_account = suc_account.data;
    if (suc_account.suc) {
	alert("新增成功");
    }
    else {
	alert(`新增失敗：${suc_account.msg}`);
    }
    window.location.reload();
}

async function updateDockerSpec() {
    // update the settings of docker container spec
    const ram = document.getElementById("ram").value;
    const cpu = document.getElementById("cpu").value;
    const disk = document.getElementById("disk").value;
    const port = document.getElementById("port").value;
    const data = {ram, cpu, disk, port};
    // post data
    const result = await axios.post("/api/settings/dockerSpec", data);
    if (result.data.suc) {
	alert("更新成功！");
    }
    else {
	alert("更新失敗！");
    }
    window.location.reload();
}

async function showCurDockerSpec() {
    // show current docker spec
    const result = await axios.get("/api/settings/dockerSpec");
    const data = result.data;
    if (data.suc) {
        // put docker spec into relative input column
	for (let i = 0;i < data.result.length;i++) {
	    const input = document.getElementById(data.result[i].spec_type);
	    if (input.value == "") {
		// first value
	        input.value = data.result[i].spec_info;
	    }
	    else {
	        input.value += "," + data.result[i].spec_info;
	    }
	}
    }
    else {
	alert("Error get the data of docker spec");
    }
}

setUserInfo();
setRefs();
showCurDockerSpec();
