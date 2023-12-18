import CustomFeed from "@/components/Homepage/CustomFeed";
import GeneralFeed from "@/components/Homepage/GeneralFeed";
import { buttonVariants } from "@/components/ui/Button";
import { getAuthSession } from "@/lib/auth";
import { HomeIcon } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const session = await getAuthSession();
  return (
    <>
      <h1 className="font-bold text-3xl md:text-4xl">Your Feed</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6">
        {/* @ts-expect-error Server Component */}
        {session ? <CustomFeed /> : <GeneralFeed />}
        <div className="overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last">
          <div className="px-6 py-4 bg-emerald-100">
            <p className="font-semibold py-3 flex gap-1.5 items-center">
              <HomeIcon className="w-4 h-4" />
              Home
            </p>
          </div>
          <div className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
            <div className="flex justify-between gap-x-4 py-3">
              <p className="text-zinc-500">
                Your personal Breadit frontpage. Come here to check in with your
                favorite communities.
              </p>
            </div>
            <Link
              className={buttonVariants({
                className: "w-full mt-4 mb-6",
              })}
              href={`/r/create`}
            >
              Create Community
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
