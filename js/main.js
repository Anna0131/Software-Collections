async function getSoftwareCollections() {
    const result = await axios.get("/api/software");
    return result.data;
}

function getUrlRoot() {
    // get the root of url
    return document.URL.split(":")[0] + ":" + document.URL.split(":")[1];
}

function getUrlRootWithPort() {
    // get the root of url with the port
    return document.URL.split("/")[0] + "//" + document.URL.split("/")[2];
}

async function showSoftwareCollections() {
    // show the all of softwares that are passed the verification by supervisors on the table
    const data = await getSoftwareCollections();
    const suc = data.suc;
    const softwares = data.softwares;
    console.log(data);
    if (suc) {
    	const tab = document.getElementById("tab_software_collections");
    	// loop to put data into table
    	for (let i = 0;i < softwares.length;i++) { 
	    let url = getUrlRoot() + ":" + softwares[i].external_port; // make the url of project with external port and root of current url
	    let user_info = getUrlRootWithPort() + `/user?user_id=${softwares[i].user_id}`;
	    tab.innerHTML += 
	    "<tr/><td/>"+ softwares[i].software_id +  
	    "<td>" + softwares[i].topic + "</td>" +
	    "<td>" + softwares[i].description + "</td>" +
	    `<td><a target="_blank" href = "${user_info}">` + softwares[i].name + "</a></td>" +
	    `<td><a target="_blank" href = "${url}">` + url + "</a></td>" +
	    "<td>" + softwares[i].domain + ".im.ncnu.edu.tw" + "</td>" +
	    "<td>" + softwares[i].create_time + "</td>" +
	    "</tr>";
	}
    }
    else {
	// failed to get the data of softwares
	alert("failed to get the data of softwares");
    }
}


setUserInfo();
showSoftwareCollections();
