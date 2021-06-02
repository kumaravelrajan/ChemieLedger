// "use strict";
// const nodemailer = require("nodemailer");
import nodemailer from 'nodemailer'

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_HOST,
  // port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
})

const sendResetEmail = async (token, user) => {
  const resetJwtExpirationTime = process.env.RESET_JWT_EXPIRATION_MINUTES || 10
  const text = 'Guten Tag ' + user.name + ' ' + user.surname + ',<br> ' +
              '<br> Sie können Ihr Passwort der Digitalen Rohstoffbörse ' +
              'durch das Klicken des folgenden Link zurücksetzen. <br>' +
              ' Sollten Sie keine Änderung ihres Passworts beantragt haben,' +
              ' können Sie diese Email einfach ignorieren. <br>' +
              'Der Link ist nur für ' +
              resetJwtExpirationTime + ' Minuten gültig. <br>'
  const link = process.env.PASSWORD_RESET_LINK + '/' + token
  await transporter.sendMail({
    from: process.env.EMAIL_FROM_ADDRESS, // sender address
    to: user.email, // list of receivers
    subject: 'Anfrage für Passwortänderung', // Subject line
    html: '<p>' + text + "<p/> <a href='" + link + "'> Passwort zurücksetzen </a>" // html body
  })
}

const sendVerifactionEmail = async (token, user) => {
  const resetJwtExpirationTime = process.env.VERIFIKATION_JWT_EXPIRATION_MINUTES || 30
  const text = 'Guten Tag ' + user.name + ' ' + user.surname + ',<br> ' +
              '<br> Bitte verifizieren Sie Ihre Email-Adresse mithilfe des folgenden Links. ' +
              'Dieser Link ist nur für ' +
              resetJwtExpirationTime + ' Minuten gültig.'
  const link = process.env.EMAIL_VERIFIKATION_LINK + '/' + token
  await transporter.sendMail({
    from: process.env.EMAIL_FROM_ADDRESS, // sender address
    to: user.email, // list of receivers
    subject: 'Verifizierung der Email-Adresse', // Subject line
    html: '<p>' + text + "<p/> <a href='" + link + "'> Email-Adresse verifizieren </a>" // html body
  })
}

module.exports = {
  sendResetEmail,
  sendVerifactionEmail
}
