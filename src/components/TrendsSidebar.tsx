import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import FollowButton from "./FollowButton";
import UserAvatar from "./UserAvatar";
import UserTooltip from "./UserTooltip";

export default function TrendsSidebar() {
  return (
    <div className="sticky top-[5.25rem] hidden h-fit w-72 flex-none space-y-5 md:block lg:w-80">
      <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
        <WhoToFollow />
        <TrendingTopics />
      </Suspense>
    </div>
  );
}

async function WhoToFollow() {
  const sessions = await auth.api.getSession({
    headers: await headers(),
  });

  const user = sessions?.user as { id: string };

  if (!user) return null;

  const usersToFollow = await prisma.user.findMany({
    where: {
      NOT: {
        id: user.id,
      },
      followers: {
        none: {
          followerId: user.id,
        },
      },
    },
    select: getUserDataSelect(user.id),
    take: 5,
  });

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">Who to follow</div>
      {usersToFollow.map((user) => (
        <div key={user.id} className="flex items-center justify-between gap-3">
          <UserTooltip user={user}>
            <Link
              href={`/dashboard/users/${user.id}`}
              className="flex items-center gap-3"
            >
              <UserAvatar avatarUrl={user.image} className="flex-none" />
              <div>
                <p className="line-clamp-1 break-all font-semibold hover:underline">
                  {user.displayName || user.name}
                </p>
                <p className="line-clamp-1 break-all text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </Link>
          </UserTooltip>
          <FollowButton
            userId={user.id}
            initialState={{
              followers: user._count.followers,
              isFollowedByUser: user.followers.some(
                ({ followerId }) => followerId === user.id
              ),
            }}
          />
        </div>
      ))}
    </div>
  );
}

// const getTrendingTopics = unstable_cache(
//   async () => {
//     const result = await prisma.$queryRaw<{ hashtag: string; count: bigint }[]>`
//             SELECT LOWER(unnest(regexp_matches(content, '#[[:alnum:]_]+', 'g'))) AS hashtag, COUNT(*) AS count
//             FROM posts
//             GROUP BY (hashtag)
//             ORDER BY count DESC, hashtag ASC
//             LIMIT 5
//         `;

//     return result.map((row) => ({
//       hashtag: row.hashtag,
//       count: Number(row.count),
//     }));
//   },
//   ["trending_topics"],
//   {
//     revalidate: 3 * 60 * 60,
//   }
// );

const getTrendingTopics = unstable_cache(
  async () => {
    // 1. Fetch all post contents
    const posts = await prisma.post.findMany({
      select: { content: true },
    });

    // 2. Extract hashtags with regex
    const hashtagCounts: Record<string, number> = {};

    for (const post of posts) {
      const matches = post.content.match(/#[\w]+/g); // matches hashtags like #hello_world
      if (matches) {
        for (let tag of matches) {
          tag = tag.toLowerCase(); // normalize
          hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
        }
      }
    }

    // 3. Convert to array + sort by count DESC, then alphabetically
    const trending = Object.entries(hashtagCounts)
      .map(([hashtag, count]) => ({ hashtag, count }))
      .sort((a, b) => {
        if (b.count === a.count) return a.hashtag.localeCompare(b.hashtag);
        return b.count - a.count;
      })
      .slice(0, 5); // limit 5

    return trending;
  },
  ["trending_topics"],
  {
    revalidate: 3 * 60 * 60, // 3 hours
  }
);

async function TrendingTopics() {
  const trendingTopics = await getTrendingTopics();

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">Trending topics</div>
      {trendingTopics.map(({ hashtag, count }) => {
        const title = hashtag.split("#")[1];

        return (
          <Link key={title} href={`/hashtag/${title}`} className="block">
            <p
              className="line-clamp-1 break-all font-semibold hover:underline"
              title={hashtag}
            >
              {hashtag}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatNumber(count)} {count === 1 ? "post" : "posts"}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
