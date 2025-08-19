import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return <>{children}</>;
};

export default AuthLayout;
