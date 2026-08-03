import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext.jsx';
import NavigationMenu from './NavigationMenu';
import NotificationCenter from './NotificationCenter.jsx';
import IntegratedAiChat from '@/components/integrated-ai-chat.jsx';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Menu, LogOut, Settings as SettingsIcon, Sun, Moon, Shield, MessageCircle, Building2 } from 'lucide-react';
import pb from '@/lib/supabaseClient';

export default function DashboardLayout() {
  const {
    currentUser,
    logout,
    organizations,
    activeOrganizationId,
    activeOrganization,
    selectOrganization,
  } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const avatarUrl = currentUser?.avatar 
    ? pb.files.getUrl(currentUser, currentUser.avatar) 
    : undefined;

  const isAdmin = ['super_admin', 'pastor', 'worship_leader', 'church_admin'].includes(currentUser?.role);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2 transition-transform hover:scale-105">
              <img src="/worshipstage-icon.png" alt="WorshipStage Pro" className="w-9 h-9 rounded-xl object-cover shadow-lg shadow-primary/20" />
              <span className="font-bold text-lg tracking-tight hidden sm:block">
                WORSHIP<span className="text-primary">STAGE</span> PRO
              </span>
            </Link>

            <div className="hidden lg:block ml-8">
              <NavigationMenu />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser?.role === 'super_admin' && (
              <Select value={activeOrganizationId || ''} onValueChange={selectOrganization}>
                <SelectTrigger className="hidden md:flex w-[210px] bg-background" aria-label="Iglesia activa">
                  <Building2 className="w-4 h-4 mr-2 text-primary shrink-0" />
                  <SelectValue placeholder="Selecciona una iglesia" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((organization) => (
                    <SelectItem key={organization.id} value={organization.id}>
                      {organization.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={toggleTheme}>
              {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            <NotificationCenter />

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary relative" title="AI Chat">
                  <MessageCircle className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[450px] p-0 border-l-border">
                <IntegratedAiChat />
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-xl ml-1">
                  <Avatar className="h-10 w-10 rounded-xl border border-border">
                    <AvatarImage src={avatarUrl} alt={currentUser?.name} />
                    <AvatarFallback className="rounded-xl bg-muted text-muted-foreground font-semibold">
                      {getInitials(currentUser?.name || currentUser?.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser?.name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">
                      {currentUser?.role?.replace('_', ' ') || 'Member'}
                    </p>
                    {activeOrganization && (
                      <p className="text-xs leading-none text-primary pt-1">{activeOrganization.name}</p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/settings">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/role-management">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Role Management</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden ml-1">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 border-r-border">
                <SheetHeader className="p-6 border-b border-border text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <img src="/worshipstage-icon.png" alt="WorshipStage Pro" className="w-9 h-9 rounded-xl object-cover" />
                    <span>WORSHIPSTAGE</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="p-4">
                  {currentUser?.role === 'super_admin' && (
                    <Select value={activeOrganizationId || ''} onValueChange={selectOrganization}>
                      <SelectTrigger className="w-full mb-4 bg-background" aria-label="Iglesia activa">
                        <Building2 className="w-4 h-4 mr-2 text-primary" />
                        <SelectValue placeholder="Selecciona una iglesia" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations.map((organization) => (
                          <SelectItem key={organization.id} value={organization.id}>
                            {organization.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <NavigationMenu isMobile onItemClick={() => setMobileMenuOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full bg-background">
        <Outlet />
      </main>
    </div>
  );
}
