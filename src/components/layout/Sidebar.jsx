import { useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Plus,
    Trophy,
    Users,
    Flag,
    ClipboardCheck,
    BarChart3,
    X,
    Leaf,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export default function Sidebar({ onClose, collapsed = false }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isManager } = useAuth();
    const { getPendingActivities } = useData();

    const pendingCount = getPendingActivities().length;

    const employeeMenuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/submit', label: 'Log Activity', icon: Plus },
        { path: '/leaderboard', label: 'Leaderboard', icon: Users },
        { path: '/challenges', label: 'Challenges', icon: Flag },
        { path: '/badges', label: 'My Badges', icon: Trophy },
    ];

    const managerMenuItems = [
        { path: '/manager', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/manager/approvals', label: 'Approvals', icon: ClipboardCheck, badge: pendingCount },
        { path: '/manager/team', label: 'Team Overview', icon: Users },
        { path: '/manager/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/manager/challenges', label: 'Manage Challenges', icon: Flag },
        { path: '/leaderboard', label: 'Leaderboard', icon: Users },
        { path: '/challenges', label: 'View Challenges', icon: Flag },
    ];

    const menuItems = isManager ? managerMenuItems : employeeMenuItems;

    const handleNavigation = (path) => {
        navigate(path);
        if (onClose) onClose();
    };

    return (
        <div className="h-full flex flex-col bg-card">
            {/* Mobile Header with close button */}
            {onClose && (
                <div className="h-12 px-3 flex items-center justify-between border-b border-border md:hidden">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                            <Leaf className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-base font-semibold text-foreground">ImpactLog</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Navigation */}
            <nav className={cn(
                "flex-1 py-3 space-y-0.5 overflow-y-auto",
                collapsed ? "px-2" : "px-3"
            )}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    const button = (
                        <button
                            key={item.path}
                            onClick={() => handleNavigation(item.path)}
                            className={cn(
                                "w-full flex items-center rounded-lg text-sm font-medium transition-all duration-200",
                                collapsed ? "justify-center items-center p-2.5" : "gap-3 px-3 py-2",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
                            {!collapsed && (
                                <>
                                    <span className="flex-1 text-left truncate">{item.label}</span>
                                    {item.badge > 0 && (
                                        <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                                            {item.badge}
                                        </Badge>
                                    )}
                                </>
                            )}
                            {collapsed && item.badge > 0 && (
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                            )}
                        </button>
                    );

                    // Wrap in tooltip when collapsed
                    if (collapsed) {
                        return (
                            <Tooltip key={item.path} delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <div className="relative">
                                        {button}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="flex items-center gap-2">
                                    {item.label}
                                    {item.badge > 0 && (
                                        <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                                            {item.badge}
                                        </Badge>
                                    )}
                                </TooltipContent>
                            </Tooltip>
                        );
                    }

                    return button;
                })}
            </nav>

            {/* User Info - clickable to go to profile */}
            <div className={cn("p-2 border-t border-border", collapsed && "px-2")}>
                {collapsed ? (
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => handleNavigation('/profile')}
                                className="w-full flex justify-center p-2 rounded-lg hover:bg-muted transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-medium text-sm">
                                    {user?.full_name?.charAt(0) || 'U'}
                                </div>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <div>
                                <p className="font-medium">{user?.full_name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    <button
                        onClick={() => handleNavigation('/profile')}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-medium text-sm shrink-0">
                            {user?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium truncate">{user?.full_name}</p>
                            <p className="text-xs text-muted-foreground capitalize truncate">
                                {user?.role}
                            </p>
                        </div>
                    </button>
                )}
            </div>
        </div>
    );
}
