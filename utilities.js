const c = require('config');
var jwt = require('jsonwebtoken');
const path = require('path');

// call login() function in catch.py
module.exports = {
    loginAuthentication: function(account, password) {
        return new Promise((resolve, reject) => { // 包裝成 Promise
            const spawn = require("child_process").spawn;
            const pythonScript = path.join(__dirname, 'catch.py'); // path/to/catch.py
            const pythonProcess = spawn('python', [pythonScript, account, password]);

            console.log(`account: ${account}`);
            console.log(`password: ${password}`);

            pythonProcess.stdout.on('data', (data) => {
                console.log(`data.toString: ${data.toString()}`);
                if (data.toString().trim() === 'login success') {
                    resolve(true); // 登入成功，解析 Promise 為 true
                } else {
                    resolve(false); // 登入失敗，解析 Promise 為 false
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
                console.log(data);
                if (data.uid) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch (error) {
                console.error(error);
                reject(false);
            }
        });
    }
};
