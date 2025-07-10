import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Clerk | Organization Demo",
};

export default async function DashboardPage() {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    redirect("/sign-in");
  }

  return (
    <main className="col-span-2 m-auto w-full max-w-lg space-y-6 py-2">
      <Link
        href="/settings/authorization-playground"
        className="block w-full rounded border p-5 text-center text-2xl font-bold shadow"
      >
        Authorization with Custom UI
      </Link>
      <ul className="grid grid-cols-2 gap-3">
        <li>
          <Link
            href="/settings/discover"
            className="block rounded border p-5 text-center text-lg font-medium shadow"
          >
            Discover Organizations
          </Link>
        </li>
        <li>
          <Link
            href="/settings/organization"
            className="block rounded border p-5 text-center text-lg font-medium shadow"
          >
            Organization Profile
          </Link>
        </li>
        <li>
          <Link
            href="/settings/create-organization"
            className="block rounded border p-5 text-center text-lg font-medium shadow"
          >
            Create Organization
          </Link>
        </li>
        <li>
          <Link
            href="/settings/route-handlers"
            className="block rounded border p-5 text-center text-lg font-medium shadow"
          >
            Test endpoints
          </Link>
        </li>
      </ul>
    </main>
  );
}
