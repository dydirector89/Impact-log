import { ACTIVITY_TYPES } from '../../utils/calculations';
import StatusChip from './StatusChip';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Leaf, MessageSquare } from 'lucide-react';

export default function ActivityDetailDialog({ open, onClose, activity }) {
    if (!activity) return null;

    const activityType = ACTIVITY_TYPES[activity.activity_type];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>Activity Details</DialogTitle>
                        <StatusChip status={activity.status} />
                    </div>
                </DialogHeader>

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

                {/* Reviewer Comment (if available) */}
                {activity.reviewer_comment && (
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                        <MessageSquare className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-xs text-muted-foreground">Reviewer Comment</p>
                            <p className="text-sm">{activity.reviewer_comment}</p>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
