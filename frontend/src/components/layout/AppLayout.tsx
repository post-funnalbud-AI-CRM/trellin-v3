import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Search, 
  Settings,
  LogOut,
  User,
  Shield,
  ChevronDown
} from 'lucide-react';
import Navbar from './Navbar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,

} from '@/components/ui/sidebar';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
}

const navigationItems = [
  {
    id: 'overview',
    title: 'Overview',
    icon: LayoutDashboard,
    description: 'System dashboard and metrics'
  },
  {
    id: 'questions',
    title: 'Q&A Dashboard',
    icon: MessageSquare,
    description: 'Question and answer analytics'
  },
  {
    id: 'specific',
    title: 'Customer Queries',
    icon: Search,
    description: 'Customer-specific query builder'
  },
  {
    id: 'employee',
    title: 'Employee Queries',
    icon: User,
    description: 'Employee performance queries'
  },
  {
    id: 'detailed',
    title: 'Customer Success',
    icon: Users,
    description: 'Detailed customer insights'
  },
  {
    id: 'topics',
    title: 'Customer Topics',
    icon: MessageSquare,
    description: 'AI-powered topic tracking'
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: BarChart3,
    description: 'Performance analytics'
  }
];

const AppLayout: React.FC<AppLayoutProps> = ({ children, activeView, onViewChange }) => {
  const { user, logout } = useAuth();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar variant="sidebar" className="bg-sidebar">
          <SidebarHeader className="border-b border-sidebar-border">
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground flex-shrink-0">
                <LayoutDashboard className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <h2 className="text-sm sm:text-lg font-semibold text-sidebar-foreground truncate">Trellin</h2>
                <p className="text-xs text-sidebar-foreground/70 hidden sm:block">Customer Success Platform</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-1 sm:px-2">
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/60 font-medium text-xs sm:text-sm">Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={activeView === item.id}
                        onClick={() => onViewChange(item.id)}
                        tooltip={item.description}
                        className="w-full justify-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-xs sm:text-sm"
                      >
                        <item.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="font-medium truncate">{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/60 font-medium text-xs sm:text-sm">Settings</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Application settings" className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-xs sm:text-sm">
                      <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="font-medium truncate">Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border px-1 sm:px-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <Avatar className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg">
                        <AvatarFallback className="rounded-lg bg-sidebar-accent text-sidebar-accent-foreground text-xs sm:text-sm">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-xs sm:text-sm leading-tight min-w-0">
                        <span className="truncate font-semibold text-sidebar-foreground">{user?.name}</span>
                        <span className="truncate text-xs text-sidebar-foreground/70 capitalize hidden sm:block">
                          {user?.role}
                        </span>
                      </div>
                      <ChevronDown className="ml-auto size-3 sm:size-4 text-sidebar-foreground/70" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    side="bottom"
                    align="end"
                    sideOffset={4}
                  >
                    <DropdownMenuItem className="gap-2">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Security</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="gap-2 text-destructive focus:text-destructive"
                      onClick={logout}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <Navbar activeView={activeView} navigationItems={navigationItems} />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
