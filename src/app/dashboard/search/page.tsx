import TrendsSidebar from "@/components/TrendsSidebar";
import { Metadata } from "next";
import SearchResults from "./SearchResults";
import { use } from "react";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// export function generateMetadata(props: {
//   searchParams: SearchParams;
// }): Metadata {
//   const searchParams = use(props.searchParams);
//   const q = searchParams.query;
//   return {
//     title: `Search results for "${q}"`,
//   };
// }

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;

  // Access individual search parameters
  const query = resolvedSearchParams.query; // Assuming a URL like ?query=example
  const category = resolvedSearchParams.category; // Assuming a URL like ?category=books

  // Your metadata logic here
  return {
    title: `Search results for: ${query || "No query"}`,
    description: `Displaying items in the ${category || "all"} category.`,
  };
}

export default function Page(props: { searchParams: SearchParams }) {
  const searchParams = use(props.searchParams);
  const q = searchParams.query;
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h1 className="line-clamp-2 break-all text-center text-2xl font-bold">
            Search results for &quot;{q}&quot;
          </h1>
        </div>
        <SearchResults query={q as string} />
      </div>
      <TrendsSidebar />
    </main>
  );
}
