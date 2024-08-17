// post file
/*
async function postHeadshot() {
    // post headshot
    const formData = new FormData();
    const imagefile = document.querySelector('#headshot_upload');
    formData.append("image", imagefile.files[0]);
    const result = await axios.post('/api/user/headshot', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    
    console.log(result.data);
    if (result.data.suc == true) {
	// successfully update headshot
	alert("更新照片成功");
    }
    else {
	alert("更新照片失敗", result.data.msg);
    }
    // reload the page to refresh the new data
    window.location.reload();
}
*/

async function postApplyInfo() {
    const topic = document.getElementById("topic").value;
    const tags = document.getElementById("tags").value;
    const description = document.getElementById("description").value;
    const name = document.getElementById("user_info").innerHTML;
    // post docker spec info if the checkbox of applying the container is clicked
    if (document.getElementById("container_info").style.display == "none") {
		data = {topic, tags, description, name};
    }
    else {
        const docker_image = document.getElementById("docker_image").value;
        const internal_port = document.getElementById("internal_port").value;
		const ram = document.getElementById("ram_usage").value;
		const cpu = document.getElementById("cpu_usage").value;
		const disk = document.getElementById("disk_usage").value;
        const domain = document.getElementById("domain").value;
        const env = document.getElementById("env").value;
        const volumes = document.getElementById("volumes").value;
        const set_public = document.getElementById("set_public").value;
        const ssl = document.getElementById("ssl").value;
		data = {topic, tags, description, name, docker_image, internal_port, ram, cpu, disk, domain, env, volumes, ssl, set_public};
    }
    // post data
    let result = await axios.post('/api/apply/info', data);
    result = result.data;
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
