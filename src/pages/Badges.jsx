import { useData } from '../context/DataContext';
import BadgeDisplay from '../components/common/BadgeDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Target, Award } from 'lucide-react';

export default function Badges() {
    const { getAllBadges, getUserBadges } = useData();

    const allBadges = getAllBadges();
    const earnedBadges = getUserBadges();

    const earnedCount = allBadges.filter(b => b.earned).length;
    const totalPoints = earnedBadges.reduce((sum, b) => sum + b.points, 0);
    const nextBadge = allBadges.find(b => !b.earned);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Badges</h1>
                <p className="text-muted-foreground mt-1">
                    Collect badges by completing sustainability milestones
                </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="glass-card">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Badges Earned</p>
                                <p className="text-2xl font-bold text-primary">
                                    {earnedCount} / {allBadges.length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                <Award className="w-5 h-5 text-violet-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Points from Badges</p>
                                <p className="text-2xl font-bold text-violet-500">
                                    {totalPoints}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                <Target className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Next Badge</p>
                                <p className="text-lg font-semibold truncate">
                                    {nextBadge?.name || 'All earned!'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Earned Badges */}
            <Card className="glass-card">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-primary" />
                        Earned Badges
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {earnedCount === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">
                                No badges earned yet. Start logging activities to earn your first badge!
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {allBadges.filter(b => b.earned).map((badge) => (
                                <div
                                    key={badge.id}
                                    className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 hover:scale-105 transition-transform"
                                >
                                    <BadgeDisplay badge={badge} earned={true} size="large" />
                                    <span className="text-xs text-primary font-medium mt-2">
                                        +{badge.points} pts
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Locked Badges */}
            <Card className="glass-card">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="w-5 h-5 text-muted-foreground" />
                        Badges to Unlock
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {allBadges.filter(b => !b.earned).length === 0 ? (
                        <div className="text-center py-8">
                            <span className="text-3xl mb-2 block">🎉</span>
                            <p className="text-muted-foreground">
                                Congratulations! You've earned all badges!
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {allBadges.filter(b => !b.earned).map((badge) => (
                                <div
                                    key={badge.id}
                                    className="flex flex-col items-center p-3 rounded-xl bg-muted/50 border border-dashed border-border opacity-60 hover:opacity-80 transition-opacity"
                                >
                                    <BadgeDisplay badge={badge} earned={false} size="large" />
                                    <span className="text-xs text-muted-foreground mt-2">
                                        +{badge.points} pts
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
