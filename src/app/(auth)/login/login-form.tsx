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
import { loginSchema, LoginSchemaData } from "../auth-schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Social from "../social";
import { signIn } from "@/lib/auth-client";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const form = useForm<LoginSchemaData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function onSubmit(values: LoginSchemaData) {
    const { data, error } = await signIn.email(
      {
        email: values.email,
        password: values.password,
        callbackURL: "/dashboard",
        rememberMe: false,
      },
      {
        onRequest: (ctx) => {
          setIsSubmitting(true);
        },
        onSuccess: (ctx) => {
          setIsSubmitting(false);
          toast.success("Logged in successfully.");
          router.replace("/dashboard");
        },
        onError: (ctx) => {
          toast.error(ctx.error?.message);
          setIsSubmitting(false);
        },
      }
    );
  }

  return (
    <Form {...form}>
      <form
        className={cn("flex flex-col gap-6", className)}
        {...props}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
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
          <div className="grid gap-3">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </div>
        <Social />
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline underline-offset-4">
            Sign up
          </Link>
        </div>
      </form>
    </Form>
  );
}
