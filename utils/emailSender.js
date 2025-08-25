const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendPasswordResetEmail = async (email, resetLink) => {
  const mailOptions = {
    from: '"Soporte TuApp" <soporte@tuapp.com>',
    to: email,
    subject: "Restablece tu contraseña",
    html: `
      <h2>Restablecimiento de Contraseña</h2>
      <p>Haz clic en el siguiente enlace:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Si no solicitaste esto, ignora este correo.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};