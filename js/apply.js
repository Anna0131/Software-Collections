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

// set container info based on the checkbox value
function setContainerInfo() {
    const container_info = document.getElementById("container_info");
    if (container_info.style.display == "block") {
        container_info.style.display = "none";
    }
    else {
        container_info.style.display = "block";
    }
}

async function setDockerSpec() {
    // show current docker spec
    const result = await axios.get("/api/settings/dockerSpec");
    const data = result.data;
    if (data.suc) {
	// set docker spec
	for (let i = 0;i < data.result.length;i++) {
	    if (data.result[i].spec_type == "port") {
		document.getElementById("mapping_port_nums").innerHTML = data.result[i].spec_info;
	    }
	    else {
		// except the port spec, other type info of specs need to create a option and put it into relative select element

		// create option element
		const option = document.createElement("option");
		option.value = data.result[i].spec_info;
		option.innerHTML = data.result[i].spec_info;
		// put option into relative select element
		const select = document.getElementById(data.result[i].spec_type + "_usage");
		select.appendChild(option);
	    }
	}
    }
    else {
	alert("Error get the docker spec");
    }
}

setUserInfo();
setRefs();
setDockerSpec();
