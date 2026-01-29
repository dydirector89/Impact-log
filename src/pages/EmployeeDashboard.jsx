import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Cloud, Clock, TrendingUp, Trophy, Download, FileText, TableIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { calculateTotalCSRHours, calculateTotalCO2Saved, getMonthlyTrends, ACTIVITY_TYPES, formatCO2 } from '../utils/calculations';
import { generateActivityReport, generateCSV } from '../utils/pdfGenerator';
import MetricCard from '../components/common/MetricCard';
import StatusChip from '../components/common/StatusChip';
import BadgeDisplay from '../components/common/BadgeDisplay';
import ActivityDetailDialog from '../components/common/ActivityDetailDialog';
import ActivityTrendChart from '../components/charts/ActivityTrendChart';
import ImpactDistributionChart from '../components/charts/ImpactDistributionChart';
import ForecastWidget from '../components/charts/ForecastWidget';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function EmployeeDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { getUserActivities, getUserBadges, getAllBadges } = useData();

    const [selectedActivity, setSelectedActivity] = useState(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    const activities = getUserActivities();
    const badges = getUserBadges();
    const allBadges = getAllBadges();

    const stats = useMemo(() => {
        const approved = activities.filter(a => a.status === 'approved');
        return {
            totalCSRHours: calculateTotalCSRHours(activities),
            totalCO2Saved: calculateTotalCO2Saved(activities),
            totalActivities: approved.length,
            pendingActivities: activities.filter(a => a.status === 'pending').length,
            badgesEarned: badges.length,
        };
    }, [activities, badges]);

    const trendData = useMemo(() => getMonthlyTrends(activities, 6), [activities]);

    const handleDownloadPDF = () => {
        generateActivityReport({
            activities,
            user,
            reportType: 'personal',
            stats,
        });
    };

    const handleDownloadCSV = () => {
        generateCSV(activities);
    };

    return (
        <div className="space-y-6 animate-in">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">
                        Welcome back, {user?.full_name?.split(' ')[0]}!
                    </h1>
                    <p className="text-muted-foreground">
                        Track your sustainability impact and earn badges
                    </p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Download Report
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleDownloadPDF}>
                            <FileText className="h-4 w-4 mr-2" />
                            PDF Report
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDownloadCSV}>
                            <TableIcon className="h-4 w-4 mr-2" />
                            CSV Export
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="CO₂ Saved"
                    value={formatCO2(stats.totalCO2Saved)}
                    subtitle="Total emissions reduced"
                    icon={<Cloud className="h-5 w-5 text-white" />}
                    trend="up"
                    trendValue="+12%"
                    color="primary"
                />
                <MetricCard
                    title="CSR Hours"
                    value={`${stats.totalCSRHours}h`}
                    subtitle="Volunteer & education"
                    icon={<Clock className="h-5 w-5 text-white" />}
                    trend="up"
                    trendValue="+8%"
                    color="secondary"
                />
                <MetricCard
                    title="Activities"
                    value={stats.totalActivities}
                    subtitle={`${stats.pendingActivities} pending`}
                    icon={<TrendingUp className="h-5 w-5 text-white" />}
                    color="info"
                />
                <MetricCard
                    title="Badges Earned"
                    value={stats.badgesEarned}
                    subtitle={`of ${allBadges.length} total`}
                    icon={<Trophy className="h-5 w-5 text-white" />}
                    color="warning"
                    onClick={() => navigate('/badges')}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <ActivityTrendChart data={trendData} title="Your Activity Trends" />
                </div>
                <ForecastWidget
                    currentValue={stats.totalCO2Saved}
                    targetValue={500}
                    label="Q1 CO₂ Reduction Target"
                    unit="kg"
                    deadline="2026-03-31"
                    editable={false}
                />
            </div>

            {/* Impact Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ImpactDistributionChart activities={activities} title="Your Impact" />

                {/* Badges Section */}
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Your Badges</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/badges')}>
                                View all →
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-6">
                            {allBadges.slice(0, 6).map((badge) => (
                                <BadgeDisplay
                                    key={badge.id}
                                    badge={badge}
                                    earned={badge.earned}
                                    size="medium"
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activities Table */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Recent Activities</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {activities.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground mb-4">No activities yet</p>
                                <Button onClick={() => navigate('/submit')}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Log Your First Activity
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="hidden md:table-cell">Description</TableHead>
                                        <TableHead className="text-right">CO₂</TableHead>
                                        <TableHead className="text-right hidden sm:table-cell">Points</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activities.slice(0, 10).map((activity) => (
                                        <TableRow
                                            key={activity.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => {
                                                setSelectedActivity(activity);
                                                setDetailDialogOpen(true);
                                            }}
                                        >
                                            <TableCell>
                                                {new Date(activity.activity_date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    style={{
                                                        backgroundColor: `${ACTIVITY_TYPES[activity.activity_type]?.color}20`,
                                                        color: ACTIVITY_TYPES[activity.activity_type]?.color,
                                                    }}
                                                >
                                                    {ACTIVITY_TYPES[activity.activity_type]?.label || activity.activity_type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <span className="text-sm text-muted-foreground">
                                                    {activity.description}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-primary">
                                                {(activity.co2_saved || 0).toFixed(1)}
                                            </TableCell>
                                            <TableCell className="text-right hidden sm:table-cell font-medium">
                                                {(activity.impact_score || 0).toFixed(0)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <StatusChip status={activity.status} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Activity Detail Dialog */}
            <ActivityDetailDialog
                open={detailDialogOpen}
                onClose={() => setDetailDialogOpen(false)}
                activity={selectedActivity}
            />
        </div>
    );
}
