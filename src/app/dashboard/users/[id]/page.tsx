import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import FollowButton from "@/components/FollowButton";
import FollowerCount from "@/components/FollowerCount";
import Linkify from "@/components/Linkify";
import TrendsSidebar from "@/components/TrendsSidebar";
import UserAvatar from "@/components/UserAvatar";
import prisma from "@/lib/prisma";
import { FollowerInfo, getUserDataSelect, UserData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { formatDate } from "date-fns";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import EditProfileButton from "./EditProfileButton";
import UserPosts from "./UserPosts";

type Params = Promise<{ id: string }>;

type Props = {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const getUser = cache(async (id: string, loggedInUserId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: {
        equals: id,
        mode: "insensitive",
      },
    },
    select: getUserDataSelect(loggedInUserId),
  });

  if (!user) notFound();

  return user;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  // const resolvedSearchParams = await searchParams;

  const id = resolvedParams.id;

  if (typeof id !== "string") {
    throw new Error("Invalid id type");
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const loggedInUser = session?.user as { id: string };

  if (!loggedInUser) return {};

  const user = await getUser(id, loggedInUser.id);

  return {
    title: `${user.displayName} (@${user.name})`,
  };
}

export default async function Page(props: { params: Params }) {
  const params = await props.params;
  const id = params.id;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const loggedInUser = session?.user as { id: string };

  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }

  const user = await getUser(id, loggedInUser.id);

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <UserProfile user={user} loggedInUserId={loggedInUser.id} />
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h2 className="text-center text-2xl font-bold">
            {user.displayName || user.name}&apos;s posts
          </h2>
        </div>
        <UserPosts userId={user.id} />
      </div>
      <TrendsSidebar />
    </main>
  );
}

interface UserProfileProps {
  user: UserData;
  loggedInUserId: string;
}

async function UserProfile({ user, loggedInUserId }: UserProfileProps) {
  const followerInfo: FollowerInfo = {
    followers: user._count.followers,
    isFollowedByUser: user.followers.some(
      ({ followerId }) => followerId === loggedInUserId
    ),
  };

  return (
    <div className="h-fit w-full space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <UserAvatar
        avatarUrl={user.image}
        size={250}
        className="mx-auto size-full max-h-60 max-w-60 rounded-full"
      />
      <div className="flex flex-wrap gap-3 sm:flex-nowrap">
        <div className="me-auto space-y-3">
          <div>
            <h1 className="text-3xl font-bold">
              {user.displayName || user.name}
            </h1>
            <div className="text-muted-foreground">@{user.id}</div>
          </div>
          <div>Member since {formatDate(user.createdAt, "MMM d, yyyy")}</div>
          <div className="flex items-center gap-3">
            <span>
              Posts:{" "}
              <span className="font-semibold">
                {formatNumber(user._count.posts)}
              </span>
            </span>
            <FollowerCount userId={user.id} initialState={followerInfo} />
          </div>
        </div>
        {user.id === loggedInUserId ? (
          <EditProfileButton user={user} />
        ) : (
          <FollowButton userId={user.id} initialState={followerInfo} />
        )}
      </div>
      {/* {user.bio && (
        <>
          <hr />
          <Linkify>
            <div className="overflow-hidden whitespace-pre-line break-words">
              {user.bio}
            </div>
          </Linkify>
        </>
      )} */}
    </div>
  );
}
