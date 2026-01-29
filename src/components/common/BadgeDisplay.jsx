import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export default function BadgeDisplay({ badge, size = 'medium', showName = true, earned = true }) {
    const sizeMap = {
        small: { box: 'w-10 h-10', emoji: 'text-lg', text: 'text-[10px]' },
        medium: { box: 'w-14 h-14', emoji: 'text-2xl', text: 'text-xs' },
        large: { box: 'w-[72px] h-[72px]', emoji: 'text-3xl', text: 'text-sm' },
    };

    const sizes = sizeMap[size] || sizeMap.medium;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        className={cn(
                            "flex flex-col items-center gap-1 cursor-pointer transition-all duration-300 hover:scale-110",
                            !earned && "grayscale opacity-40"
                        )}
                    >
                        <div
                            className={cn(
                                sizes.box,
                                "rounded-full flex items-center justify-center border-2 transition-all",
                                earned
                                    ? "bg-gradient-to-br from-amber-100 to-amber-200 border-amber-400 shadow-lg shadow-amber-500/30"
                                    : "bg-slate-100 border-slate-200"
                            )}
                        >
                            <span className={sizes.emoji}>{badge.icon}</span>
                        </div>
                        {showName && (
                            <span className={cn(
                                sizes.text,
                                "font-medium text-center leading-tight max-w-[76px]"
                            )}>
                                {badge.name}
                            </span>
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="space-y-1">
                        <p className="font-semibold">{badge.name}</p>
                        <p className="text-xs opacity-90">{badge.description}</p>
                        <p className="text-xs text-primary">+{badge.points} points</p>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
