import { Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '../../context/DataContext';
import { cn } from '@/lib/utils';

export default function NotificationPanel({ onClose }) {
    const { getUserNotifications, markNotificationRead, markAllNotificationsRead } = useData();

    const notifications = getUserNotifications();
    const unreadNotifications = notifications.filter(n => !n.is_read);

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        if (diff < 1000 * 60) return 'Just now';
        if (diff < 1000 * 60 * 60) return `${Math.floor(diff / (1000 * 60))}m ago`;
        if (diff < 1000 * 60 * 60 * 24) return `${Math.floor(diff / (1000 * 60 * 60))}h ago`;
        return `${Math.floor(diff / (1000 * 60 * 60 * 24))}d ago`;
    };

    return (
        <div className="max-h-[400px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-3 border-b flex items-center justify-between">
                <h3 className="font-semibold">Notifications</h3>
                {unreadNotifications.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7"
                        onClick={markAllNotificationsRead}
                    >
                        <CheckCheck className="h-3.5 w-3.5 mr-1" />
                        Mark all read
                    </Button>
                )}
            </div>

            {/* Notification List */}
            {notifications.length === 0 ? (
                <div className="p-8 text-center">
                    <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
            ) : (
                <div className="overflow-y-auto max-h-[320px]">
                    {notifications.slice(0, 10).map((notification, index) => (
                        <div
                            key={notification.id}
                            className={cn(
                                "p-3 border-b last:border-b-0 transition-colors hover:bg-muted/50",
                                !notification.is_read && "bg-primary/5"
                            )}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className={cn(
                                        "text-sm",
                                        notification.is_read ? "font-normal" : "font-semibold"
                                    )}>
                                        {notification.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                                        {formatTime(notification.created_at)}
                                    </p>
                                </div>
                                {!notification.is_read && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 shrink-0"
                                        onClick={() => markNotificationRead(notification.id)}
                                    >
                                        <Check className="h-3.5 w-3.5 text-primary" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
