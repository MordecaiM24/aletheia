import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Chat() {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    redirect("/sign-in");
  }

  return <div>Chat</div>;
}
