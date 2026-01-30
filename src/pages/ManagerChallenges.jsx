import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { ACTIVITY_TYPES } from '../utils/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Flag,
    Plus,
    Pencil,
    Trash2,
    MoreHorizontal,
    Users,
    Calendar,
    Trophy,
    AlertTriangle,
    Eye,
    Target,
    TrendingUp,
    CheckCircle,
    Clock,
    Activity,
} from 'lucide-react';
import ChallengeDialog from '../components/forms/ChallengeDialog';

export default function ManagerChallenges() {
    const {
        challenges,
        activities,
        createChallenge,
        updateChallenge,
        deleteChallenge,
        getChallengeParticipants,
        getChallengeProgress,
    } = useData();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedChallenge, setSelectedChallenge] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [challengeToDelete, setChallengeToDelete] = useState(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [viewingChallenge, setViewingChallenge] = useState(null);

    // Calculate stats
    const stats = useMemo(() => {
        const activeChallenges = challenges.filter(c => c.is_active);
        const totalParticipants = challenges.reduce((sum, c) => sum + (c.participants || 0), 0);
        const totalPoints = challenges.reduce((sum, c) => sum + (c.points_reward || 0), 0);

        // Find top challenge by participants
        const topChallenge = [...challenges].sort((a, b) =>
            (b.participants || 0) - (a.participants || 0)
        )[0];

        return {
            active: activeChallenges.length,
            total: challenges.length,
            participants: totalParticipants,
            points: totalPoints,
            topChallenge,
        };
    }, [challenges]);

    const handleCreate = () => {
        setSelectedChallenge(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (challenge) => {
        setSelectedChallenge(challenge);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (challenge) => {
        setChallengeToDelete(challenge);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (challengeToDelete) {
            deleteChallenge(challengeToDelete.id);
            setChallengeToDelete(null);
        }
        setDeleteDialogOpen(false);
    };

    const handleViewDetails = (challenge) => {
        setViewingChallenge(challenge);
        setDetailDialogOpen(true);
    };

    const handleSave = (data) => {
        if (selectedChallenge) {
            updateChallenge(selectedChallenge.id, data);
        } else {
            createChallenge(data);
        }
    };

    const getStatusBadge = (challenge) => {
        const now = new Date();
        const startDate = new Date(challenge.start_date);
        const endDate = new Date(challenge.end_date);

        if (!challenge.is_active) {
            return <Badge variant="secondary">Inactive</Badge>;
        }
        if (now < startDate) {
            return <Badge variant="outline" className="text-blue-600 border-blue-300">Upcoming</Badge>;
        }
        if (now > endDate) {
            return <Badge variant="outline" className="text-slate-600 border-slate-300">Ended</Badge>;
        }
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getTimeRemaining = (endDate) => {
        const end = new Date(endDate);
        const now = new Date();
        const diff = end - now;

        if (diff < 0) return 'Ended';
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days > 0) return `${days} days left`;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        return `${hours} hours left`;
    };

    // Get participants for viewing challenge
    const viewingParticipants = viewingChallenge
        ? getChallengeParticipants(viewingChallenge.id)
        : [];

    const viewingProgress = viewingChallenge
        ? getChallengeProgress(viewingChallenge.id)
        : { total: 0, percentage: 0, completed: 0 };

    // Separate active and inactive challenges
    const activeChallenges = challenges.filter(c => c.is_active);
    const inactiveChallenges = challenges.filter(c => !c.is_active);
    const sortedChallenges = [...activeChallenges, ...inactiveChallenges];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Challenges</h1>
                    <p className="text-muted-foreground mt-1">
                        Create, edit, and monitor team challenges
                    </p>
                </div>
                <Button
                    onClick={handleCreate}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Challenge
                </Button>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="glass-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                <Flag className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.active}</p>
                                <p className="text-sm text-muted-foreground">Active Challenges</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.participants}</p>
                                <p className="text-sm text-muted-foreground">Total Participants</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.points}</p>
                                <p className="text-sm text-muted-foreground">Points Available</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-lg font-bold truncate max-w-[120px]">
                                    {stats.topChallenge?.title || 'N/A'}
                                </p>
                                <p className="text-sm text-muted-foreground">Top Challenge</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Challenges Table */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        All Challenges ({challenges.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {challenges.length === 0 ? (
                        <div className="text-center py-12">
                            <Flag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-muted-foreground mb-1">
                                No challenges yet
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Create your first challenge to engage your team!
                            </p>
                            <Button onClick={handleCreate} className="bg-emerald-500 hover:bg-emerald-600">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Challenge
                            </Button>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Challenge</TableHead>
                                        <TableHead className="hidden md:table-cell">Type</TableHead>
                                        <TableHead className="text-center hidden md:table-cell">Progress</TableHead>
                                        <TableHead className="text-center hidden sm:table-cell">Participants</TableHead>
                                        <TableHead className="text-center hidden sm:table-cell">Points</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedChallenges.map((challenge) => {
                                        const activityType = challenge.activity_type
                                            ? ACTIVITY_TYPES[challenge.activity_type]
                                            : null;
                                        const progress = getChallengeProgress(challenge.id);

                                        return (
                                            <TableRow
                                                key={challenge.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => handleViewDetails(challenge)}
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                                            style={{
                                                                backgroundColor: activityType
                                                                    ? `${activityType.color}20`
                                                                    : 'rgb(16 185 129 / 0.1)',
                                                            }}
                                                        >
                                                            <Flag
                                                                className="w-5 h-5"
                                                                style={{ color: activityType?.color || '#10b981' }}
                                                            />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-medium truncate max-w-[150px] sm:max-w-[180px]">
                                                                {challenge.title}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {formatDate(challenge.start_date)} - {formatDate(challenge.end_date)}
                                                            </p>
                                                            {/* Mobile-only details */}
                                                            <div className="flex items-center gap-2 mt-1 sm:hidden text-xs text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <Users className="w-3 h-3" />
                                                                    {challenge.participants || 0}
                                                                </span>
                                                                <span>•</span>
                                                                <span className="text-amber-600 font-medium">
                                                                    +{challenge.points_reward} pts
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    {activityType ? (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs"
                                                            style={{
                                                                backgroundColor: `${activityType.color}20`,
                                                                color: activityType.color,
                                                            }}
                                                        >
                                                            {activityType.label}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-xs">Any</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <div className="w-24 mx-auto">
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span>{Math.round(progress.percentage)}%</span>
                                                        </div>
                                                        <Progress
                                                            value={progress.percentage}
                                                            className="h-2"
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center hidden sm:table-cell">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <Users className="w-4 h-4 text-muted-foreground" />
                                                        <span className="font-medium">{challenge.participants || 0}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center hidden sm:table-cell">
                                                    <Badge variant="outline" className="text-amber-600 border-amber-300">
                                                        +{challenge.points_reward} pts
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(challenge)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleViewDetails(challenge);
                                                            }}>
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEdit(challenge);
                                                            }}>
                                                                <Pencil className="w-4 h-4 mr-2" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteClick(challenge);
                                                                }}
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Challenge Dialog */}
            <ChallengeDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                challenge={selectedChallenge}
                onSave={handleSave}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-destructive" />
                            </div>
                            <DialogTitle>Delete Challenge</DialogTitle>
                        </div>
                        <DialogDescription>
                            Are you sure you want to delete "{challengeToDelete?.title}"?
                            This action cannot be undone and will remove all associated data.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                        >
                            Delete Challenge
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Challenge Detail Dialog */}
            <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
                    {viewingChallenge && (
                        <>
                            <DialogHeader>
                                <div className="flex items-start gap-3">
                                    <div
                                        className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                                        style={{
                                            backgroundColor: viewingChallenge.activity_type
                                                ? `${ACTIVITY_TYPES[viewingChallenge.activity_type]?.color}20`
                                                : 'rgb(16 185 129 / 0.1)',
                                        }}
                                    >
                                        <Flag
                                            className="w-6 h-6"
                                            style={{
                                                color: viewingChallenge.activity_type
                                                    ? ACTIVITY_TYPES[viewingChallenge.activity_type]?.color
                                                    : '#10b981'
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <DialogTitle className="text-xl">{viewingChallenge.title}</DialogTitle>
                                        <DialogDescription className="mt-1">
                                            {viewingChallenge.description}
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <Tabs defaultValue="overview" className="mt-4">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="participants">
                                        Participants ({viewingParticipants.length})
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="mt-4 space-y-4">
                                    {/* Challenge Stats */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-lg bg-muted/50">
                                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                                <Target className="w-4 h-4" />
                                                <span className="text-sm">Target</span>
                                            </div>
                                            <p className="text-xl font-bold">
                                                {viewingChallenge.target_value}
                                                <span className="text-sm font-normal text-muted-foreground ml-1">
                                                    {viewingChallenge.activity_type
                                                        ? ACTIVITY_TYPES[viewingChallenge.activity_type]?.unit
                                                        : 'kg CO₂'}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-muted/50">
                                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                                <Trophy className="w-4 h-4" />
                                                <span className="text-sm">Reward</span>
                                            </div>
                                            <p className="text-xl font-bold text-amber-500">
                                                +{viewingChallenge.points_reward} pts
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-muted/50">
                                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                                <Users className="w-4 h-4" />
                                                <span className="text-sm">Participants</span>
                                            </div>
                                            <p className="text-xl font-bold">
                                                {viewingChallenge.participants || 0}
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-muted/50">
                                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-sm">Time Remaining</span>
                                            </div>
                                            <p className="text-xl font-bold">
                                                {getTimeRemaining(viewingChallenge.end_date)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Overall Progress */}
                                    <div className="p-4 rounded-lg border">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium">Overall Progress</span>
                                            <span className="text-sm text-muted-foreground">
                                                {viewingProgress.completed} completed
                                            </span>
                                        </div>
                                        <Progress value={viewingProgress.percentage} className="h-3" />
                                        <p className="text-sm text-muted-foreground mt-2">
                                            {Math.round(viewingProgress.percentage)}% average completion
                                        </p>
                                    </div>

                                    {/* Date Range */}
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                            {formatDate(viewingChallenge.start_date)} — {formatDate(viewingChallenge.end_date)}
                                        </span>
                                    </div>
                                </TabsContent>

                                <TabsContent value="participants" className="mt-4">
                                    <ScrollArea className="h-[300px] pr-4">
                                        {viewingParticipants.length === 0 ? (
                                            <div className="text-center py-8">
                                                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                                                <p className="text-muted-foreground">No participants yet</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {viewingParticipants.map((participant, index) => (
                                                    <div
                                                        key={participant.id}
                                                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                                    >
                                                        <div className="relative">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarFallback
                                                                    className={`text-white font-medium ${index === 0 ? 'bg-amber-500' :
                                                                        index === 1 ? 'bg-slate-400' :
                                                                            index === 2 ? 'bg-orange-500' :
                                                                                'bg-primary'
                                                                        }`}
                                                                >
                                                                    {participant.full_name?.charAt(0) || 'U'}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            {participant.progress >= 100 && (
                                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                                                    <CheckCircle className="w-3 h-3 text-white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <p className="font-medium truncate">
                                                                    {participant.full_name}
                                                                </p>
                                                                <span className="text-sm font-medium">
                                                                    {Math.round(participant.progress)}%
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Progress
                                                                    value={participant.progress}
                                                                    className={`h-1.5 flex-1 ${participant.progress >= 100
                                                                        ? '[&>div]:bg-emerald-500'
                                                                        : ''
                                                                        }`}
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                                <span>{participant.department}</span>
                                                                <span>•</span>
                                                                <span>{participant.activitiesCount} activities</span>
                                                                <span>•</span>
                                                                <span>{participant.contribution.toFixed(1)} contributed</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </ScrollArea>
                                </TabsContent>
                            </Tabs>

                            <DialogFooter className="mt-4">
                                <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                                    Close
                                </Button>
                                <Button
                                    onClick={() => {
                                        setDetailDialogOpen(false);
                                        handleEdit(viewingChallenge);
                                    }}
                                    className="bg-primary"
                                >
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit Challenge
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
