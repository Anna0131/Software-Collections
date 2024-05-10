async function postApplyInfo() {
    const topic = document.getElementById("topic").value;
    const tags = document.getElementById("tags").value;
    const description = document.getElementById("description").value;
    // const portfolio = document.getElementById("portfolio").value;
    const docker_image = document.getElementById("docker_image").value;
    const domain = document.getElementById("domain").value;
    const internal_port = document.getElementById("internal_port").value;
    const name = document.getElementById("user_info").innerHTML;
    data = {topic, tags, description, docker_image, domain, name, internal_port};
    let result = await axios.post('/apply/info', data);
    result = result.data;
    console.log(result);
    if (result.suc == true) {
	alert("申請已成功送出，若成功會再寄信告知");
	window.location.href = "/main";
    }
    else {
	alert("申請無法正確送出" + result.msg);
    }
}

async function postApplyFile() {
}

async function submit() {
    postApplyInfo(); // post the info
    postApplyFile(); // post the file
}

setUserInfo();
