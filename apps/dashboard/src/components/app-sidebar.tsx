import { IconBooks, IconChartBar, IconDashboard, IconHelp, IconPackage, IconSearch, IconSettings, IconShoppingCart, IconUsers, IconFileText } from "@tabler/icons-react"
import { SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, Sidebar, SidebarContent, SidebarFooter } from "@workspace/ui/components/sidebar"
import * as React from "react"
import { useNavigate } from "react-router-dom"
import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"
import { useAuth } from "../contexts/use-auth"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Products",
      url: "/dashboard/products",
      icon: IconBooks,
    },
    {
      title: "Posts",
      url: "/dashboard/posts",
      icon: IconFileText,
    },
    {
      title: "Orders",
      url: "#",
      icon: IconShoppingCart,
    },
    {
      title: "Customers",
      url: "#",
      icon: IconUsers,
    },
    {
      title: "Analytics",
      url: "#",
      icon: IconChartBar,
    },
    {
      title: "Inventory",
      url: "#",
      icon: IconPackage,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const displayName =
    user
      ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
      : "User";

  const displayEmail = user?.email || "";
  const displayAvatar = user?.picture || "";

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/">
                <IconBooks className="size-5!" />
                <span className="text-base font-semibold">
                  Book<span className="text-[var(--primary)]">Store</span>
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: displayName,
            email: displayEmail,
            avatar: displayAvatar,
          }}
          onLogout={handleLogout}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
