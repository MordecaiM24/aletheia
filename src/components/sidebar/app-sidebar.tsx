import { Sidebar } from "@/components/ui/sidebar";
import { SidebarUser } from "@/types/types";
import { NavHeader } from "./nav-header";
import { NavMain } from "./nav-main";
import { NavFooter } from "./nav-footer";

export function AppSidebar({
  user,
  ...props
}: { user: SidebarUser } & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <NavHeader user={user} />
      <NavMain />
      <NavFooter user={user} />
    </Sidebar>
  );
}
