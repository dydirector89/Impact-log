import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Copy, Leaf, Mail, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function Login() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login, resendVerification, isDemoMode } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [needsVerification, setNeedsVerification] = useState(false);
    const [resendingVerification, setResendingVerification] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);

    // Check for verified query param
    const isVerified = searchParams.get('verified') === 'true';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setNeedsVerification(false);
        setVerificationSent(false);
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate(result.user.role === 'manager' ? '/manager' : '/dashboard');
        } else {
            // Check if error is about email verification
            if (result.error?.toLowerCase().includes('verify') ||
                result.error?.toLowerCase().includes('confirm') ||
                result.needsVerification) {
                setNeedsVerification(true);
            }
            setError(result.error);
        }

        setLoading(false);
    };

    const handleResendVerification = async () => {
        if (!email) {
            setError('Please enter your email address');
            return;
        }
        setResendingVerification(true);
        setError('');

        const result = await resendVerification(email);

        if (result.success) {
            setVerificationSent(true);
        } else {
            setError(result.error || 'Failed to resend verification email');
        }

        setResendingVerification(false);
    };

    const handleDemoLogin = (role) => {
        const credentials = {
            employee: { email: 'employee@impactlog.demo', password: 'Employee123' },
            manager: { email: 'manager@impactlog.demo', password: 'Manager123' },
        };

        setEmail(credentials[role].email);
        setPassword(credentials[role].password);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-teal-800 to-teal-900 relative overflow-hidden p-4">
            {/* Background decorations */}
            <div className="absolute top-[-20%] right-[-10%] w-1/2 h-[70%] bg-[radial-gradient(circle,rgba(16,185,129,0.15)_0%,transparent_70%)] animate-pulse" />
            <div className="absolute bottom-[-20%] left-[-10%] w-1/2 h-[70%] bg-[radial-gradient(circle,rgba(20,184,166,0.15)_0%,transparent_70%)] animate-pulse delay-1000" />

            <Card className="max-w-md w-full relative z-10 shadow-2xl">
                <CardContent className="p-8">
                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                                <Leaf className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-foreground">ImpactLog</h1>
                        </div>
                        <p className="text-muted-foreground text-sm">Track your sustainability impact</p>
                    </div>

                    {/* Email Verified Success Message */}
                    {isVerified && (
                        <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="mt-0.5 bg-emerald-100 rounded-full p-1">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-emerald-900 text-base mb-1">Email Verified Successfully!</p>
                                <p className="text-emerald-700">Your account has been confirmed. Please sign in below to continue to your dashboard.</p>
                            </div>
                        </div>
                    )}

                    {/* Verification Message */}
                    {verificationSent && (
                        <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-start gap-2">
                            <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium">Verification email sent!</p>
                                <p className="text-emerald-600">Check your inbox and click the link to verify your account.</p>
                            </div>
                        </div>
                    )}

                    {needsVerification && !verificationSent && (
                        <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                            <div className="flex items-start gap-2 mb-2">
                                <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium">Email verification required</p>
                                    <p className="text-amber-700">Please verify your email address to continue.</p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full mt-2"
                                onClick={handleResendVerification}
                                disabled={resendingVerification}
                            >
                                {resendingVerification ? (
                                    <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                                ) : (
                                    <><Mail className="mr-2 h-4 w-4" /> Resend verification email</>
                                )}
                            </Button>
                        </div>
                    )}

                    {error && !needsVerification && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                        </div>

                        <Button type="submit" className="w-full" variant="gradient" size="lg" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-background px-3 text-xs text-muted-foreground">Demo Accounts</span>
                        </div>
                    </div>

                    {/* Demo Credentials */}
                    <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="default">Employee</Badge>
                                <Button size="sm" variant="outline" onClick={() => handleDemoLogin('employee')}>
                                    Use
                                </Button>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">employee@impactlog.demo</span>
                                    <button onClick={() => copyToClipboard('employee@impactlog.demo')} className="p-1 hover:bg-muted rounded">
                                        <Copy className="h-3 w-3" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Employee123</span>
                                    <button onClick={() => copyToClipboard('Employee123')} className="p-1 hover:bg-muted rounded">
                                        <Copy className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 rounded-lg bg-violet-50/50 dark:bg-violet-900/10 border border-violet-200/50 dark:border-violet-800/30">
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary" className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                                    Manager
                                </Badge>
                                <Button size="sm" variant="outline" onClick={() => handleDemoLogin('manager')}>
                                    Use
                                </Button>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">manager@impactlog.demo</span>
                                    <button onClick={() => copyToClipboard('manager@impactlog.demo')} className="p-1 hover:bg-muted rounded">
                                        <Copy className="h-3 w-3" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Manager123</span>
                                    <button onClick={() => copyToClipboard('Manager123')} className="p-1 hover:bg-muted rounded">
                                        <Copy className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Signup Link */}
                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-primary font-medium hover:underline">
                            Create one
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
