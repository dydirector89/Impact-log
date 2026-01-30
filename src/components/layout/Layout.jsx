import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, Menu, Leaf } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Sidebar from './Sidebar';
import NotificationPanel from '../common/NotificationPanel';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export default function Layout() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { getUnreadCount } = useData();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);

    const unreadCount = getUnreadCount();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [navigate]);

    return (
        <TooltipProvider>
            <div className="flex flex-col min-h-screen bg-background">
                {/* Header - Full width at top */}
                <header className="sticky top-0 z-50 glass border-b border-border">
                    <div className="flex h-12 items-center justify-between px-4 sm:px-6">
                        {/* Left side */}
                        <div className="flex items-center gap-3">
                            {/* Sidebar toggle */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                    // On mobile, open drawer; on desktop, toggle collapse
                                    if (window.innerWidth < 768) {
                                        setMobileOpen(true);
                                    } else {
                                        setSidebarCollapsed(!sidebarCollapsed);
                                    }
                                }}
                            >
                                <Menu className="h-4 w-4" />
                            </Button>

                            {/* ImpactLog Logo */}
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                                    <Leaf className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-base font-semibold text-foreground">ImpactLog</span>
                            </div>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-2">
                            {/* Notifications */}
                            <DropdownMenu open={notificationOpen} onOpenChange={setNotificationOpen} modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative">
                                        <Bell className="h-5 w-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-80">
                                    <NotificationPanel onClose={() => setNotificationOpen(false)} />
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Profile */}
                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex items-center gap-2 px-2">
                                        <div className="hidden sm:block text-right">
                                            <p className="text-sm font-medium">{user?.full_name}</p>
                                            <p className="text-xs text-primary capitalize">{user?.role}</p>
                                        </div>
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="gradient-primary text-white font-medium">
                                                {user?.full_name?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" sideOffset={8} className="w-56 z-[100]">
                                    <DropdownMenuLabel>
                                        <div>
                                            <p className="font-medium">{user?.full_name}</p>
                                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-md font-medium capitalize">
                                                {user?.role}
                                            </span>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                                        <User className="mr-2 h-4 w-4" />
                                        Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* Content area with sidebar */}
                <div className="flex flex-1">
                    {/* Sidebar - Desktop (below header) */}
                    <aside
                        className={cn(
                            "hidden md:flex md:flex-col md:fixed md:top-12 md:bottom-0 z-40 transition-all duration-300 ease-in-out border-r border-border bg-card",
                            sidebarCollapsed ? "md:w-16" : "md:w-56"
                        )}
                    >
                        <Sidebar collapsed={sidebarCollapsed} />
                    </aside>

                    {/* Mobile Sidebar Overlay */}
                    {mobileOpen && (
                        <div
                            className="fixed inset-0 z-40 bg-black/50 md:hidden"
                            onClick={() => setMobileOpen(false)}
                        />
                    )}

                    {/* Mobile Sidebar */}
                    <aside className={cn(
                        "fixed top-0 bottom-0 left-0 z-50 w-64 transform transition-transform duration-300 md:hidden bg-card",
                        mobileOpen ? "translate-x-0" : "-translate-x-full"
                    )}>
                        <Sidebar onClose={() => setMobileOpen(false)} />
                    </aside>

                    {/* Main Content Area */}
                    <div className={cn(
                        "flex-1 transition-all duration-300 ease-in-out",
                        sidebarCollapsed ? "md:ml-16" : "md:ml-56"
                    )}>
                        <main className="min-h-[calc(100vh-3rem)] p-4 sm:p-6 overflow-x-hidden bg-gradient-to-br from-emerald-50/50 via-cyan-50/30 to-blue-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
                            <Outlet />
                        </main>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
