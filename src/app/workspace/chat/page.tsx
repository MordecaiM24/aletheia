import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Chat from "./chat";

export default async function Page() {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    redirect("/sign-in");
  }

  return (
    <SidebarInset>
      <SiteHeader title="Chat" />
      <Chat />
    </SidebarInset>
  );
}
