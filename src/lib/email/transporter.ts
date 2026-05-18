import nodemailer from "nodemailer";

import { isSmtpConfigured, serverEnv } from "@/lib/env.server";

let transporter: nodemailer.Transporter | null = null;

export function getMailTransporter(): nodemailer.Transporter | null {
  if (!isSmtpConfigured()) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: serverEnv.smtp.host,
      port: serverEnv.smtp.port,
      secure: serverEnv.smtp.port === 465,
      auth: {
        user: serverEnv.smtp.user,
        pass: serverEnv.smtp.pass,
      },
    });
  }

  return transporter;
}
