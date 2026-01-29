import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lightbulb, CheckCircle, XCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import ActivityForm from '../components/forms/ActivityForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ActivitySubmission() {
    const navigate = useNavigate();
    const { submitActivity, getUserActivities } = useData();

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const existingActivities = getUserActivities();

    const handleSubmit = (activityData) => {
        try {
            submitActivity(activityData);
            setToast({
                show: true,
                message: 'Activity submitted successfully! Awaiting manager approval.',
                type: 'success',
            });

            // Navigate back after a short delay
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (error) {
            setToast({
                show: true,
                message: 'Failed to submit activity. Please try again.',
                type: 'error',
            });
        }
    };

    return (
        <div className="space-y-6 animate-in">
            {/* Header */}
            <div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="mb-2"
                    onClick={() => navigate('/dashboard')}
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Dashboard
                </Button>

                <h1 className="text-2xl sm:text-3xl font-bold">Log New Activity</h1>
                <p className="text-muted-foreground">
                    Record your sustainability contribution and earn points
                </p>
            </div>

            {/* Form Card */}
            <Card className="max-w-3xl">
                <CardContent className="p-6 sm:p-8">
                    <ActivityForm
                        onSubmit={handleSubmit}
                        existingActivities={existingActivities}
                    />
                </CardContent>
            </Card>

            {/* Help Text */}
            <Card className="max-w-3xl bg-blue-50/50 dark:bg-blue-900/10 border-blue-200/50">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 mt-0.5 text-blue-600" />
                        <div>
                            <p className="font-semibold text-sm mb-2">Tips for a successful submission</p>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                                <li>Provide a clear and detailed description of your activity</li>
                                <li>Upload a photo as proof when possible</li>
                                <li>Include the location for outdoor activities</li>
                                <li>Be accurate with quantities and hours</li>
                                <li>Your activity will be reviewed by your manager</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Toast Notification */}
            {toast.show && (
                <div className={cn(
                    "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-4",
                    toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                )}>
                    {toast.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    {toast.message}
                </div>
            )}
        </div>
    );
}
