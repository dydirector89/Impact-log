-- ===========================================
-- ImpactLog Supabase Database Setup
-- ===========================================
-- Run this entire file in Supabase Dashboard -> SQL Editor
-- ===========================================

-- STEP 1: Create Tables
-- ===========================================

-- Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT,
    role TEXT DEFAULT 'employee' CHECK (role IN ('employee', 'manager', 'admin')),
    department TEXT,
    avatar_url TEXT,
    total_points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    description TEXT,
    quantity NUMERIC,
    hours NUMERIC,
    activity_date DATE DEFAULT CURRENT_DATE,
    photo_url TEXT,
    location TEXT,
    co2_saved NUMERIC DEFAULT 0,
    impact_score NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewer_id UUID REFERENCES profiles(id),
    reviewer_comment TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    criteria JSONB,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Earned badges table
CREATE TABLE IF NOT EXISTS earned_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    target_value NUMERIC,
    activity_type TEXT,
    start_date DATE,
    end_date DATE,
    points_reward INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge participants table
CREATE TABLE IF NOT EXISTS challenge_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(challenge_id, user_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- STEP 2: Enable Row Level Security
-- ===========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE earned_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- STEP 3: Create RLS Policies
-- ===========================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Activities policies
DROP POLICY IF EXISTS "Users can view all activities" ON activities;
CREATE POLICY "Users can view all activities" ON activities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own activities" ON activities;
CREATE POLICY "Users can insert own activities" ON activities FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Managers can update activities" ON activities;
CREATE POLICY "Managers can update activities" ON activities FOR UPDATE USING (true);

-- Badges policies
DROP POLICY IF EXISTS "Anyone can view badges" ON badges;
CREATE POLICY "Anyone can view badges" ON badges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view earned badges" ON earned_badges;
CREATE POLICY "Users can view earned badges" ON earned_badges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert earned badges" ON earned_badges;
CREATE POLICY "Users can insert earned badges" ON earned_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Challenges policies
DROP POLICY IF EXISTS "Anyone can view challenges" ON challenges;
CREATE POLICY "Anyone can view challenges" ON challenges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Managers can insert challenges" ON challenges;
CREATE POLICY "Managers can insert challenges" ON challenges FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Managers can update challenges" ON challenges;
CREATE POLICY "Managers can update challenges" ON challenges FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Managers can delete challenges" ON challenges;
CREATE POLICY "Managers can delete challenges" ON challenges FOR DELETE USING (true);

-- Challenge participants policies
DROP POLICY IF EXISTS "Anyone can view participants" ON challenge_participants;
CREATE POLICY "Anyone can view participants" ON challenge_participants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can join challenges" ON challenge_participants;
CREATE POLICY "Users can join challenges" ON challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can insert notifications" ON notifications;
CREATE POLICY "Anyone can insert notifications" ON notifications FOR INSERT WITH CHECK (true);

-- ===========================================
-- STEP 4: Create Profile Trigger for New Users
-- ===========================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, role, department)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'employee'),
        COALESCE(NEW.raw_user_meta_data->>'department', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ===========================================
-- STEP 5: Insert Seed Data - Badges
-- ===========================================

INSERT INTO badges (name, description, icon, criteria, points) VALUES
    ('Green Starter', 'Complete your first sustainability activity', '🌱', '{"activities_count": 1}', 50),
    ('Eco Warrior', 'Complete 10 approved activities', '🛡️', '{"activities_count": 10}', 200),
    ('Carbon Cutter', 'Save 100kg of CO₂', '✂️', '{"co2_saved": 100}', 300),
    ('Volunteer Champion', 'Complete 20 hours of volunteering', '🏆', '{"volunteering_hours": 20}', 400),
    ('Recycling Master', 'Recycle 50kg of materials', '♻️', '{"recycling_quantity": 50}', 250),
    ('Tree Hugger', 'Plant 10 trees', '🌳', '{"trees_planted": 10}', 350),
    ('Energy Saver', 'Save 500 kWh of energy', '⚡', '{"energy_saved": 500}', 300),
    ('Sustainability Leader', 'Reach 1000 total impact points', '👑', '{"total_points": 1000}', 500)
ON CONFLICT DO NOTHING;

-- ===========================================
-- STEP 6: Insert Seed Data - Challenges
-- ===========================================

INSERT INTO challenges (title, description, target_value, activity_type, start_date, end_date, points_reward, is_active) VALUES
    ('January Green Challenge', 'Save 50kg of CO₂ this month through any activities', 50, NULL, '2026-01-01', '2026-01-31', 100, true),
    ('Recycle Week', 'Recycle 20kg of materials this week', 20, 'recycling', '2026-01-20', '2026-01-27', 50, true),
    ('Bike to Work Month', 'Cycle 100km to work this month', 100, 'cycling', '2026-01-01', '2026-01-31', 150, true)
ON CONFLICT DO NOTHING;

-- ===========================================
-- SUCCESS! Database setup complete.
-- ===========================================
-- 
-- NEXT STEPS:
-- 1. Go to Authentication -> Users -> Add User
-- 2. Create these demo users:
--    - Email: employee@impactlog.demo, Password: Employee123
--    - Email: manager@impactlog.demo, Password: Manager123
-- 3. Then run the SQL below to update their profiles with correct roles
--
-- UPDATE profiles SET full_name = 'Alex Johnson', role = 'employee', department = 'Engineering', total_points = 850 WHERE email = 'employee@impactlog.demo';
-- UPDATE profiles SET full_name = 'Sarah Williams', role = 'manager', department = 'Engineering', total_points = 1250 WHERE email = 'manager@impactlog.demo';
-- ===========================================
