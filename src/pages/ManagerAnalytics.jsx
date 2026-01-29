import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import {
    getMonthlyTrends,
    getStatsByActivityType,
    ACTIVITY_TYPES,
    formatCO2,
    calculateTotalCO2Saved,
    calculateTotalCSRHours,
} from '../utils/calculations';
import ActivityTrendChart from '../components/charts/ActivityTrendChart';
import CO2SavingsChart from '../components/charts/CO2SavingsChart';
import ImpactDistributionChart from '../components/charts/ImpactDistributionChart';
import MetricCard from '../components/common/MetricCard';
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
import { Leaf, Clock, CheckCircle, TrendingUp, ArrowLeft } from 'lucide-react';

export default function ManagerAnalytics() {
    const navigate = useNavigate();
    const { getTeamActivities, getLeaderboard } = useData();

    const teamActivities = getTeamActivities();
    const leaderboard = getLeaderboard();

    const trendData = useMemo(() => getMonthlyTrends(teamActivities, 6), [teamActivities]);
    const statsByType = useMemo(() => getStatsByActivityType(teamActivities), [teamActivities]);

    const stats = useMemo(() => {
        const approved = teamActivities.filter(a => a.status === 'approved');
        return {
            totalCO2Saved: calculateTotalCO2Saved(teamActivities),
            totalCSRHours: calculateTotalCSRHours(teamActivities),
            totalActivities: approved.length,
            avgPerEmployee: leaderboard.length > 0
                ? (approved.length / leaderboard.length).toFixed(1)
                : 0,
        };
    }, [teamActivities, leaderboard]);

    // Get top activity types
    const topActivityTypes = useMemo(() => {
        return Object.entries(statsByType)
            .filter(([, data]) => data.count > 0)
            .sort((a, b) => b[1].totalCO2 - a[1].totalCO2)
            .slice(0, 8);
    }, [statsByType]);

    // Get top contributors
    const topContributors = useMemo(() => {
        const contributorMap = {};
        teamActivities
            .filter(a => a.status === 'approved')
            .forEach(activity => {
                if (!contributorMap[activity.user_id]) {
                    contributorMap[activity.user_id] = {
                        user_name: activity.user_name,
                        activities: 0,
                        co2_saved: 0,
                    };
                }
                contributorMap[activity.user_id].activities++;
                contributorMap[activity.user_id].co2_saved += activity.co2_saved || 0;
            });

        return Object.values(contributorMap)
            .sort((a, b) => b.co2_saved - a.co2_saved)
            .slice(0, 5);
    }, [teamActivities]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <button
                    onClick={() => navigate('/manager')}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Dashboard
                </button>

                <h1 className="text-3xl font-bold tracking-tight">Team Analytics</h1>
                <p className="text-muted-foreground mt-1">
                    Deep dive into team sustainability performance
                </p>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total CO₂ Saved"
                    value={formatCO2(stats.totalCO2Saved)}
                    subtitle="All time"
                    icon={<Leaf className="w-5 h-5 text-white" />}
                    trend="up"
                    trendValue="+15%"
                    color="primary"
                />
                <MetricCard
                    title="CSR Hours"
                    value={`${stats.totalCSRHours}h`}
                    subtitle="Volunteer & education"
                    icon={<Clock className="w-5 h-5 text-white" />}
                    trend="up"
                    trendValue="+12%"
                    color="secondary"
                />
                <MetricCard
                    title="Approved Activities"
                    value={stats.totalActivities}
                    subtitle="Total completed"
                    icon={<CheckCircle className="w-5 h-5 text-white" />}
                    color="info"
                />
                <MetricCard
                    title="Avg per Employee"
                    value={stats.avgPerEmployee}
                    subtitle="Activities each"
                    icon={<TrendingUp className="w-5 h-5 text-white" />}
                    color="warning"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <ActivityTrendChart data={trendData} title="Team Activity Trends (6 Months)" />
                </div>
                <ImpactDistributionChart activities={teamActivities} title="Impact by Category" />
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <CO2SavingsChart data={trendData} title="Monthly CO₂ Savings" />

                {/* Top Contributors */}
                <Card className="glass-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Top Contributors by CO₂ Saved</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead className="text-center">Activities</TableHead>
                                    <TableHead className="text-right">CO₂ Saved</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topContributors.map((contributor, index) => (
                                    <TableRow key={contributor.user_name}>
                                        <TableCell>
                                            <div className="flex items-center gap-2.5">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback
                                                        className={`text-white text-xs font-medium ${index === 0 ? 'bg-amber-400' : 'bg-primary'
                                                            }`}
                                                    >
                                                        {contributor.user_name?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-medium">{contributor.user_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary">{contributor.activities}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="text-sm font-semibold text-primary">
                                                {contributor.co2_saved.toFixed(1)} kg
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Type Breakdown */}
            <Card className="glass-card">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Activity Type Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Activity Type</TableHead>
                                <TableHead className="text-center">Count</TableHead>
                                <TableHead className="text-right">Total Quantity</TableHead>
                                <TableHead className="text-right">CO₂ Saved</TableHead>
                                <TableHead className="text-right">Impact Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topActivityTypes.map(([type, data]) => {
                                const activityType = ACTIVITY_TYPES[type];
                                return (
                                    <TableRow key={type}>
                                        <TableCell>
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className="w-2.5 h-2.5 rounded-full"
                                                    style={{ backgroundColor: activityType?.color || 'var(--primary)' }}
                                                />
                                                <span className="text-sm font-medium">
                                                    {activityType?.label || type}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                                                {data.count}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-sm">
                                            {data.totalQuantity.toFixed(1)} {activityType?.unit}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="text-sm font-semibold text-emerald-500">
                                                {data.totalCO2.toFixed(1)} kg
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="text-sm font-semibold text-violet-500">
                                                {data.totalImpact.toFixed(0)} pts
                                            </span>
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
