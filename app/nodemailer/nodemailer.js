'use strict';
const prisma = require('../db');
const nodemailer = require("nodemailer")

const mail = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 587,
    auth: {
        user: '14369033360871',
        pass: '9b9110e3ea9924'
    }
});

//send email
function sendEmail(user, token) {
    const mailOptions = {
        from: 'tutsmake@gmail.com',
        to: user.email,
        subject: 'Reset Password Link - Tutsmake.com',
        html: `<p>You requested for reset password, kindly use this <a href="http://localhost:3000/reset-password/${user.email}/${token}">link</a> to reset your password</p>`

    };

    return new Promise((resolve, reject) => {
        mail.sendMail(mailOptions)
            .then((success) => resolve(true))
            .catch((error) => reject(error))
            .finally(() => console.log('mail task completed'))
    })
}

module.exports = { sendEmail }