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
import { authClient, signIn } from "@/lib/auth-client";
import { auth } from "@/lib/auth";

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

  const handleGoogleLoginClick = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

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
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">
              Or continue with
            </span>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleLoginClick}
            type="button"
          >
            <>
              {/*?xml version="1.0"?*/}
              <svg
                id="Capa_1"
                style={{
                  // enableBackground: "new 0 0 150 150",
                  width: "30px", // bigger width
                  height: "30px", // bigger height
                }}
                version="1.1"
                viewBox="0 0 150 150"
                xmlSpace="preserve"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                width="100%"
              >
                <style
                  type="text/css"
                  dangerouslySetInnerHTML={{
                    __html:
                      "\n\t.st0{fill:#1A73E8;}\n\t.st1{fill:#EA4335;}\n\t.st2{fill:#4285F4;}\n\t.st3{fill:#FBBC04;}\n\t.st4{fill:#34A853;}\n\t.st5{fill:#4CAF50;}\n\t.st6{fill:#1E88E5;}\n\t.st7{fill:#E53935;}\n\t.st8{fill:#C62828;}\n\t.st9{fill:#FBC02D;}\n\t.st10{fill:#1565C0;}\n\t.st11{fill:#2E7D32;}\n\t.st12{fill:#F6B704;}\n\t.st13{fill:#E54335;}\n\t.st14{fill:#4280EF;}\n\t.st15{fill:#34A353;}\n\t.st16{clip-path:url(#SVGID_2_);}\n\t.st17{fill:#188038;}\n\t.st18{opacity:0.2;fill:#FFFFFF;enable-background:new    ;}\n\t.st19{opacity:0.3;fill:#0D652D;enable-background:new    ;}\n\t.st20{clip-path:url(#SVGID_4_);}\n\t.st21{opacity:0.3;fill:url(#_45_shadow_1_);enable-background:new    ;}\n\t.st22{clip-path:url(#SVGID_6_);}\n\t.st23{fill:#FA7B17;}\n\t.st24{opacity:0.3;fill:#174EA6;enable-background:new    ;}\n\t.st25{opacity:0.3;fill:#A50E0E;enable-background:new    ;}\n\t.st26{opacity:0.3;fill:#E37400;enable-background:new    ;}\n\t.st27{fill:url(#Finish_mask_1_);}\n\t.st28{fill:#FFFFFF;}\n\t.st29{fill:#0C9D58;}\n\t.st30{opacity:0.2;fill:#004D40;enable-background:new    ;}\n\t.st31{opacity:0.2;fill:#3E2723;enable-background:new    ;}\n\t.st32{fill:#FFC107;}\n\t.st33{opacity:0.2;fill:#1A237E;enable-background:new    ;}\n\t.st34{opacity:0.2;}\n\t.st35{fill:#1A237E;}\n\t.st36{fill:url(#SVGID_7_);}\n\t.st37{fill:#FBBC05;}\n\t.st38{clip-path:url(#SVGID_9_);fill:#E53935;}\n\t.st39{clip-path:url(#SVGID_11_);fill:#FBC02D;}\n\t.st40{clip-path:url(#SVGID_13_);fill:#E53935;}\n\t.st41{clip-path:url(#SVGID_15_);fill:#FBC02D;}\n",
                  }}
                />
                <g>
                  <path
                    className="st14"
                    d="M120,76.1c0-3.1-0.3-6.3-0.8-9.3H75.9v17.7h24.8c-1,5.7-4.3,10.7-9.2,13.9l14.8,11.5   C115,101.8,120,90,120,76.1L120,76.1z"
                  />
                  <path
                    className="st15"
                    d="M75.9,120.9c12.4,0,22.8-4.1,30.4-11.1L91.5,98.4c-4.1,2.8-9.4,4.4-15.6,4.4c-12,0-22.1-8.1-25.8-18.9   L34.9,95.6C42.7,111.1,58.5,120.9,75.9,120.9z"
                  />
                  <path
                    className="st12"
                    d="M50.1,83.8c-1.9-5.7-1.9-11.9,0-17.6L34.9,54.4c-6.5,13-6.5,28.3,0,41.2L50.1,83.8z"
                  />
                  <path
                    className="st13"
                    d="M75.9,47.3c6.5-0.1,12.9,2.4,17.6,6.9L106.6,41C98.3,33.2,87.3,29,75.9,29.1c-17.4,0-33.2,9.8-41,25.3   l15.2,11.8C53.8,55.3,63.9,47.3,75.9,47.3z"
                  />
                </g>
              </svg>
            </>
            Login with Google
          </Button>
        </div>
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
