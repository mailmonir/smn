import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import MenuBar from "./MenuBar";
import Navbar from "./Navbar";
import SessionProvider from "@/app/dashboard/SessionProvider";
import { User, Session } from "@/generated/prisma";

type AuthUser = {
  id: string;
  email: string;
  emailVerified?: boolean;
  name?: string | null;
  image?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  username?: string | null;
  displayName?: string | null;
  bio?: string | null;
};

// Normalize user to make sure all required fields exist
function normalizeUser(user: AuthUser): User {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified ?? false,
    name: user.name ?? "",
    image: user.image ?? null,
    username: user.username ?? null,
    displayName: user.displayName ?? null,
    bio: user.bio ?? null,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
  };
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect("/login");

  const contextValue = {
    user: normalizeUser(session.user as AuthUser),
    session: session?.session as Session | undefined,
  };

  return (
    <SessionProvider value={contextValue}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="mx-auto flex w-full max-w-7xl grow gap-5 p-5">
          <MenuBar className="sticky top-[5.25rem] hidden h-fit flex-none space-y-3 rounded-2xl bg-card px-3 py-5 shadow-sm sm:block lg:px-5 xl:w-80" />
          {children}
        </div>
        <MenuBar className="sticky bottom-0 flex w-full justify-center gap-5 border-t bg-card p-3 sm:hidden" />
      </div>
    </SessionProvider>
  );
}
