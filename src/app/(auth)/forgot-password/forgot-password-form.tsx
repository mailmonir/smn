"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { forgotPasswordSchema, ForgotPasswordSchemaData } from "../auth-schema";
import { toast } from "sonner";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const form = useForm<ForgotPasswordSchemaData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(values: ForgotPasswordSchemaData) {
    await authClient.forgetPassword({
      email: values.email,
      redirectTo: process.env.NEXT_PUBLIC_SITE_URL + "/reset-password",
      fetchOptions: {
        onRequest: () => {
          setIsSubmitting(true);
        },
        onResponse: () => {
          setIsSubmitting(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
          setIsSubmitting(false);
        },
        onSuccess: () => {
          toast.success("Reset link sent to your email.");
          setIsSubmitting(false);
        },
      },
    });
  }

  return (
    <Form {...form}>
      <form
        className={cn("flex flex-col gap-6")}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to get a password reset link
          </p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Send Reset Email"}
          </Button>
        </div>
        <div className="text-center text-sm">
          Go back to{" "}
          <Link href="/login" className="underline underline-offset-4">
            Login
          </Link>
        </div>
      </form>
    </Form>
  );
}
