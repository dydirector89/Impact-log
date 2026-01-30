import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { EARNED_BADGES } from '../utils/seedData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Trophy, Flame, Crown, Medal } from 'lucide-react';

export default function Leaderboard() {
    const { user } = useAuth();
    const { getLeaderboard } = useData();

    const [period, setPeriod] = useState('all');

    const leaderboard = useMemo(() => getLeaderboard(), [getLeaderboard]);

    // Podium (top 3)
    const podium = leaderboard.slice(0, 3);

    const getPodiumStyles = (index) => {
        const styles = {
            0: {
                gradient: 'from-amber-400 to-yellow-500',
                size: 'w-20 h-20',
                textSize: 'text-3xl',
                order: 'order-2',
                ringColor: 'ring-amber-400',
            },
            1: {
                gradient: 'from-slate-400 to-slate-500',
                size: 'w-16 h-16',
                textSize: 'text-2xl',
                order: 'order-1',
                ringColor: 'ring-slate-400',
            },
            2: {
                gradient: 'from-orange-500 to-amber-600',
                size: 'w-16 h-16',
                textSize: 'text-2xl',
                order: 'order-3',
                ringColor: 'ring-orange-500',
            },
        };
        return styles[index];
    };

    const getRankColors = (index) => {
        if (index === 0) return 'bg-amber-400 text-white';
        if (index === 1) return 'bg-slate-400 text-white';
        if (index === 2) return 'bg-orange-500 text-white';
        return 'bg-muted text-muted-foreground';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
                <p className="text-muted-foreground mt-1">
                    See who's making the biggest impact
                </p>
            </div>

            {/* Period Toggle */}
            <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
                {[
                    { value: 'week', label: 'This Week' },
                    { value: 'month', label: 'This Month' },
                    { value: 'all', label: 'All Time' },
                ].map((option) => (
                    <button
                        key={option.value}
                        onClick={() => setPeriod(option.value)}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${period === option.value
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {/* Podium */}
            <Card className="glass-card overflow-visible">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex justify-center items-end gap-3 sm:gap-6 pt-8 pb-4">
                        {podium.map((member, index) => {
                            const styles = getPodiumStyles(index);
                            return (
                                <div
                                    key={member.id}
                                    className={`flex flex-col items-center ${styles.order}`}
                                >
                                    {/* Crown for #1 */}
                                    {index === 0 && (
                                        <Crown className="w-8 h-8 text-amber-400 -mb-2" fill="currentColor" />
                                    )}

                                    {/* Avatar */}
                                    <div className={`${styles.size} rounded-full bg-gradient-to-br ${styles.gradient} flex items-center justify-center ring-4 ${styles.ringColor} ring-offset-2 ring-offset-background shadow-lg mb-3`}>
                                        <span className={`${styles.textSize} font-bold text-white`}>
                                            {member.full_name?.charAt(0)}
                                        </span>
                                    </div>

                                    {/* Name */}
                                    <p className={`text-sm font-semibold text-center ${user?.id === member.id ? 'text-primary' : ''}`}>
                                        {member.full_name}
                                        {user?.id === member.id && ' (You)'}
                                    </p>

                                    {/* Department */}
                                    <p className="text-xs text-muted-foreground">{member.department}</p>

                                    {/* Points */}
                                    <Badge variant="secondary" className="mt-2 gap-1">
                                        <Flame className="w-3 h-3 text-amber-500" />
                                        {member.total_points} pts
                                    </Badge>

                                    {/* Rank badge */}
                                    <div className={`mt-3 w-12 h-8 rounded-t-lg bg-gradient-to-br ${styles.gradient} flex items-center justify-center`}>
                                        <span className="font-bold text-white">#{index + 1}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Full Leaderboard Table */}
            <Card className="glass-card">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Medal className="w-5 h-5 text-primary" />
                        Full Rankings
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">Rank</TableHead>
                                <TableHead>Employee</TableHead>
                                <TableHead className="hidden sm:table-cell">Department</TableHead>
                                <TableHead className="text-center">Badges</TableHead>
                                <TableHead className="text-right">Points</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leaderboard.map((member, index) => {
                                const isCurrentUser = user?.id === member.id;
                                const badgeCount = EARNED_BADGES.filter(eb => eb.user_id === member.id).length;

                                return (
                                    <TableRow
                                        key={member.id}
                                        className={isCurrentUser ? 'bg-primary/5' : ''}
                                    >
                                        <TableCell>
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${getRankColors(index)}`}>
                                                {index + 1}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-sm font-medium">
                                                        {member.full_name?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium flex items-center gap-2">
                                                        {member.full_name}
                                                        {isCurrentUser && (
                                                            <Badge variant="default" className="text-[10px] px-1.5 py-0">You</Badge>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <span className="text-sm text-muted-foreground">{member.department}</span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Trophy className="w-4 h-4 text-amber-500" />
                                                <span className="text-sm font-medium">{badgeCount}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="text-sm font-bold text-primary">{member.total_points}</span>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
