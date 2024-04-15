async function submit() {
    const type = document.getElementById("type").value;
    console.log(type);
    data = {type : type};
    let suc_login = await axios.post('/apply', data);
    suc_login = suc_login.data;
    console.log(suc_login.suc);
}

setUserInfo();
