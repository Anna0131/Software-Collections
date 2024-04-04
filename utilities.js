var jwt = require('jsonwebtoken');

module.exports = {
    loginAuthentication : function (account, password) {
        return true;
    },

    authenToken : function(token) {
        const data = jwt.verify(token, 'my_secret_key').data;
        console.log(data);
        if (data.uid) {
            // authen successfully
            return true;
        }
        else {
            return false;
        }
    }

};