import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { calculateTotalCO2Saved, getMonthlyTrends, ACTIVITY_TYPES, formatCO2 } from '../utils/calculations';
import { generateActivityReport, generateCSV } from '../utils/pdfGenerator';
import MetricCard from '../components/common/MetricCard';
import StatusChip from '../components/common/StatusChip';
import ActivityTrendChart from '../components/charts/ActivityTrendChart';
import CO2SavingsChart from '../components/charts/CO2SavingsChart';
import ForecastWidget from '../components/charts/ForecastWidget';
import ApprovalDialog from '../components/forms/ApprovalDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Clock,
    CheckCircle,
    TrendingUp,
    Users,
    Download,
    FileText,
    Table as TableIcon,
    ArrowRight,
    Flame,
} from 'lucide-react';

export default function ManagerDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        getPendingActivities,
        getTeamActivities,
        getLeaderboard,
        approveActivity,
        rejectActivity,
    } = useData();

    const [selectedActivity, setSelectedActivity] = useState(null);

    const pendingActivities = getPendingActivities();
    const teamActivities = getTeamActivities();
    const leaderboard = getLeaderboard();

    const stats = useMemo(() => {
        const approved = teamActivities.filter(a => a.status === 'approved');
        const pending = teamActivities.filter(a => a.status === 'pending');

        return {
            totalCO2Saved: calculateTotalCO2Saved(teamActivities),
            pendingCount: pending.length,
            approvedCount: approved.length,
            teamMembers: leaderboard.length,
        };
    }, [teamActivities, leaderboard]);

    const trendData = useMemo(() => getMonthlyTrends(teamActivities, 6), [teamActivities]);

    const topPerformers = useMemo(() => leaderboard.slice(0, 5), [leaderboard]);

    const handleApprove = (activityId, comment) => {
        approveActivity(activityId, comment);
    };

    const handleReject = (activityId, comment) => {
        rejectActivity(activityId, comment);
    };

    const handleDownloadPDF = () => {
        generateActivityReport({
            activities: teamActivities,
            user,
            reportType: 'team',
            stats,
        });
    };

    const handleDownloadCSV = () => {
        generateCSV(teamActivities);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Team Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage approvals and track team performance
                    </p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Download className="w-4 h-4" />
                            Download Report
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleDownloadPDF} className="gap-2">
                            <FileText className="w-4 h-4" />
                            PDF Report
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDownloadCSV} className="gap-2">
                            <TableIcon className="w-4 h-4" />
                            CSV Export
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Pending Approvals"
                    value={stats.pendingCount}
                    subtitle="Awaiting review"
                    icon={<Clock className="w-5 h-5 text-white" />}
                    color="warning"
                    onClick={() => navigate('/manager/approvals')}
                />
                <MetricCard
                    title="Approved Activities"
                    value={stats.approvedCount}
                    subtitle="This period"
                    icon={<CheckCircle className="w-5 h-5 text-white" />}
                    color="primary"
                />
                <MetricCard
                    title="Team CO₂ Saved"
                    value={formatCO2(stats.totalCO2Saved)}
                    subtitle="Total impact"
                    icon={<TrendingUp className="w-5 h-5 text-white" />}
                    trend="up"
                    trendValue="+15%"
                    color="secondary"
                />
                <MetricCard
                    title="Team Members"
                    value={stats.teamMembers}
                    subtitle="Active participants"
                    icon={<Users className="w-5 h-5 text-white" />}
                    color="info"
                    onClick={() => navigate('/manager/team')}
                />
            </div>

            {/* Charts and Widgets Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <ActivityTrendChart data={trendData} title="Team Activity Trends" />
                </div>
                <ForecastWidget
                    currentValue={stats.totalCO2Saved}
                    targetValue={500}
                    label="Q1 CO₂ Reduction Target"
                    unit="kg"
                    deadline="2026-03-31"
                    editable={true}
                />
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <CO2SavingsChart data={trendData} title="Team CO₂ Savings" />

                {/* Top Performers */}
                <Card className="glass-card">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Top Performers</CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-muted-foreground"
                                onClick={() => navigate('/leaderboard')}
                            >
                                View all
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {topPerformers.map((member, index) => (
                            <div key={member.id} className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback
                                        className={`text-white font-bold ${index === 0
                                            ? 'bg-amber-400'
                                            : index === 1
                                                ? 'bg-slate-400'
                                                : index === 2
                                                    ? 'bg-orange-500'
                                                    : 'bg-primary'
                                            }`}
                                    >
                                        {index + 1}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{member.full_name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{member.department}</p>
                                </div>
                                <Badge variant="secondary" className="gap-1">
                                    <Flame className="w-3 h-3 text-amber-500" />
                                    {member.total_points} pts
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Pending Approvals Queue */}
            <Card className="glass-card">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                            Pending Approvals ({pendingActivities.length})
                        </CardTitle>
                        <Button onClick={() => navigate('/manager/approvals')}>View All</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {pendingActivities.length === 0 ? (
                        <div className="text-center py-8">
                            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                            <p className="text-muted-foreground">
                                All caught up! No pending approvals.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {pendingActivities.slice(0, 5).map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                                    onClick={() => setSelectedActivity(activity)}
                                >
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                                            {activity.user_name?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-sm font-medium">{activity.user_name}</span>
                                            <Badge
                                                variant="secondary"
                                                className="text-[10px] px-1.5"
                                                style={{
                                                    backgroundColor: `${ACTIVITY_TYPES[activity.activity_type]?.color}20`,
                                                    color: ACTIVITY_TYPES[activity.activity_type]?.color,
                                                }}
                                            >
                                                {ACTIVITY_TYPES[activity.activity_type]?.label}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {activity.description}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-medium text-primary">
                                            {(activity.co2_saved || 0).toFixed(2)} kg CO₂
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(activity.activity_date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <StatusChip status="pending" />
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Approval Dialog */}
            <ApprovalDialog
                open={!!selectedActivity}
                onClose={() => setSelectedActivity(null)}
                activity={selectedActivity}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </div>
    );
}
