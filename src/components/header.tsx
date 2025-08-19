"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import Image from "next/image";
import { ModeToggle } from "./mode-toggle";

import { Menu, User } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "News", href: "/news" },
];

const Header = () => {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav
        aria-label="Global"
        className="flex items-center justify-between p-6 lg:px-8"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Shudhho manush network</span>
            <Image
              alt=""
              src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
              className="h-8 w-auto"
              width={100}
              height={100}
            />
          </Link>
        </div>
        <div className="flex lg:hidden">
          <Sheet>
            <SheetTrigger>
              <Menu aria-hidden="true" className="size-6" />
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <Link href="/" className="-m-1.5 p-1.5">
                  <span className="sr-only">Your Company</span>
                  <Image
                    alt=""
                    src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                    className="h-8 w-auto"
                    width={100}
                    height={100}
                  />
                </Link>
              </SheetHeader>
              <div className="mt-6 flow-root px-8">
                <div className="-my-6 divide-y divide-muted">
                  <div className="space-y-2 py-6">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-secondary-foreground hover:bg-muted"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                  <div className="py-6">
                    <UserMenu />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm/6 font-semibold text-secondary-foreground"
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end space-x-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </nav>
    </header>
  );
};

export default Header;

const UserMenu = () => {
  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login"); // redirect to login page
        },
      },
    });
  };

  const router = useRouter();

  const { data: session } = useSession();

  return (
    <>
      {session ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar>
              <AvatarImage src={session?.user?.image || "/user-avatar.png"} />
              <AvatarFallback>
                <AvatarFallback>
                  {session.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link
          href="/login"
          className="text-sm/6 font-semibold text-secondary-foreground"
        >
          Log in <span aria-hidden="true">&rarr;</span>
        </Link>
      )}
    </>
  );
};
