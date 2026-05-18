"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/use-auth";

const signInSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = signInSchema.extend({
  displayName: z.string().min(2, "Name is required").optional(),
});

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

export function AccountAuthPanel() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [authError, setAuthError] = useState<string | null>(null);

  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", displayName: "" },
  });

  const handleSignIn = async (values: SignInValues) => {
    setAuthError(null);

    try {
      await signIn(values.email, values.password);
    } catch {
      setAuthError("Could not sign in. Check your email and password.");
    }
  };

  const handleSignUp = async (values: SignUpValues) => {
    setAuthError(null);

    try {
      await signUp(values.email, values.password, values.displayName);
    } catch {
      setAuthError("Could not create account. This email may already be in use.");
    }
  };

  return (
    <Card className="mx-auto max-w-md space-y-6">
      <div className="flex gap-2 rounded-lg bg-background p-1">
        <button
          type="button"
          onClick={() => setMode("signIn")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            mode === "signIn" ? "bg-surface text-foreground shadow-sm" : "text-muted"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("signUp")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            mode === "signUp" ? "bg-surface text-foreground shadow-sm" : "text-muted"
          }`}
        >
          Register
        </button>
      </div>

      {mode === "signIn" ? (
        <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signIn-email">Email</Label>
            <Input id="signIn-email" type="email" {...signInForm.register("email")} />
            {signInForm.formState.errors.email ? (
              <Text variant="small" as="p" className="text-danger">
                {signInForm.formState.errors.email.message}
              </Text>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signIn-password">Password</Label>
            <Input
              id="signIn-password"
              type="password"
              autoComplete="current-password"
              {...signInForm.register("password")}
            />
            {signInForm.formState.errors.password ? (
              <Text variant="small" as="p" className="text-danger">
                {signInForm.formState.errors.password.message}
              </Text>
            ) : null}
          </div>

          {authError ? (
            <Text variant="small" as="p" className="text-danger">
              {authError}
            </Text>
          ) : null}

          <Button type="submit" className="w-full" disabled={signInForm.formState.isSubmitting}>
            {signInForm.formState.isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      ) : (
        <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signUp-name">Full name</Label>
            <Input id="signUp-name" {...signUpForm.register("displayName")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signUp-email">Email</Label>
            <Input id="signUp-email" type="email" {...signUpForm.register("email")} />
            {signUpForm.formState.errors.email ? (
              <Text variant="small" as="p" className="text-danger">
                {signUpForm.formState.errors.email.message}
              </Text>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signUp-password">Password</Label>
            <Input
              id="signUp-password"
              type="password"
              autoComplete="new-password"
              {...signUpForm.register("password")}
            />
            {signUpForm.formState.errors.password ? (
              <Text variant="small" as="p" className="text-danger">
                {signUpForm.formState.errors.password.message}
              </Text>
            ) : null}
          </div>

          {authError ? (
            <Text variant="small" as="p" className="text-danger">
              {authError}
            </Text>
          ) : null}

          <Button type="submit" className="w-full" disabled={signUpForm.formState.isSubmitting}>
            {signUpForm.formState.isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </form>
      )}

      <Text variant="small" as="p" className="text-center text-muted">
        Guest checkout is always available — no account required to place an order.
      </Text>
    </Card>
  );
}
