import { env } from "@/lib/env";

export function getAdminEmails(): string[] {
  return env.adminEmails;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  const normalized = email.trim().toLowerCase();
  return env.adminEmails.includes(normalized);
}
