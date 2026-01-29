import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ACTIVITY_TYPES } from '../../utils/calculations';

export default function ChallengeDialog({ open, onOpenChange, challenge, onSave }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        activity_type: '',
        target_value: '',
        points_reward: '',
        start_date: '',
        end_date: '',
    });

    useEffect(() => {
        if (challenge) {
            setFormData({
                title: challenge.title,
                description: challenge.description,
                activity_type: challenge.activity_type,
                target_value: challenge.target_value,
                points_reward: challenge.points_reward,
                start_date: challenge.start_date.split('T')[0],
                end_date: challenge.end_date.split('T')[0],
            });
        } else {
            setFormData({
                title: '',
                description: '',
                activity_type: '',
                target_value: '',
                points_reward: '',
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            });
        }
    }, [challenge, open]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            target_value: Number(formData.target_value),
            points_reward: Number(formData.points_reward),
            start_date: new Date(formData.start_date).toISOString(),
            end_date: new Date(formData.end_date).toISOString(),
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{challenge ? 'Edit Challenge' : 'Create New Challenge'}</DialogTitle>
                    <DialogDescription>
                        Set up a new sustainability challenge for your team.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Challenge Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g., Bike to Work Week"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe the goal and rules..."
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="activity_type">Activity Type</Label>
                            <Select
                                value={formData.activity_type}
                                onValueChange={(value) => handleChange('activity_type', value)}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(ACTIVITY_TYPES).map((type) => (
                                        <SelectItem key={type.id} value={type.id}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="target_value">Target Value</Label>
                            <div className="relative">
                                <Input
                                    id="target_value"
                                    type="number"
                                    min="1"
                                    value={formData.target_value}
                                    onChange={(e) => handleChange('target_value', e.target.value)}
                                    required
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    {formData.activity_type ? ACTIVITY_TYPES[formData.activity_type]?.unit : 'units'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start_date">Start Date</Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => handleChange('start_date', e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="end_date">End Date</Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => handleChange('end_date', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="points_reward">Points Reward</Label>
                        <Input
                            id="points_reward"
                            type="number"
                            min="0"
                            step="50"
                            value={formData.points_reward}
                            onChange={(e) => handleChange('points_reward', e.target.value)}
                            required
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                            {challenge ? 'Save Changes' : 'Create Challenge'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
