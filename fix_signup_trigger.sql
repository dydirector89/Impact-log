-- Fix for "Database error saving new user" during signup
-- Run this in Supabase Dashboard -> SQL Editor

-- 1. Drop existing trigger to be safe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Update the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, department)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'employee'),
        COALESCE(NEW.raw_user_meta_data->>'department', '')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        department = EXCLUDED.department,
        updated_at = NOW();
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error (visible in Supabase logs)
        RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
        -- Return NEW anyway so the auth user is still created, 
        -- even if profile creation fails (though ideally we want both)
        -- OR re-raise if we want to block signup on profile failure:
        RAISE; 
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Re-create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Verify RLS policies are not interfering (though Security Definer should bypass)
-- Ensure the profiles table is writable
GRANT ALL ON TABLE public.profiles TO postgres;
GRANT ALL ON TABLE public.profiles TO service_role;
