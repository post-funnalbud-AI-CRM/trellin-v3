import React from 'react';
import { User } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';

interface NavbarProps {
  activeView: string;
  navigationItems: Array<{
    id: string;
    title: string;
    description: string;
  }>;
}

const Navbar: React.FC<NavbarProps> = ({ activeView, navigationItems }) => {
  const { user } = useAuth();
  const activeItem = navigationItems.find(item => item.id === activeView);

      return (
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-3 sm:px-6 bg-background">
        <SidebarTrigger className="-ml-1 hover:bg-accent hover:text-accent-foreground" />

        <div className="flex flex-1 items-center justify-between min-w-0">
          {/* Left side - responsive title + description */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl md:text-2xl lg:text-[30px] uppercase tracking-wide text-foreground/70 font-normal truncate">
                {activeItem?.title || 'Dashboard'}
              </span>
              <span className="text-xs text-muted-foreground/60 hidden sm:block">
                {activeItem?.description || 'Welcome to your dashboard'}
              </span>
            </div>
          </div>

          {/* Right side - user */}
          <div className="flex items-center gap-2 sm:gap-3 text-sm text-muted-foreground flex-shrink-0">
            <User className="h-4 w-4" />
            <span className="truncate max-w-[120px] sm:max-w-[200px] hidden sm:inline">{user?.email}</span>
          </div>
        </div>
      </header>
  );
};

export default Navbar;
