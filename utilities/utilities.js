const c = require('config');
const jwt = require('jsonwebtoken');
const path = require('path');
const jwt_key = "goodjwtkey";
const system_url = "https://sw-registry.im.ncnu.edu.tw";
const db = require("mariadb");
// create pool
const pool = db.createPool({
    connectionLimit : 500,
    host : 'localhost',
    user : 'wang',
    password : 'wang313',
    database : 'software_collections'
});

module.exports = {
    // shared variable
    system_url,
    jwt_key,

    // shared function

    loginAuthentication: function(account, password) {
        return new Promise((resolve, reject) => { // 包裝成 Promise
            const spawn = require("child_process").spawn;
            const pythonScript = path.join(__dirname, 'catch.py'); // path/to/catch.py
            const pythonProcess = spawn('python3', [pythonScript, account, password], {shell: true});

            //console.log(`account: ${account}`);
            //console.log(`password: ${password}`);

            pythonProcess.stdout.on('data', (data) => {
		data = data.toString().slice(0, -1); // remove the last char 
                if (data === 'login falied') {
                    resolve(false); // 登入失敗，解析 Promise 為 True
                } else {
                    resolve(data.toString().trim()); // 登入成功
                }
            });

            pythonProcess.stderr.on('data', (data) => {
                console.error(`stderr: ${data.toString()}`);
            });

            pythonProcess.on('exit', (code) => {
                //console.log(`child process exited with code ${code}`);
                if (code !== 0) {
                    reject(new Error(`child process exited with code ${code}`)); // 非 0 退出代碼表示錯誤
                }
            });

            pythonProcess.on('error', (err) => {
                console.error(err);
                reject(err); // 子進程啟動失敗
            });
        });
    },
    
    // 保持 authenToken 函數不變
    authenToken: function(token) {
        return new Promise((resolve, reject) => {
            try {
                const data = jwt.verify(token, jwt_key).data;
                if (data.uid) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch (error) {
                console.error(error);
                resolve(false);
                //reject(false);
            }
        });
    },

    // get uid from token
    getTokenUid : function(token) {
        return new Promise((resolve, reject) => {
            try {
                const data = jwt.verify(token, jwt_key).data;
		resolve(data.uid);
            } catch (error) {
                console.error(error);
                resolve(false);
                //reject(false);
            }
        });
    },

     // get parent absolute path
    getParentPath : function(dir) {
        try {
            n_dir = "";
            dir = dir.split("");
            // determine the type of slash, which will be different between windows and linux
            if (dir.includes("/")) {
		// linux
                slash_type = "/";
            }
            else {
		// windoes
                slash_type = "\\";
            }
            // pop the last one directory
            while (dir.pop() != slash_type) {
                // pass
            }
            // restructure the full path
            for (let i = 0;i < dir.length;i++) {
                n_dir += dir[i];
            }
            return n_dir;
        }
        catch(e) {
            console.log(e);
        }
    },

    // return connection of mariadb
    getDBConnection : async function() {
	try {
	    const conn = await pool.getConnection();
	    return conn;
	}
	catch(e) {
	    console.error("error getting db connection : ", e);
	    return null;
	}
    },

    // close connection of mariadb
    closeDBConnection : function(conn) {
	try {
	    conn.release();
	}
	catch(e) {
	    console.error("error closing db connection : ", e);
	}
    },

    // get the root of url
    getUrlRoot : function(url) {
        return url.split(":")[0] + ":" + url.split(":")[1];
    },

    isEmptyStr : function(str) {
	return (str=="" || str == null || str == undefined);
    },

    is_numeric : function(str){
        return /^\d+$/.test(str);
    },

    getUserRole : async function(user_id) {
	// return the role id of user
	let conn;
	try {
	    conn = await this.getDBConnection(); // get connection from db
	    const role_id = await conn.query("select role_id from user where user_id = ?;", [user_id]); // return the necessary data which will be display on the page of main
	    return role_id[0]["role_id"];
 	}
	catch(e) {
	    console.error(e);
	    return false;
	}
	finally {
	    this.closeDBConnection(conn); // close db connection
	}
    },

    ckUserPrivileges: async function(user_id) {
    	// check whether the privilege of user is not enough to agree the upload of software
    	const role_id = await this.getUserRole(user_id);
    	if (role_id == 3) {
        	// super user's role id is 3
			return true;
    	}
    	else {
			return false;
    	}
	},
};
