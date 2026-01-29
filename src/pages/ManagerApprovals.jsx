import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ACTIVITY_TYPES } from '../utils/calculations';
import StatusChip from '../components/common/StatusChip';
import ApprovalDialog from '../components/forms/ApprovalDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, ArrowLeft, Camera } from 'lucide-react';

export default function ManagerApprovals() {
    const navigate = useNavigate();
    const { getTeamActivities, approveActivity, rejectActivity } = useData();

    const [selectedActivity, setSelectedActivity] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');

    const allActivities = getTeamActivities();

    const filteredActivities = allActivities.filter(activity => {
        const matchesSearch =
            activity.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            activity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ACTIVITY_TYPES[activity.activity_type]?.label.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleApprove = (activityId, comment) => {
        approveActivity(activityId, comment);
    };

    const handleReject = (activityId, comment) => {
        rejectActivity(activityId, comment);
    };

    const statusCounts = {
        pending: allActivities.filter(a => a.status === 'pending').length,
        approved: allActivities.filter(a => a.status === 'approved').length,
        rejected: allActivities.filter(a => a.status === 'rejected').length,
    };

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

                <h1 className="text-3xl font-bold tracking-tight">Activity Approvals</h1>
                <p className="text-muted-foreground mt-1">
                    Review and approve team sustainability activities
                </p>
            </div>

            {/* Filters */}
            <Card className="glass-card">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, activity, or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex gap-1 p-1 bg-muted rounded-lg">
                            {[
                                { value: 'pending', label: `Pending (${statusCounts.pending})` },
                                { value: 'approved', label: 'Approved' },
                                { value: 'rejected', label: 'Rejected' },
                                { value: 'all', label: 'All' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setStatusFilter(option.value)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${statusFilter === option.value
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Activities List */}
            <Card className="glass-card">
                <CardContent className="p-0">
                    {filteredActivities.length === 0 ? (
                        <div className="text-center py-12">
                            <h3 className="text-lg font-medium text-muted-foreground mb-1">
                                No activities found
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {statusFilter === 'pending'
                                    ? 'All caught up! No pending approvals.'
                                    : 'Try adjusting your search or filters.'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {filteredActivities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={() => setSelectedActivity(activity)}
                                >
                                    <Avatar className="h-11 w-11">
                                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                                            {activity.user_name?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium">{activity.user_name}</span>
                                            <Badge
                                                variant="secondary"
                                                className="text-xs"
                                                style={{
                                                    backgroundColor: `${ACTIVITY_TYPES[activity.activity_type]?.color}20`,
                                                    color: ACTIVITY_TYPES[activity.activity_type]?.color,
                                                }}
                                            >
                                                {ACTIVITY_TYPES[activity.activity_type]?.label}
                                            </Badge>
                                            {activity.photo_url && (
                                                <Badge variant="outline" className="text-xs gap-1">
                                                    <Camera className="w-3 h-3" />
                                                    Photo
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate mb-1">
                                            {activity.description}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(activity.activity_date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                            {' • '}
                                            {activity.quantity || activity.hours} {ACTIVITY_TYPES[activity.activity_type]?.unit}
                                            {' • '}
                                            {(activity.co2_saved || 0).toFixed(2)} kg CO₂
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <StatusChip status={activity.status} />
                                        {activity.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    className="bg-emerald-500 hover:bg-emerald-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleApprove(activity.id, '');
                                                    }}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedActivity(activity);
                                                    }}
                                                >
                                                    Review
                                                </Button>
                                            </div>
                                        )}
                                    </div>
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
