import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ImageCropDialog from '../components/common/ImageCropDialog';
import {
    User,
    Mail,
    Building2,
    BadgeCheck,
    Pencil,
    Save,
    X,
    Camera,
    Bell,
    Info,
    Monitor,
    Sun,
    Moon,
    Check,
    Trash2
} from 'lucide-react';

export default function Profile() {
    const { user } = useAuth();
    const { getUserActivities, getUserBadges } = useData();
    const { theme, setTheme } = useTheme();
    const fileInputRef = useRef(null);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
        department: user?.department || '',
    });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Notification preferences state
    const [notifications, setNotifications] = useState({
        approvals: true,
        weeklySummary: true,
        challenges: false,
    });

    // Profile image state
    const [profileImage, setProfileImage] = useState(() => {
        return localStorage.getItem(`profile_image_${user?.id}`) || null;
    });
    const [imageToCrop, setImageToCrop] = useState(null);
    const [cropDialogOpen, setCropDialogOpen] = useState(false);

    const activities = getUserActivities();
    const badges = getUserBadges();

    const approvedActivities = activities.filter(a => a.status === 'approved').length;

    const handleChange = (field) => (event) => {
        setFormData(prev => ({ ...prev, [field]: event.target.value }));
    };

    const handleSave = () => {
        showToast('Profile updated successfully!', 'success');
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({
            full_name: user?.full_name || '',
            email: user?.email || '',
            department: user?.department || '',
        });
        setIsEditing(false);
    };

    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageToCrop(reader.result);
                setCropDialogOpen(true);
            };
            reader.readAsDataURL(file);
        }
        event.target.value = '';
    };

    const handleCropComplete = (croppedImageUrl) => {
        setProfileImage(croppedImageUrl);
        localStorage.setItem(`profile_image_${user?.id}`, croppedImageUrl);
        showToast('Profile photo updated!', 'success');
    };

    const handleRemovePhoto = () => {
        setProfileImage(null);
        localStorage.removeItem(`profile_image_${user?.id}`);
        showToast('Profile photo removed', 'success');
    };

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    };

    const themeOptions = [
        { value: 'system', label: 'System Default', icon: Monitor, description: 'Follows your device settings' },
        { value: 'light', label: 'Light', icon: Sun, description: 'Light background, dark text' },
        { value: 'dark', label: 'Dark', icon: Moon, description: 'Dark background, light text' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                <p className="text-muted-foreground mt-1">
                    View and manage your account settings
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="glass-card">
                    <CardContent className="p-6 text-center">
                        {/* Avatar with camera button */}
                        <div className="relative inline-block mb-4">
                            <Avatar className="w-28 h-28 ring-4 ring-primary/20 transition-transform hover:scale-105 cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}>
                                <AvatarImage src={profileImage} alt={user?.full_name} />
                                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-3xl font-bold">
                                    {user?.full_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                                title="Change photo"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                            {profileImage && (
                                <button
                                    onClick={handleRemovePhoto}
                                    className="absolute -bottom-1 -left-1 w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg hover:bg-destructive/90 transition-colors"
                                    title="Remove photo"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleImageSelect}
                        />

                        <p className="text-xs text-muted-foreground mb-3">
                            {profileImage ? 'Click to change or remove photo' : 'Click to add photo'}
                        </p>

                        <h2 className="text-xl font-bold">{user?.full_name}</h2>

                        <Badge
                            variant={user?.role === 'manager' ? 'secondary' : 'default'}
                            className="mt-2 mb-2"
                        >
                            {user?.role === 'manager' ? 'Manager' : 'Employee'}
                        </Badge>

                        <p className="text-sm text-muted-foreground">{user?.department}</p>

                        <div className="border-t border-border my-4" />

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-2xl font-bold text-primary">{approvedActivities}</p>
                                <p className="text-xs text-muted-foreground">Activities</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-violet-500">{badges.length}</p>
                                <p className="text-xs text-muted-foreground">Badges</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Details & Settings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Account Details Card */}
                    <Card className="glass-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg">Account Details</CardTitle>
                            {!isEditing ? (
                                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={handleCancel}>
                                        <X className="w-4 h-4 mr-2" />
                                        Cancel
                                    </Button>
                                    <Button size="sm" onClick={handleSave}>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save
                                    </Button>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="full_name"
                                            value={formData.full_name}
                                            onChange={handleChange('full_name')}
                                            disabled={!isEditing}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            value={formData.email}
                                            disabled
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="department"
                                            value={formData.department}
                                            onChange={handleChange('department')}
                                            disabled={!isEditing}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <div className="relative">
                                        <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="role"
                                            value={user?.role === 'manager' ? 'Manager' : 'Employee'}
                                            disabled
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Appearance Card */}
                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Sun className="w-5 h-5" />
                                Appearance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Choose how ImpactLog looks to you. Select a theme preference.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {themeOptions.map((option) => {
                                    const Icon = option.icon;
                                    const isSelected = theme === option.value;
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => setTheme(option.value)}
                                            className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 hover:bg-accent/50 ${isSelected
                                                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                                                : 'border-border hover:border-primary/50'
                                                }`}
                                        >
                                            {isSelected && (
                                                <div className="absolute top-2 right-2">
                                                    <Check className="w-4 h-4 text-primary" />
                                                </div>
                                            )}
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isSelected
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground'
                                                }`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <span className="font-medium text-sm">{option.label}</span>
                                            <span className="text-xs text-muted-foreground text-center mt-1">
                                                {option.description}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notification Preferences Card */}
                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Bell className="w-5 h-5" />
                                Notification Preferences
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-sm">Activity Approvals</p>
                                    <p className="text-xs text-muted-foreground">
                                        Get notified when your activities are approved
                                    </p>
                                </div>
                                <button
                                    onClick={() => setNotifications(prev => ({ ...prev, approvals: !prev.approvals }))}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${notifications.approvals ? 'bg-primary' : 'bg-muted'
                                        }`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications.approvals ? 'translate-x-5' : 'translate-x-0'
                                        }`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-sm">Weekly Summary</p>
                                    <p className="text-xs text-muted-foreground">
                                        Receive a weekly sustainability summary email
                                    </p>
                                </div>
                                <button
                                    onClick={() => setNotifications(prev => ({ ...prev, weeklySummary: !prev.weeklySummary }))}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${notifications.weeklySummary ? 'bg-primary' : 'bg-muted'
                                        }`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications.weeklySummary ? 'translate-x-5' : 'translate-x-0'
                                        }`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-sm">Challenge Announcements</p>
                                    <p className="text-xs text-muted-foreground">
                                        Get notified about new challenges
                                    </p>
                                </div>
                                <button
                                    onClick={() => setNotifications(prev => ({ ...prev, challenges: !prev.challenges }))}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${notifications.challenges ? 'bg-primary' : 'bg-muted'
                                        }`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications.challenges ? 'translate-x-5' : 'translate-x-0'
                                        }`} />
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Image Crop Dialog */}
            <ImageCropDialog
                open={cropDialogOpen}
                onClose={() => setCropDialogOpen(false)}
                imageSrc={imageToCrop}
                onCropComplete={handleCropComplete}
            />

            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-bottom-4 fade-in flex items-center gap-2 ${toast.type === 'success'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-red-500 text-white'
                    }`}>
                    <Check className="w-4 h-4" />
                    {toast.message}
                </div>
            )}
        </div>
    );
}
