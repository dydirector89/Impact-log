import { useState } from 'react';
import { Flag, TrendingUp, Settings, X, Save } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function ForecastWidget({
    currentValue,
    targetValue: initialTarget,
    label: initialLabel,
    unit,
    deadline: initialDeadline,
    editable = false,
    onUpdate
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [targetValue, setTargetValue] = useState(initialTarget);
    const [label, setLabel] = useState(initialLabel);
    const [deadline, setDeadline] = useState(initialDeadline);

    // Edit form state
    const [editForm, setEditForm] = useState({
        targetValue: initialTarget,
        label: initialLabel,
        deadline: initialDeadline,
    });

    const progress = Math.min((currentValue / targetValue) * 100, 100);
    const remaining = targetValue - currentValue;

    // Calculate days remaining
    const now = new Date();
    const endDate = new Date(deadline);
    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

    // Predict if target will be met (simple linear projection)
    const daysPassed = 30 - daysRemaining;
    const dailyRate = daysPassed > 0 ? currentValue / daysPassed : 0;
    const projectedTotal = dailyRate * 30;
    const willMeetTarget = projectedTotal >= targetValue;

    const handleSave = () => {
        setTargetValue(Number(editForm.targetValue));
        setLabel(editForm.label);
        setDeadline(editForm.deadline);
        setIsEditing(false);

        // Callback if provided
        if (onUpdate) {
            onUpdate({
                targetValue: Number(editForm.targetValue),
                label: editForm.label,
                deadline: editForm.deadline,
            });
        }
    };

    const openEditDialog = () => {
        setEditForm({
            targetValue,
            label,
            deadline,
        });
        setIsEditing(true);
    };

    return (
        <>
            <Card className="bg-gradient-to-br from-emerald-900 to-teal-800 text-white border-0 relative">
                {editable && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 text-white/70 hover:text-white hover:bg-white/10"
                        onClick={openEditDialog}
                    >
                        <Settings className="h-4 w-4" />
                    </Button>
                )}
                <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Flag className="h-4 w-4 opacity-90" />
                        <span className="text-xs font-medium uppercase tracking-wide opacity-90">
                            ESG Target Forecast
                        </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 pr-8">{label}</h3>

                    {/* Progress Section */}
                    <div className="mb-4">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm opacity-90">Progress</span>
                            <span className="text-sm font-semibold">
                                {currentValue.toFixed(1)} / {targetValue} {unit}
                            </span>
                        </div>
                        <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white/10 rounded-lg p-3 text-center">
                            <p className="text-lg sm:text-xl font-bold">{daysRemaining}</p>
                            <p className="text-xs opacity-80">Days left</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-3 text-center">
                            <p className="text-lg sm:text-xl font-bold">{remaining.toFixed(1)}</p>
                            <p className="text-xs opacity-80">{unit} to go</p>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <Badge
                            className={`font-semibold ${willMeetTarget
                                ? 'bg-emerald-500/30 text-white border-0'
                                : 'bg-amber-500/30 text-white border-0'
                                }`}
                        >
                            {willMeetTarget ? 'On track to meet target' : 'Needs acceleration'}
                        </Badge>
                    </div>

                    {projectedTotal > 0 && (
                        <p className="text-xs opacity-80 mt-2">
                            Projected: {projectedTotal.toFixed(1)} {unit} by end of period
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit ESG Target</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="target-label">Target Name</Label>
                            <Input
                                id="target-label"
                                value={editForm.label}
                                onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                                placeholder="e.g., Q1 CO₂ Reduction Target"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="target-value">Target Value ({unit})</Label>
                            <Input
                                id="target-value"
                                type="number"
                                value={editForm.targetValue}
                                onChange={(e) => setEditForm({ ...editForm, targetValue: e.target.value })}
                                min="1"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="target-deadline">Target Deadline</Label>
                            <Input
                                id="target-deadline"
                                type="date"
                                value={editForm.deadline}
                                onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
