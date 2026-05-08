import { 
  LayoutDashboard, 
  Vote, 
  Users, 
  BarChart3, 
  PlusCircle, 
  UserCircle, 
  LogOut,
  Settings
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const { user, logout } = useAuthStore()
  const location = useLocation()

  const isAdmin = user?.role === 'admin' || user?.role === 'superuser'

  const userMenuItems = [
    { title: "Дашборд", path: "/dashboard", icon: LayoutDashboard },
    { title: "Профиль", path: "/profile", icon: UserCircle },
  ]

  const adminMenuItems = [
    { title: "Обзор", path: "/admin", icon: LayoutDashboard },
    { title: "Опросы", path: "/admin/polls", icon: Vote },
    { title: "Пользователи", path: "/admin/users", icon: Users },
    { title: "Статистика", path: "/admin/stats", icon: BarChart3 },
    { title: "Создать опрос", path: "/admin/polls/create", icon: PlusCircle },
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-border">
        <Link to="/" className="flex items-center gap-3 group/logo w-full overflow-hidden">
          <div className="w-9 h-9 shrink-0 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold group-hover/logo:scale-105 transition-transform shadow-sm">
            E
          </div>
          <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-base tracking-tight text-foreground">
              EVote
            </span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider leading-none">
              Система голосования
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Меню пользователя
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userMenuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                    tooltip={item.title}
                  >
                    <Link to={item.path}>
                      <item.icon className="w-5 h-5" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Администрирование
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.path}
                      tooltip={item.title}
                    >
                      <Link to={item.path}>
                        <item.icon className="w-5 h-5" />
                        <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </Link>                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              variant="default"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={logout}
            >
              <LogOut className="w-5 h-5" />
              <span className="group-data-[collapsible=icon]:hidden">Выйти</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
