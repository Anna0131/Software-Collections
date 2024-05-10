const c = require('config');
var jwt = require('jsonwebtoken');
const path = require('path');

module.exports = {
    // shared variable
    system_url : "http://163.22.17.184:5000",

    // shared function
    loginAuthentication: function(account, password) {
        return new Promise((resolve, reject) => { // 包裝成 Promise
            const spawn = require("child_process").spawn;
            const pythonScript = path.join(__dirname, 'catch.py'); // path/to/catch.py
            const pythonProcess = spawn('python', [pythonScript, account, password]);

            //console.log(`account: ${account}`);
            //console.log(`password: ${password}`);

            pythonProcess.stdout.on('data', (data) => {
                //console.log(`data.toString: ${data.toString()}`);
                if (data.toString().trim() === 'login falied') {
                    resolve(false); // 登入成功，解析 Promise 為 true
                } else {
                    resolve(data.toString().trim()); // 登入失敗，解析 Promise 為 false
                }
            });

            pythonProcess.stderr.on('data', (data) => {
                console.error(`stderr: ${data.toString()}`);
            });

            pythonProcess.on('exit', (code) => {
                console.log(`child process exited with code ${code}`);
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
                const data = jwt.verify(token, 'my_secret_key').data;
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
                const data = jwt.verify(token, 'my_secret_key').data;
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
        n_dir = "";
        dir = dir.split("");
        while (dir.pop() != "/") {
            // pass
        }
        for (let i = 0;i < dir.length;i++) {
            n_dir += dir[i];
        }
        return n_dir;
    },

    // return connection of mariadb
    getDBConnection : async function() {
	const db = require("mariadb");
	try {
            // create pool
	    const pool = db.createPool({
    	        host : 'localhost',
    	        user : 'wang',
                password : 'wang313',
    	        database : 'software_collections'
	    });
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
    }
};
