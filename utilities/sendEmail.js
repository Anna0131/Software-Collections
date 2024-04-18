var nodemailer = require('nodemailer');

// if the gmail use the two factor authentication, then need to use the special app password on setting of https://myaccount.google.com/apppasswords
const sender_account = "tommy50508@gmail.com";
const sender_password = "yfpo wyie vbjs ruyw";
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: sender_account,
    pass: sender_password
  }
});

module.exports = {
    send : function(receivers, subject, text) {  
        // send email to all recevier
        for (let i = 0;i < receivers.length;i++) {
            // mail info
            var mailOptions = {
                from: sender_account,
                to: receivers[i],
                subject: subject,
		html: text
            };
            // send email
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        } 
    }
}
