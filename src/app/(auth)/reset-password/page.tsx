import { GalleryVerticalEnd } from "lucide-react";

import { ResetPasswordForm } from "./reset-password-form";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface SearchParams {
  [key: string]: string | undefined;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }
  const token = (await searchParams).token;

  if (!token) redirect("/auth/login");

  return (
    <div className="min-h-svh flex items-center justify-center">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Shudhho manush network
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full min-w-sm">
            <ResetPasswordForm token={token} />
          </div>
        </div>
      </div>
    </div>
  );
}
