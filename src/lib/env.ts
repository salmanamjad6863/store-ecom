import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, "NEXT_PUBLIC_FIREBASE_API_KEY is required"),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z
    .string()
    .min(1, "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is required"),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z
    .string()
    .min(1, "NEXT_PUBLIC_FIREBASE_PROJECT_ID is required"),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z
    .string()
    .min(1, "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is required"),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z
    .string()
    .min(1, "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID is required"),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1, "NEXT_PUBLIC_FIREBASE_APP_ID is required"),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_ADMIN_EMAILS: z.string().min(1, "NEXT_PUBLIC_ADMIN_EMAILS is required"),
  NEXT_PUBLIC_STORE_NAME: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_CURRENCY_CODE: z.string().optional(),
  NEXT_PUBLIC_CURRENCY_LOCALE: z.string().optional(),
  NEXT_PUBLIC_META_PIXEL_ID: z.string().optional(),
});

function formatEnvError(error: z.ZodError): string {
  const missing = error.issues.map((issue) => issue.path.join(".")).join(", ");
  return `Invalid environment variables: ${missing}. Copy .env.example to .env.local and fill in your Firebase and admin settings.`;
}

function parsePublicEnv() {
  const result = publicEnvSchema.safeParse({
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    NEXT_PUBLIC_ADMIN_EMAILS: process.env.NEXT_PUBLIC_ADMIN_EMAILS,
    NEXT_PUBLIC_STORE_NAME: process.env.NEXT_PUBLIC_STORE_NAME,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_CURRENCY_CODE: process.env.NEXT_PUBLIC_CURRENCY_CODE,
    NEXT_PUBLIC_CURRENCY_LOCALE: process.env.NEXT_PUBLIC_CURRENCY_LOCALE,
    NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
  });

  if (!result.success) {
    throw new Error(formatEnvError(result.error));
  }

  const data = result.data;

  return {
    firebase: {
      apiKey: data.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: data.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: data.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: data.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: data.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: data.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: data.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    },
    adminEmails: data.NEXT_PUBLIC_ADMIN_EMAILS.split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
    storeName: data.NEXT_PUBLIC_STORE_NAME ?? "iBloom Elara",
    siteUrl: data.NEXT_PUBLIC_SITE_URL ?? "https://www.ibloomelara.com",
    currency: {
      code: data.NEXT_PUBLIC_CURRENCY_CODE ?? "PKR",
      locale: data.NEXT_PUBLIC_CURRENCY_LOCALE ?? "en-PK",
    },
    metaPixelId: data.NEXT_PUBLIC_META_PIXEL_ID,
  };
}

export const env = parsePublicEnv();

export type AppEnv = typeof env;
