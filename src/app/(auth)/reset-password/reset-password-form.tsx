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
import { resetPasswordSchema, ResetPasswordSchemaData } from "../auth-schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { resetPassword } from "@/lib/auth-client";

export function ResetPasswordForm({ token }: { token: string }) {
  const form = useForm<ResetPasswordSchemaData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      newPasswordConfirmation: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function onSubmit(values: ResetPasswordSchemaData) {
    setIsSubmitting(true);
    const formData = new FormData();

    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value);
    }

    await resetPassword({
      newPassword: values.newPassword,
      token,
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
          toast.success("Password reset successfully.");
          router.push("/login");
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
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter new password to reset your password
          </p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-3">
            <FormField
              control={form.control}
              name="newPasswordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Reset password"}
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
