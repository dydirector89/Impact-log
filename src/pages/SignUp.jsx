import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Leaf, CheckCircle2, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export default function SignUp() {
    const navigate = useNavigate();
    const { signup, isDemoMode } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        department: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Password strength calculation
    const getPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/)) strength++;
        if (password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^a-zA-Z0-9]/)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(formData.password);

    const getStrengthColor = () => {
        if (passwordStrength < 2) return 'bg-red-500';
        if (passwordStrength < 4) return 'bg-yellow-500';
        return 'bg-emerald-500';
    };

    const getStrengthLabel = () => {
        if (passwordStrength < 2) return 'Weak';
        if (passwordStrength < 4) return 'Medium';
        return 'Strong';
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isDemoMode) {
            setError('Signup is not available in demo mode. Please configure Supabase for real authentication.');
            return;
        }

        // Validation
        if (!formData.fullName.trim()) {
            setError('Please enter your full name');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!acceptTerms) {
            setError('Please accept the terms and conditions');
            return;
        }

        setLoading(true);

        const result = await signup(
            formData.email,
            formData.password,
            formData.fullName,
            'employee', // Default role for new signups
            formData.department
        );

        if (result.success) {
            setSuccess(true);
        } else {
            // Ensure error is a string
            const errorMessage = typeof result.error === 'string'
                ? result.error
                : result.error?.message || 'An error occurred. Please try again.';
            setError(errorMessage);
        }

        setLoading(false);
    };

    // Success state - email verification message
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-teal-800 to-teal-900 relative overflow-hidden p-4">
                {/* Background decorations */}
                <div className="absolute top-[-20%] right-[-10%] w-1/2 h-[70%] bg-[radial-gradient(circle,rgba(16,185,129,0.15)_0%,transparent_70%)] animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-10%] w-1/2 h-[70%] bg-[radial-gradient(circle,rgba(20,184,166,0.15)_0%,transparent_70%)] animate-pulse delay-1000" />

                <Card className="max-w-md w-full relative z-10 shadow-2xl">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <Mail className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                        </div>

                        <h2 className="text-2xl font-bold mb-2">Check your email</h2>
                        <p className="text-muted-foreground mb-6">
                            We've sent a verification link to<br />
                            <span className="font-medium text-foreground">{formData.email}</span>
                        </p>

                        <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 mb-6">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-left text-emerald-800 dark:text-emerald-200">
                                    Click the link in your email to verify your account.
                                    The link will expire in 24 hours.
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate('/login')}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-teal-800 to-teal-900 relative overflow-hidden p-4">
            {/* Background decorations */}
            <div className="absolute top-[-20%] right-[-10%] w-1/2 h-[70%] bg-[radial-gradient(circle,rgba(16,185,129,0.15)_0%,transparent_70%)] animate-pulse" />
            <div className="absolute bottom-[-20%] left-[-10%] w-1/2 h-[70%] bg-[radial-gradient(circle,rgba(20,184,166,0.15)_0%,transparent_70%)] animate-pulse delay-1000" />

            <Card className="max-w-md w-full relative z-10 shadow-2xl">
                <CardContent className="p-8">
                    {/* Logo */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                                <Leaf className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-foreground">ImpactLog</h1>
                        </div>
                        <p className="text-muted-foreground text-sm">Create your account</p>
                    </div>

                    {isDemoMode && (
                        <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                            <strong>Demo Mode:</strong> Signup requires Supabase connection.
                            <Link to="/login" className="block mt-1 text-amber-700 underline hover:text-amber-900">
                                Use demo credentials instead →
                            </Link>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <Input
                                type="text"
                                name="fullName"
                                placeholder="Enter your full name"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Department (Optional)</label>
                            <Select
                                value={formData.department}
                                onValueChange={(value) => setFormData({ ...formData, department: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="engineering">Engineering</SelectItem>
                                    <SelectItem value="marketing">Marketing</SelectItem>
                                    <SelectItem value="sales">Sales</SelectItem>
                                    <SelectItem value="hr">Human Resources</SelectItem>
                                    <SelectItem value="finance">Finance</SelectItem>
                                    <SelectItem value="operations">Operations</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {/* Password strength indicator */}
                            {formData.password && (
                                <div className="space-y-1">
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    'h-1 flex-1 rounded-full transition-colors',
                                                    i < passwordStrength ? getStrengthColor() : 'bg-muted'
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <p className={cn(
                                        'text-xs',
                                        passwordStrength < 2 ? 'text-red-500' :
                                            passwordStrength < 4 ? 'text-yellow-600' : 'text-emerald-600'
                                    )}>
                                        Password strength: {getStrengthLabel()}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Confirm Password</label>
                            <Input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                <p className="text-xs text-red-500">Passwords do not match</p>
                            )}
                        </div>

                        <div className="flex items-start gap-2">
                            <Checkbox
                                id="terms"
                                checked={acceptTerms}
                                onCheckedChange={setAcceptTerms}
                                className="mt-1"
                            />
                            <label htmlFor="terms" className="text-sm text-muted-foreground">
                                I agree to the{' '}
                                <a href="#" className="text-primary hover:underline">Terms of Service</a>
                                {' '}and{' '}
                                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            variant="gradient"
                            size="lg"
                            disabled={loading || isDemoMode}
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-medium hover:underline">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
