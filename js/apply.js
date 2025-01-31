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
    const set_public = document.getElementById("set_public").value;
    // post docker spec info if the checkbox of applying the container is clicked
    if (document.getElementById("container_info").style.display == "none") {
		data = {topic, tags, description, name, set_public};
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
        const ssl = document.getElementById("ssl").value;
		data = {topic, tags, description, name, docker_image, internal_port, ram, cpu, disk, domain, env, volumes, ssl, set_public};
    }
	try {
    	// post data
    	let result = await axios.post('/api/apply/info', data);
    	result = result.data;
    	if (result.suc == true) {
			alert("申請已成功送出，若成功會再寄信告知");
			await uploadFile(result.software_id);
			window.location.href = "/main";
    	}
    	else {
			alert("申請無法正確送出" + result.msg);
    	}
	}
	catch(e) {
		alert("申請無法正確送出" + e.response.data.msg);
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

// upload file
async function uploadFile(software_id) {
    const formData = new FormData();
    const fileInput = document.querySelector('#file_upload'); // 取得 input[type="file"]
    
    if (!fileInput.files.length) {
        console.log("沒有要上傳的檔案");
        return;
    }

    formData.append("file", fileInput.files[0]);
	formData.append("software_id", software_id);

    try {
        const result = await axios.post('/api/software/file', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (result.data.suc === true) {
            console.log("檔案上傳成功");
        } else {
            alert("檔案上傳失敗: " + result.data.msg);
        }

        // 重新載入頁面以顯示最新狀態
        window.location.reload();
    } catch (e) {
        alert("檔案上傳失敗: " + (e.response?.data?.msg || e.message));
    }
}

setUserInfo();
setRefs();
setDockerSpec();
