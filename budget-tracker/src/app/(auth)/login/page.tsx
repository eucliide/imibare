"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "./actions";
import { FormField } from "@/components/form-field";
import { FormInput } from "@/components/form-input";
import { PrimaryButton } from "@/components/primary-button";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Log in to your account to continue
          </p>
        </div>

        <form action={formAction} className="space-y-6">
          <FormField label="Email" htmlFor="email" error={null}>
            <FormInput
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              disabled={pending}
            />
          </FormField>

          <FormField label="Password" htmlFor="password" error={null}>
            <FormInput
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              disabled={pending}
            />
          </FormField>

          {state?.error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {state.error}
            </div>
          )}

          <PrimaryButton type="submit" disabled={pending} className="w-full">
            {pending ? "Logging in..." : "Log in"}
          </PrimaryButton>
        </form>

        <p className="text-center text-sm text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
