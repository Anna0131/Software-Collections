const c = require('config');
var jwt = require('jsonwebtoken');
const path = require('path');

// call login() function in catch.py
module.exports = {
    loginAuthentication: function (account, password) {
        const spawn = require("child_process").spawn;
        const pythonScript = path.join(__dirname, 'catch.py'); // path/to/catch.py
        const pythonProcess = spawn('python', [pythonScript, account, password]);
        //console.log(`catch.py path: ${pythonScript}`); C:\Users\krixi\Software_Collections\catch.py

        console.log(`account: ${account}`);
        console.log(`password: ${password}`);

        // print return value of catch.py login() function
        pythonProcess.stdout.on('data', (data) => {
            
            console.log(`data.toString: ${data.toString()}`); // print the return value of catch.py login() function
            
            if (data.toString().trim() === 'login success') {
                //console.log('success');
                return true;// return true if login success
            } else {
                //console.log('fail');
                return false;// return false if login fail
            }
        });

        // print error message
        pythonProcess.stderr.on('data', (data) => {
            console.error(`console.error: ${data.toString()}`);
            return false;// return false if error
        });

        // print exit code
        pythonProcess.on('exit', (code) => {
            console.log(`child process exited with code ${code}`);
            return false;// return false if exit code is not 0
        });

        // print error message
        pythonProcess.on('error', (err) => {
            console.error(err);
            return false;// return false if error
        });

    },
    
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
