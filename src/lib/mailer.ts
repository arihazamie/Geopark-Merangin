import nodemailer from "nodemailer";

// Ethereal untuk testing
export const createTestMailer = async () => {
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return { transporter, testAccount };
};

// Simulasi kirim email saat offline
export const sendOfflineVerificationEmail = async (
  email: string,
  kode: string
) => {
  console.log(`=== [MODE OFFLINE / FALLBACK] ===`);
  console.log(`Kepada: ${email}`);
  console.log(`Kode verifikasi: ${kode}`);
};
