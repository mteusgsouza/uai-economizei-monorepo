import { IconBooks, IconDashboard, IconMapPin, IconShoppingCart, IconTag, IconCategory, IconUsers, IconSettings, IconHelp, IconSearch } from "@tabler/icons-react"
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
      title: "Marcas",
      url: "/dashboard/brands",
      icon: IconTag,
    },
    {
      title: "Categorias",
      url: "/dashboard/categories",
      icon: IconCategory,
    },
    {
      title: "CEP",
      url: "/dashboard/cep",
      icon: IconMapPin,
    },
    {
      title: "Pedidos",
      url: "/dashboard/orders",
      icon: IconShoppingCart,
    },
    {
      title: "Produtos",
      url: "/dashboard/products",
      icon: IconBooks,
    },
    {
      title: "Usuários",
      url: "/dashboard/users",
      icon: IconUsers,
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
                  Book<span className="text-(--primary)">Store</span>
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
