import { z } from "zod";

import { env } from "@/lib/env";

/** Gmail SMTP — host/port are fixed; credentials come from env. */
const SMTP_HOST = "smtp.gmail.com";
const SMTP_PORT = 587;

const serverEnvSchema = z.object({
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
});

function parseServerEnv() {
  const result = serverEnvSchema.safeParse({
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });

  const data = result.success ? result.data : {};
  const user = data.SMTP_USER ?? "";
  const pass = data.SMTP_PASS ?? "";

  return {
    smtp: {
      host: SMTP_HOST,
      port: SMTP_PORT,
      user,
      pass,
      from: user ? `${env.storeName} <${user}>` : "",
    },
    appUrl: data.NEXT_PUBLIC_APP_URL ?? env.siteUrl,
  };
}

export const serverEnv = parseServerEnv();

export function isSmtpConfigured(): boolean {
  const { smtp } = serverEnv;
  return Boolean(smtp.user && smtp.pass);
}

/** Inbox for new-order alerts — separate from admin panel login allowlist. */
export function getOrderNotificationEmails(): string[] {
  const configured = process.env.ORDER_NOTIFICATION_EMAILS?.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (configured?.length) {
    return configured;
  }

  const storeEmail = serverEnv.smtp.user.trim().toLowerCase();

  if (storeEmail) {
    return [storeEmail];
  }

  return [];
}
