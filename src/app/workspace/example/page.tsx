import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Dashboard from "@/components/temp/dashboard";

export default async function Home() {
  const { userId, orgId } = await auth();
  if (!userId && !orgId) {
    redirect("/sign-in");
  }

  if (userId && !orgId) {
    redirect("/org");
  }

  return (
    <SidebarInset>
      <SiteHeader title="Dashboard" />
      <div className="flex flex-1 flex-col">
        <Dashboard />
      </div>
    </SidebarInset>
  );
}
