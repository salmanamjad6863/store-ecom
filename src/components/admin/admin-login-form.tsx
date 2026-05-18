"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/use-auth";
import { isAdminEmail } from "@/lib/auth/admin";
import { env } from "@/lib/env";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function AdminLoginForm() {
  const router = useRouter();
  const { user, loading, signIn, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user && isAdminEmail(user.email)) {
      router.replace("/admin/products");
    }
  }, [user, loading, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    setError(null);

    try {
      await signIn(values.email, values.password);

      if (!isAdminEmail(values.email)) {
        await signOut();
        setError("This account is not authorized for admin access.");
        return;
      }

      router.replace("/admin/products");
    } catch {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <Text variant="h1" as="h1" className="text-2xl">
            {env.storeName} Admin
          </Text>
          <Text variant="muted" as="p">
            Sign in with an allowlisted admin email.
          </Text>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input id="admin-email" type="email" autoComplete="email" {...register("email")} />
            {errors.email ? (
              <Text variant="small" as="p" className="text-danger">
                {errors.email.message}
              </Text>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password ? (
              <Text variant="small" as="p" className="text-danger">
                {errors.password.message}
              </Text>
            ) : null}
          </div>

          {error ? (
            <Text variant="small" as="p" className="text-danger">
              {error}
            </Text>
          ) : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in to admin"}
          </Button>
        </form>

        <Text variant="small" as="p" className="text-center text-muted">
          <Button href="/" variant="ghost" size="sm">
            ← Back to store
          </Button>
        </Text>
      </Card>
    </div>
  );
}
