// server/utils/sendInviteEmail.js
const nodemailer = require('nodemailer');

async function sendInviteEmail(email, tripName, inviteLink) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'judeorifa28@gmail.com',
      pass: 'wpqq yzdy upnu htae', // your app password
    },
  });

  const mailOptions = {
    from: '"TripBudgetter" <judeorifa28@gmail.com>',
    to: email,
    subject: `Trip Invitation: ${tripName}`,
    html: `
      <p>Hello 👋</p>
      <p>You’ve been invited to join the trip: <strong>${tripName}</strong>.</p>
      <p>Click <a href="${inviteLink}">here</a> to join the trip.</p>
      <p>If you don’t have an account, you’ll be able to sign up.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendInviteEmail;
