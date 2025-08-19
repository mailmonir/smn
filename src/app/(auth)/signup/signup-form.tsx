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
import { signupSchema, SignupSchemaData } from "../auth-schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Social from "../social";
import { authClient } from "@/lib/auth-client";

export function SignupForm() {
  const form = useForm<SignupSchemaData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function onSubmit(values: SignupSchemaData) {
    const data = await authClient.signUp.email(
      {
        name: values.name,
        email: values.email,
        password: values.password,
        callbackURL: "/login",
      },
      {
        onRequest: (ctx) => {
          setIsSubmitting(true);
        },
        onSuccess: async (ctx) => {
          setIsSubmitting(false);
          toast.success("Verification email sent. Please check your inbox.");
          router.replace("/login");
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
        className={cn("flex flex-col gap-6")}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Create new account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Fill the form below to create your account
          </p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-3">
            <FormField
              control={form.control}
              name="passwordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password Confirmation</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
          <Social />
        </div>
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline underline-offset-4">
            Login
          </Link>
        </div>
      </form>
    </Form>
  );
}
