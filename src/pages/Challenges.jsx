import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ACTIVITY_TYPES } from '../utils/calculations';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Flag,
    Users,
    Clock,
    Trophy,
    Check,
    Plus,
    Pencil,
    Trash2,
    MoreVertical
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ChallengeDialog from '../components/forms/ChallengeDialog';

export default function Challenges() {
    const {
        challenges,
        joinChallenge,
        hasJoinedChallenge,
        createChallenge,
        updateChallenge,
        deleteChallenge
    } = useData();
    const { isManager } = useAuth();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedChallenge, setSelectedChallenge] = useState(null);

    const handleCreate = () => {
        setSelectedChallenge(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (challenge) => {
        setSelectedChallenge(challenge);
        setIsDialogOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this challenging? This cannot be undone.')) {
            deleteChallenge(id);
        }
    };

    const handleSaveContext = (data) => {
        if (selectedChallenge) {
            updateChallenge(selectedChallenge.id, data);
        } else {
            createChallenge(data);
        }
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

    const activeChallenges = challenges.filter(c => c.is_active);

    return (
        <div className="space-y-6">
            {/* Header */}
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Challenges</h1>
                    <p className="text-muted-foreground mt-1">
                        Join challenges to earn bonus points and compete with colleagues
                    </p>
                </div>
                {isManager && (
                    <Button onClick={handleCreate} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Challenge
                    </Button>
                )}
            </div>

            {/* Active Challenges */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeChallenges.map((challenge) => {
                    const progress = (challenge.current_progress / challenge.target_value) * 100;
                    const activityType = challenge.activity_type ? ACTIVITY_TYPES[challenge.activity_type] : null;
                    const isCompleted = progress >= 100;
                    const hasJoined = hasJoinedChallenge(challenge.id);

                    return (
                        <Card
                            key={challenge.id}
                            className="glass-card flex flex-col hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                        >
                            <CardContent className="p-5 flex-1 flex flex-col">
                                {/* Header */}
                                <div className="flex items-start gap-3 mb-3">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                                        style={{
                                            backgroundColor: activityType ? `${activityType.color}20` : 'rgb(16 185 129 / 0.1)',
                                        }}
                                    >
                                        <Flag
                                            className="w-6 h-6"
                                            style={{ color: activityType?.color || '#10b981' }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="font-semibold text-base mb-1 truncate">
                                                {challenge.title}
                                            </h3>
                                            {isManager && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1">
                                                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(challenge)}>
                                                            <Pencil className="w-4 h-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(challenge.id)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                        {activityType && (
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
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                    {challenge.description}
                                </p>

                                {/* Progress */}
                                <div className="mb-3">
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-muted-foreground">Progress</span>
                                        <span className="font-medium">
                                            {challenge.current_progress} / {challenge.target_value}
                                        </span>
                                    </div>
                                    <Progress
                                        value={Math.min(progress, 100)}
                                        className={`h-2 ${isCompleted ? '[&>div]:bg-emerald-500' : ''}`}
                                    />
                                </div>

                                {/* Stats */}
                                <div className="flex gap-4 mb-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Users className="w-4 h-4" />
                                        <span>{challenge.participants} joined</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        <span>{getTimeRemaining(challenge.end_date)}</span>
                                    </div>
                                </div>

                                {/* Reward & CTA */}
                                <div className="mt-auto flex justify-between items-center pt-3 border-t border-border">
                                    <div className="flex items-center gap-1.5">
                                        <Trophy className="w-4 h-4 text-amber-500" />
                                        <span className="text-sm font-semibold text-amber-500">
                                            +{challenge.points_reward} pts
                                        </span>
                                    </div>
                                    {isCompleted ? (
                                        <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                                            <Check className="w-3 h-3 mr-1" />
                                            Completed!
                                        </Badge>
                                    ) : hasJoined ? (
                                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                            <Check className="w-3 h-3 mr-1" />
                                            Joined
                                        </Badge>
                                    ) : (
                                        <Button
                                            size="sm"
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                            onClick={() => joinChallenge(challenge.id)}
                                        >
                                            Join Challenge
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {activeChallenges.length === 0 && (
                <Card className="glass-card">
                    <CardContent className="text-center py-12">
                        <Flag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-muted-foreground mb-1">
                            No active challenges
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Check back later for new challenges!
                        </p>
                    </CardContent>
                </Card>
            )}


            <ChallengeDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                challenge={selectedChallenge}
                onSave={handleSaveContext}
            />
        </div >
    );
}
