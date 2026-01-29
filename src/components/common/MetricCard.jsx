import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function MetricCard({
    title,
    value,
    subtitle,
    icon,
    trend,
    trendValue,
    color = 'primary',
    onClick,
}) {
    const colorStyles = {
        primary: 'from-emerald-500 to-teal-500 shadow-emerald-500/30',
        secondary: 'from-teal-500 to-cyan-500 shadow-teal-500/30',
        warning: 'from-amber-500 to-orange-500 shadow-amber-500/30',
        info: 'from-blue-500 to-indigo-500 shadow-blue-500/30',
        purple: 'from-violet-500 to-purple-500 shadow-violet-500/30',
        error: 'from-red-500 to-rose-500 shadow-red-500/30',
    };

    const gradientClass = colorStyles[color] || colorStyles.primary;

    const getTrendIcon = () => {
        if (trend === 'up') return <TrendingUp className="h-4 w-4" />;
        if (trend === 'down') return <TrendingDown className="h-4 w-4" />;
        return <Minus className="h-4 w-4" />;
    };

    const getTrendColor = () => {
        if (trend === 'up') return 'text-emerald-600';
        if (trend === 'down') return 'text-red-600';
        return 'text-muted-foreground';
    };

    return (
        <Card
            onClick={onClick}
            className={cn(
                "h-full transition-all duration-300",
                onClick && "cursor-pointer hover:-translate-y-1 hover:shadow-lg"
            )}
        >
            <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-start justify-between flex-1">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                            {title}
                        </p>
                        <h3 className={cn(
                            "text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                            gradientClass.split(' ')[0],
                            gradientClass.split(' ')[1]
                        )}>
                            {value}
                        </h3>
                        <div className="flex items-center gap-2 mt-2 min-h-[20px]">
                            {trend && (
                                <div className={cn("flex items-center gap-1", getTrendColor())}>
                                    {getTrendIcon()}
                                    <span className="text-xs font-semibold">{trendValue}</span>
                                </div>
                            )}
                            {subtitle && (
                                <span className="text-xs text-muted-foreground">{subtitle}</span>
                            )}
                        </div>
                    </div>

                    {icon && (
                        <div className={cn(
                            "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                            gradientClass
                        )}>
                            {icon}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
