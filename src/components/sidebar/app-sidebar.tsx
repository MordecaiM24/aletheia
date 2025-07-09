import { Sidebar } from "@/components/ui/sidebar";
import { SidebarUser } from "@/types/types";
import { NavHeader } from "./nav-header";
import { NavMain } from "./nav-main";
import { NavFooter } from "./nav-footer";

export function AppSidebar({ user }: { user: SidebarUser }) {
  return (
    <Sidebar collapsible="offcanvas">
      <NavHeader user={user} />
      <NavMain />
      <NavFooter user={user} />
    </Sidebar>
  );
}
