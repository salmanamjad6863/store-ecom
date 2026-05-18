"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/use-auth";
import { isAdminEmail } from "@/lib/auth/admin";

import { AdminShell } from "./admin-shell";

type AdminGuardProps = {
  children: React.ReactNode;
};

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  const isLoginPage = pathname === "/admin/login";
  const isAdmin = isAdminEmail(user?.email);

  useEffect(() => {
    if (loading || isLoginPage) {
      return;
    }

    if (!user) {
      router.replace("/admin/login");
    }
  }, [user, loading, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading || (!user && !isLoginPage)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="max-w-md space-y-4 text-center">
          <Text variant="h2" as="h2">
            Access denied
          </Text>
          <Text variant="muted" as="p">
            {user?.email} is not authorized for the admin panel. Contact the store owner if you
            believe this is a mistake.
          </Text>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                void signOut().then(() => router.replace("/admin/login"));
              }}
            >
              Sign out
            </Button>
            <Button href="/" variant="secondary">
              Back to store
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
