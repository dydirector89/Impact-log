import { useState } from 'react';
import { ACTIVITY_TYPES } from '../../utils/calculations';
import StatusChip from '../common/StatusChip';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock, MapPin, Leaf, AlertTriangle } from 'lucide-react';

export default function ApprovalDialog({ open, onClose, activity, onApprove, onReject }) {
    const [comment, setComment] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);

    if (!activity) return null;

    const activityType = ACTIVITY_TYPES[activity.activity_type];

    const handleApprove = () => {
        onApprove(activity.id, comment);
        setComment('');
        onClose();
    };

    const handleReject = () => {
        if (!comment.trim() && !isRejecting) {
            setIsRejecting(true);
            return;
        }
        onReject(activity.id, comment);
        setComment('');
        setIsRejecting(false);
        onClose();
    };

    const handleClose = () => {
        setComment('');
        setIsRejecting(false);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>Review Activity</DialogTitle>
                        <StatusChip status={activity.status} />
                    </div>
                </DialogHeader>

                {/* Submitter Info */}
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <Avatar className="h-11 w-11">
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                            {activity.user_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium">{activity.user_name}</p>
                        <p className="text-sm text-muted-foreground">
                            Submitted {new Date(activity.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </p>
                    </div>
                </div>

                {/* Activity Type */}
                <div>
                    <Badge
                        variant="secondary"
                        className="text-sm font-medium"
                        style={{
                            backgroundColor: `${activityType?.color}20`,
                            color: activityType?.color,
                        }}
                    >
                        {activityType?.label || activity.activity_type}
                    </Badge>
                </div>

                {/* Description */}
                <p className="text-sm leading-relaxed">{activity.description}</p>

                {/* Photo */}
                {activity.photo_url && (
                    <div className="rounded-xl overflow-hidden">
                        <img
                            src={activity.photo_url}
                            alt="Activity proof"
                            className="w-full max-h-48 object-cover"
                        />
                    </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Date</p>
                            <p className="text-sm font-medium">
                                {new Date(activity.activity_date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Quantity</p>
                            <p className="text-sm font-medium">
                                {activity.quantity || activity.hours} {activityType?.unit}
                            </p>
                        </div>
                    </div>

                    {activity.location && (
                        <div className="col-span-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Location</p>
                                <p className="text-sm font-medium">{activity.location}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Impact Summary */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5">
                    <Leaf className="w-5 h-5 text-primary" />
                    <div>
                        <p className="text-xs text-muted-foreground">Calculated Impact</p>
                        <p className="text-sm font-semibold">
                            {(activity.co2_saved || 0).toFixed(2)} kg CO₂ saved • {(activity.impact_score || 0).toFixed(1)} points
                        </p>
                    </div>
                </div>

                {/* AI Validation Flags */}
                {activity.ai_validation_flags?.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-amber-500">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-sm font-medium">AI Validation Flags</span>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                            {activity.ai_validation_flags.map((flag) => (
                                <Badge key={flag} variant="outline" className="text-amber-600 border-amber-300">
                                    {flag.replace(/_/g, ' ')}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Comment Field */}
                <div className="space-y-2">
                    <Label htmlFor="comment">
                        {isRejecting ? 'Rejection reason (required)' : 'Comment (optional)'}
                    </Label>
                    <Textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={isRejecting
                            ? 'Please provide a reason for rejection...'
                            : 'Add a comment for the employee...'}
                        className={isRejecting && !comment.trim() ? 'border-destructive' : ''}
                        rows={2}
                    />
                    {isRejecting && !comment.trim() && (
                        <p className="text-xs text-destructive">Please provide a reason for rejection</p>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={handleReject}>
                        Reject
                    </Button>
                    <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleApprove}>
                        Approve
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
