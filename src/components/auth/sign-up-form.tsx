"use client";

import { useActionState } from "react";
import { signUpAction } from "@/app/(auth)/register/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { FormField } from "@/components/auth/form-field";
import { AuthFormDivider } from "@/components/auth/auth-form-divider";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUpAction, {
    error: null,
  });

  return (
    <form action={formAction} className="w-full">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1 pb-3 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
          <CardDescription>Enter your details to get started</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Full name" htmlFor="name">
            <input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              required
              disabled={isPending}
              data-slot="input"
              className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
            />
          </FormField>
          <FormField label="Email" htmlFor="email">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              disabled={isPending}
              data-slot="input"
              className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
            />
          </FormField>
          <FormField label="Password" htmlFor="password">
            <PasswordInput
              id="password"
              name="password"
              placeholder="Create a strong password"
              required
              autoComplete="new-password"
              minLength={8}
              disabled={isPending}
            />
          </FormField>
          <FormField label="Confirm password" htmlFor="confirmPassword">
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Re-enter your password"
              required
              autoComplete="new-password"
              minLength={8}
              disabled={isPending}
            />
          </FormField>
          {state?.error && (
            <p className="text-sm text-destructive font-medium">{state.error}</p>
          )}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create account
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <AuthFormDivider />
          <GoogleSignInButton disabled={isPending} />
        </CardFooter>
      </Card>
    </form>
  );
}
