-- ===========================================
-- FIX: Security Policy Updates
-- ===========================================
-- Run this script in the Supabase SQL Editor to patch security vulnerabilities.
-- ===========================================

-- 1. Fix "Managers can update activities"
-- OLD: USING (true)
-- NEW: Checks if auth.uid() is a manager
DROP POLICY IF EXISTS "Managers can update activities" ON activities;
CREATE POLICY "Managers can update activities" ON activities 
FOR UPDATE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('manager', 'admin')
);

-- 2. Fix "Managers can insert challenges"
DROP POLICY IF EXISTS "Managers can insert challenges" ON challenges;
CREATE POLICY "Managers can insert challenges" ON challenges 
FOR INSERT WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('manager', 'admin')
);

-- 3. Fix "Managers can update challenges"
DROP POLICY IF EXISTS "Managers can update challenges" ON challenges;
CREATE POLICY "Managers can update challenges" ON challenges 
FOR UPDATE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('manager', 'admin')
);

-- 4. Fix "Managers can delete challenges"
DROP POLICY IF EXISTS "Managers can delete challenges" ON challenges;
CREATE POLICY "Managers can delete challenges" ON challenges 
FOR DELETE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('manager', 'admin')
);

-- 5. Fix "Anyone can insert notifications" (Restrict to Managers/System)
DROP POLICY IF EXISTS "Anyone can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Managers can insert notifications" ON notifications;
CREATE POLICY "Managers can insert notifications" ON notifications 
FOR INSERT WITH CHECK (
  -- Users can create notifications for themselves (e.g. reminders) OR Managers can create for anyone
  (auth.uid() = user_id) OR 
  ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('manager', 'admin'))
);
