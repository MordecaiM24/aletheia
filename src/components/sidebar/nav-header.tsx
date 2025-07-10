import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { SidebarUser } from "@/types/types";
import { IconInnerShadowTop } from "@tabler/icons-react";
import Link from "next/link";

export function NavHeader({ user }: { user: SidebarUser }) {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuButton
          asChild
          className="data-[slot=sidebar-menu-button]:!p-1.5"
        >
          <Link href="/workspace">
            <IconInnerShadowTop className="!size-5" />
            <span className="text-base font-semibold">{user.orgName}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenu>
    </SidebarHeader>
  );
}
