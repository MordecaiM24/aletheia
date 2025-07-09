import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarUser } from "@/types/types";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, orgId, orgRole, sessionClaims } = await auth();

  const orgName = sessionClaims?.orgName as string;
  const username = sessionClaims?.username as string;
  const email = sessionClaims?.email as string;
  const imageUrl = sessionClaims?.imageUrl as string;
  const orgImageUrl = sessionClaims?.orgImageUrl as string;

  if (!userId || !orgId) {
    redirect("/sign-in");
  }

  const user: SidebarUser = {
    username,
    email,
    orgRole,
    orgName,
    imageUrl,
    orgImageUrl,
  };

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
