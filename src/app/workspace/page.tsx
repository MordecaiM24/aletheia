import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId, orgId, sessionClaims } = await auth();
  if (!userId && !orgId) {
    redirect("/sign-in");
  }

  if (userId && !orgId) {
    redirect("/org");
  }

  const username = sessionClaims?.username as string;

  return <div className="flex flex-1 flex-col">Hello, {username}</div>;
}
