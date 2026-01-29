import { createClient } from '@supabase/supabase-js';

// Use environment variables or fallback to demo mode
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';

// Check if we're configured for demo mode (no real Supabase connection)
const isConfiguredForDemo = !import.meta.env.VITE_SUPABASE_URL;

// This will be updated if Supabase connection fails
let forcedDemoMode = false;

// Check if we should use demo mode
export const isDemoMode = () => isConfiguredForDemo || forcedDemoMode;

// Force demo mode when Supabase connection fails
export const forceDemoMode = () => {
    forcedDemoMode = true;
    console.warn('Forcing demo mode due to Supabase connection issues');
};

// Reset demo mode (for when connection is restored)
export const resetDemoMode = () => {
    forcedDemoMode = false;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for demo mode
export const demoStorage = {
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch {
            return null;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage error:', e);
        }
    },
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Storage error:', e);
        }
    }
};
