import {
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { IconDashboard } from "@tabler/icons-react";
import {
  IconFileDescription,
  IconMessageCircle,
  IconSearch,
} from "@tabler/icons-react";
import { UploadButton } from "./upload-button";

export function NavMain() {
  const items = [
    { title: "Dashboard", url: "/workspace", icon: IconDashboard },
    { title: "Search", url: "/workspace/search", icon: IconSearch },
    { title: "Chat", url: "/workspace/chat", icon: IconMessageCircle },
    { title: "Docs", url: "/workspace/docs", icon: IconFileDescription },
  ];

  return (
    <SidebarContent>
      <SidebarGroup>
        <UploadButton />
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Link href={item.url}>
                <SidebarMenuButton className="cursor-pointer">
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );
}
