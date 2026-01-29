import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isDemoMode, forceDemoMode } from '../lib/supabase';
import { DEMO_USERS, initializeSeedData } from '../utils/seedData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [usingDemoMode, setUsingDemoMode] = useState(isDemoMode());

    // Fetch user profile from Supabase
    const fetchProfile = async (userId) => {
        if (usingDemoMode) return null;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                return null;
            }
            return data;
        } catch (err) {
            console.error('Profile fetch failed:', err);
            return null;
        }
    };

    // Initialize demo mode
    const initDemoMode = () => {
        initializeSeedData();
        const storedUser = localStorage.getItem('impactlog_user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setProfile(userData);
            } catch (e) {
                localStorage.removeItem('impactlog_user');
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        // Check if already in demo mode
        if (isDemoMode()) {
            setUsingDemoMode(true);
            initDemoMode();
            return;
        }

        // Try Supabase connection with timeout
        const timeoutId = setTimeout(() => {
            console.warn('Supabase connection timeout - falling back to demo mode');
            forceDemoMode();
            setUsingDemoMode(true);
            initDemoMode();
        }, 5000);

        supabase.auth.getSession()
            .then(async ({ data: { session }, error }) => {
                clearTimeout(timeoutId);
                if (error) {
                    console.error('Supabase session error:', error);
                    forceDemoMode();
                    setUsingDemoMode(true);
                    initDemoMode();
                    return;
                }
                if (session?.user) {
                    setUser(session.user);
                    const userProfile = await fetchProfile(session.user.id);
                    setProfile(userProfile);
                }
                setLoading(false);
            })
            .catch((err) => {
                clearTimeout(timeoutId);
                console.error('Supabase connection failed:', err);
                forceDemoMode();
                setUsingDemoMode(true);
                initDemoMode();
            });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (usingDemoMode) return; // Skip if in demo mode

                if (session?.user) {
                    setUser(session.user);
                    const userProfile = await fetchProfile(session.user.id);
                    setProfile(userProfile);
                } else {
                    setUser(null);
                    setProfile(null);
                }
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email, password) => {
        if (usingDemoMode) {
            // Demo mode authentication
            const demoUser = Object.values(DEMO_USERS).find(
                u => u.email === email && u.password === password
            );

            if (demoUser) {
                const userWithoutPassword = { ...demoUser };
                delete userWithoutPassword.password;

                setUser(userWithoutPassword);
                setProfile(userWithoutPassword);
                localStorage.setItem('impactlog_user', JSON.stringify(userWithoutPassword));

                return { success: true, user: userWithoutPassword };
            }

            return { success: false, error: 'Invalid email or password' };
        }

        // Supabase authentication
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { success: false, error: error.message };
            }

            const userProfile = await fetchProfile(data.user.id);
            setProfile(userProfile);

            return { success: true, user: data.user };
        } catch (err) {
            // Fallback to demo mode on connection error
            console.error('Login failed, falling back to demo mode:', err);
            forceDemoMode();
            setUsingDemoMode(true);

            // Try demo login
            const demoUser = Object.values(DEMO_USERS).find(
                u => u.email === email && u.password === password
            );

            if (demoUser) {
                const userWithoutPassword = { ...demoUser };
                delete userWithoutPassword.password;
                setUser(userWithoutPassword);
                setProfile(userWithoutPassword);
                localStorage.setItem('impactlog_user', JSON.stringify(userWithoutPassword));
                return { success: true, user: userWithoutPassword };
            }

            return { success: false, error: 'Connection failed. Please try demo credentials.' };
        }
    };

    const signup = async (email, password, fullName, role = 'employee', department = '') => {
        if (usingDemoMode) {
            return { success: false, error: 'Signup not available in demo mode' };
        }

        try {
            // Create a timeout promise to handle slow Supabase responses
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Request timed out. Please try again.')), 15000);
            });

            const signupPromise = supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role,
                        department: department,
                    },
                },
            });

            const { data, error } = await Promise.race([signupPromise, timeoutPromise]);

            if (error) {
                return { success: false, error: error.message || 'Signup failed' };
            }

            // Check if email confirmation is required
            if (data?.user?.identities?.length === 0) {
                return { success: false, error: 'An account with this email already exists.' };
            }

            return { success: true, user: data.user };
        } catch (err) {
            console.error('Signup error:', err);
            // Handle timeout and network errors
            if (err.message?.includes('timeout') || err.message?.includes('Timeout')) {
                return { success: false, error: 'Request timed out. Please check your connection and try again.' };
            }
            if (err.message?.includes('fetch') || err.message?.includes('network')) {
                return { success: false, error: 'Network error. Please check your connection.' };
            }
            return { success: false, error: err.message || 'An unexpected error occurred. Please try again.' };
        }
    };

    const resendVerification = async (email) => {
        if (usingDemoMode) {
            return { success: false, error: 'Not available in demo mode' };
        }

        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
            });

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const logout = async () => {
        if (usingDemoMode) {
            setUser(null);
            setProfile(null);
            localStorage.removeItem('impactlog_user');
            return;
        }

        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
    };

    const updateProfile = async (updates) => {
        if (usingDemoMode) {
            const updatedProfile = { ...profile, ...updates };
            setProfile(updatedProfile);
            setUser(updatedProfile);
            localStorage.setItem('impactlog_user', JSON.stringify(updatedProfile));
            return { success: true };
        }

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

        if (error) {
            return { success: false, error: error.message };
        }

        setProfile({ ...profile, ...updates });
        return { success: true };
    };

    // Combined user data (auth user + profile)
    const currentUser = profile || user;

    const value = {
        user: currentUser,
        authUser: user,
        profile,
        loading,
        login,
        signup,
        logout,
        resendVerification,
        updateProfile,
        isAuthenticated: !!currentUser,
        isEmployee: currentUser?.role === 'employee',
        isManager: currentUser?.role === 'manager',
        isAdmin: currentUser?.role === 'admin',
        isDemoMode: usingDemoMode,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
