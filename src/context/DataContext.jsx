import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { SEED_DATA, BADGES, EARNED_BADGES, TEAM_MEMBERS, DEMO_USERS } from '../utils/seedData';
import { calculateCO2Saved, calculateImpactScore } from '../utils/calculations';

const DataContext = createContext(null);

export function DataProvider({ children }) {
    const { user, isDemoMode } = useAuth();

    const [activities, setActivities] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [challenges, setChallenges] = useState([]);
    const [badges, setBadges] = useState([]);
    const [earnedBadges, setEarnedBadges] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch data from Supabase
    const fetchSupabaseData = async () => {
        if (isDemoMode) return;

        try {
            // Fetch activities
            const { data: activitiesData } = await supabase
                .from('activities')
                .select('*, profiles!activities_user_id_fkey(full_name)')
                .order('created_at', { ascending: false });

            if (activitiesData) {
                setActivities(activitiesData.map(a => ({
                    ...a,
                    user_name: a.profiles?.full_name || 'Unknown',
                })));
            }

            // Fetch notifications for current user
            if (user?.id) {
                const { data: notificationsData } = await supabase
                    .from('notifications')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (notificationsData) setNotifications(notificationsData);
            }

            // Fetch challenges
            const { data: challengesData } = await supabase
                .from('challenges')
                .select('*')
                .order('start_date', { ascending: false });

            if (challengesData) {
                // Fetch participants for each challenge
                const challengesWithParticipants = await Promise.all(
                    challengesData.map(async (challenge) => {
                        const { data: participants } = await supabase
                            .from('challenge_participants')
                            .select('user_id')
                            .eq('challenge_id', challenge.id);

                        return {
                            ...challenge,
                            participants: participants?.length || 0,
                            joined_users: participants?.map(p => p.user_id) || [],
                        };
                    })
                );
                setChallenges(challengesWithParticipants);
            }

            // Fetch badges
            const { data: badgesData } = await supabase.from('badges').select('*');
            if (badgesData) setBadges(badgesData);

            // Fetch earned badges
            const { data: earnedBadgesData } = await supabase.from('earned_badges').select('*');
            if (earnedBadgesData) setEarnedBadges(earnedBadgesData);

            // Fetch all profiles for leaderboard
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('*')
                .order('total_points', { ascending: false });
            if (profilesData) setProfiles(profilesData);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // Load data on mount
    useEffect(() => {
        if (isDemoMode) {
            // Demo mode: use localStorage with fallback to fresh SEED_DATA
            const storedActivities = localStorage.getItem('impactlog_activities');
            const storedNotifications = localStorage.getItem('impactlog_notifications');
            const storedChallenges = localStorage.getItem('impactlog_challenges');

            // Parse or generate fresh data
            let activitiesData = [];
            let notificationsData = [];
            let challengesData = [];

            try {
                activitiesData = storedActivities ? JSON.parse(storedActivities) : [];
            } catch (e) {
                console.error('Error parsing activities:', e);
            }

            try {
                notificationsData = storedNotifications ? JSON.parse(storedNotifications) : [];
            } catch (e) {
                console.error('Error parsing notifications:', e);
            }

            try {
                challengesData = storedChallenges ? JSON.parse(storedChallenges) : [];
            } catch (e) {
                console.error('Error parsing challenges:', e);
            }

            // If any data is empty, use seed data and save to localStorage
            if (activitiesData.length === 0) {
                activitiesData = SEED_DATA.activities;
                localStorage.setItem('impactlog_activities', JSON.stringify(activitiesData));
            }
            if (notificationsData.length === 0) {
                notificationsData = SEED_DATA.notifications;
                localStorage.setItem('impactlog_notifications', JSON.stringify(notificationsData));
            }
            if (challengesData.length === 0) {
                challengesData = SEED_DATA.challenges;
                localStorage.setItem('impactlog_challenges', JSON.stringify(challengesData));
            }

            setActivities(activitiesData);
            setNotifications(notificationsData);
            setChallenges(challengesData);
            setBadges(BADGES);
            setEarnedBadges(EARNED_BADGES);
            setLoading(false);
        } else {
            fetchSupabaseData().then(() => setLoading(false));
        }
    }, [user, isDemoMode]);

    // Persist to localStorage in demo mode
    useEffect(() => {
        if (isDemoMode && activities.length > 0) {
            localStorage.setItem('impactlog_activities', JSON.stringify(activities));
        }
    }, [activities]);

    useEffect(() => {
        if (isDemoMode && notifications.length > 0) {
            localStorage.setItem('impactlog_notifications', JSON.stringify(notifications));
        }
    }, [notifications]);

    useEffect(() => {
        if (isDemoMode && challenges.length > 0) {
            localStorage.setItem('impactlog_challenges', JSON.stringify(challenges));
        }
    }, [challenges]);

    // Get user's activities
    const getUserActivities = useCallback(() => {
        if (!user) return [];
        return activities.filter(a => a.user_id === user.id);
    }, [activities, user]);

    // Get pending activities (for manager)
    const getPendingActivities = useCallback(() => {
        return activities.filter(a => a.status === 'pending');
    }, [activities]);

    // Get team activities (for manager)
    const getTeamActivities = useCallback(() => {
        return activities;
    }, [activities]);

    // Submit new activity
    const submitActivity = useCallback(async (activityData) => {
        const newActivity = {
            id: `act-${Date.now()}`,
            user_id: user?.id,
            user_name: user?.full_name,
            ...activityData,
            co2_saved: calculateCO2Saved(activityData.activity_type, activityData.quantity || activityData.hours),
            impact_score: calculateImpactScore(activityData.activity_type, activityData.quantity || activityData.hours),
            status: 'pending',
            created_at: new Date().toISOString(),
        };

        if (!isDemoMode) {
            const { data, error } = await supabase
                .from('activities')
                .insert([{
                    user_id: user?.id,
                    activity_type: activityData.activity_type,
                    description: activityData.description,
                    quantity: activityData.quantity,
                    hours: activityData.hours,
                    activity_date: activityData.activity_date,
                    photo_url: activityData.photo_url,
                    location: activityData.location,
                    co2_saved: newActivity.co2_saved,
                    impact_score: newActivity.impact_score,
                }])
                .select()
                .single();

            if (error) {
                console.error('Error submitting activity:', error);
                return null;
            }

            setActivities(prev => [{ ...data, user_name: user?.full_name }, ...prev]);
            return data;
        }

        setActivities(prev => [newActivity, ...prev]);
        addNotification({
            user_id: 'mgr-001',
            title: 'New Activity Submitted',
            message: `${user?.full_name} submitted a new ${activityData.activity_type} activity.`,
        });

        return newActivity;
    }, [user]);

    // Approve activity
    const approveActivity = useCallback(async (activityId, comment = '') => {
        const updateData = {
            status: 'approved',
            reviewer_id: user?.id,
            reviewer_comment: comment,
            reviewed_at: new Date().toISOString(),
        };

        if (!isDemoMode) {
            const { error } = await supabase
                .from('activities')
                .update(updateData)
                .eq('id', activityId);

            if (error) {
                console.error('Error approving activity:', error);
                return;
            }
        }

        setActivities(prev => prev.map(a =>
            a.id === activityId ? { ...a, ...updateData } : a
        ));

        const activity = activities.find(a => a.id === activityId);
        if (activity) {
            addNotification({
                user_id: activity.user_id,
                title: 'Activity Approved! 🎉',
                message: `Your ${activity.activity_type} activity has been approved${comment ? `: "${comment}"` : '.'}`,
            });
        }
    }, [activities, user]);

    // Reject activity
    const rejectActivity = useCallback(async (activityId, comment = '') => {
        const updateData = {
            status: 'rejected',
            reviewer_id: user?.id,
            reviewer_comment: comment,
            reviewed_at: new Date().toISOString(),
        };

        if (!isDemoMode) {
            const { error } = await supabase
                .from('activities')
                .update(updateData)
                .eq('id', activityId);

            if (error) {
                console.error('Error rejecting activity:', error);
                return;
            }
        }

        setActivities(prev => prev.map(a =>
            a.id === activityId ? { ...a, ...updateData } : a
        ));

        const activity = activities.find(a => a.id === activityId);
        if (activity) {
            addNotification({
                user_id: activity.user_id,
                title: 'Activity Needs Revision',
                message: `Your ${activity.activity_type} activity was not approved${comment ? `: "${comment}"` : '.'}`,
            });
        }
    }, [activities, user]);

    // Add notification
    const addNotification = useCallback(async (notificationData) => {
        const newNotification = {
            id: `notif-${Date.now()}`,
            ...notificationData,
            is_read: false,
            created_at: new Date().toISOString(),
        };

        if (!isDemoMode) {
            const { error } = await supabase
                .from('notifications')
                .insert([{
                    user_id: notificationData.user_id,
                    title: notificationData.title,
                    message: notificationData.message,
                }]);

            if (error) {
                console.error('Error adding notification:', error);
            }
        }

        if (notificationData.user_id === user?.id) {
            setNotifications(prev => [newNotification, ...prev]);
        }
    }, [user]);

    // Mark notification as read
    const markNotificationRead = useCallback(async (notificationId) => {
        if (!isDemoMode) {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId);
        }

        setNotifications(prev => prev.map(n =>
            n.id === notificationId ? { ...n, is_read: true } : n
        ));
    }, []);

    // Mark all notifications as read
    const markAllNotificationsRead = useCallback(async () => {
        if (!isDemoMode && user?.id) {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user.id);
        }

        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }, [user]);

    // Get user's notifications
    const getUserNotifications = useCallback(() => {
        if (!user) return [];
        return notifications.filter(n => n.user_id === user.id);
    }, [notifications, user]);

    // Get unread notification count
    const getUnreadCount = useCallback(() => {
        if (!user) return 0;
        return notifications.filter(n => n.user_id === user.id && !n.is_read).length;
    }, [notifications, user]);

    // Get user's earned badges
    const getUserBadges = useCallback(() => {
        if (!user) return [];
        const badgeList = isDemoMode ? BADGES : badges;
        const earnedList = isDemoMode ? EARNED_BADGES : earnedBadges;
        const earnedIds = earnedList
            .filter(eb => eb.user_id === user.id)
            .map(eb => eb.badge_id);
        return badgeList.filter(b => earnedIds.includes(b.id));
    }, [user, badges, earnedBadges]);

    // Get all badges with earned status
    const getAllBadges = useCallback(() => {
        const badgeList = isDemoMode ? BADGES : badges;
        const earnedList = isDemoMode ? EARNED_BADGES : earnedBadges;
        if (!user) return badgeList.map(b => ({ ...b, earned: false }));
        const earnedIds = earnedList
            .filter(eb => eb.user_id === user.id)
            .map(eb => eb.badge_id);
        return badgeList.map(b => ({ ...b, earned: earnedIds.includes(b.id) }));
    }, [user, badges, earnedBadges]);

    // Get leaderboard
    const getLeaderboard = useCallback(() => {
        if (isDemoMode) {
            const allUsers = [DEMO_USERS.employee, DEMO_USERS.manager, ...TEAM_MEMBERS];
            return allUsers
                .map(u => ({
                    ...u,
                    badgeCount: EARNED_BADGES.filter(eb => eb.user_id === u.id).length,
                }))
                .sort((a, b) => b.total_points - a.total_points);
        }

        return profiles.map(p => ({
            ...p,
            badgeCount: earnedBadges.filter(eb => eb.user_id === p.id).length,
        }));
    }, [profiles, earnedBadges]);

    // Get team members
    const getTeamMembers = useCallback(() => {
        if (isDemoMode) {
            return [DEMO_USERS.employee, DEMO_USERS.manager, ...TEAM_MEMBERS];
        }
        return profiles;
    }, [profiles]);

    // Join a challenge
    const joinChallenge = useCallback(async (challengeId) => {
        if (!user) return;

        if (!isDemoMode) {
            const { error } = await supabase
                .from('challenge_participants')
                .insert([{ challenge_id: challengeId, user_id: user.id }]);

            if (error) {
                console.error('Error joining challenge:', error);
                return;
            }
        }

        setChallenges(prev => prev.map(c => {
            if (c.id === challengeId) {
                const joinedUsers = c.joined_users || [];
                if (joinedUsers.includes(user.id)) return c;
                return {
                    ...c,
                    participants: (c.participants || 0) + 1,
                    joined_users: [...joinedUsers, user.id],
                };
            }
            return c;
        }));

        addNotification({
            user_id: user.id,
            title: 'Challenge Joined! 🎯',
            message: `You've joined a new challenge. Good luck!`,
        });
    }, [user, addNotification]);

    // Check if user has joined a challenge
    const hasJoinedChallenge = useCallback((challengeId) => {
        if (!user) return false;
        const challenge = challenges.find(c => c.id === challengeId);
        return challenge?.joined_users?.includes(user.id) || false;
    }, [user, challenges]);

    // Create challenge
    const createChallenge = useCallback(async (challengeData) => {
        if (!isDemoMode) {
            const { data, error } = await supabase
                .from('challenges')
                .insert([{
                    title: challengeData.title,
                    description: challengeData.description,
                    target_value: challengeData.target_value,
                    activity_type: challengeData.activity_type,
                    start_date: challengeData.start_date,
                    end_date: challengeData.end_date,
                    points_reward: challengeData.points_reward,
                    created_by: user?.id,
                }])
                .select()
                .single();

            if (error) {
                console.error('Error creating challenge:', error);
                return null;
            }

            const newChallenge = { ...data, participants: 0, joined_users: [] };
            setChallenges(prev => [...prev, newChallenge]);
            return newChallenge;
        }

        const newChallenge = {
            id: `chal-${Date.now()}`,
            current_progress: 0,
            participants: 0,
            joined_users: [],
            is_active: true,
            ...challengeData,
        };

        setChallenges(prev => [...prev, newChallenge]);
        addNotification({
            user_id: user?.id,
            title: 'Challenge Created',
            message: `New challenge "${challengeData.title}" has been created.`,
        });

        return newChallenge;
    }, [user, addNotification]);

    // Update challenge
    const updateChallenge = useCallback(async (challengeId, updates) => {
        if (!isDemoMode) {
            const { error } = await supabase
                .from('challenges')
                .update(updates)
                .eq('id', challengeId);

            if (error) {
                console.error('Error updating challenge:', error);
                return;
            }
        }

        setChallenges(prev => prev.map(c =>
            c.id === challengeId ? { ...c, ...updates } : c
        ));
    }, []);

    // Delete challenge
    const deleteChallenge = useCallback(async (challengeId) => {
        if (!isDemoMode) {
            const { error } = await supabase
                .from('challenges')
                .delete()
                .eq('id', challengeId);

            if (error) {
                console.error('Error deleting challenge:', error);
                return;
            }
        }

        setChallenges(prev => prev.filter(c => c.id !== challengeId));
    }, []);

    // Get challenge participants with their details
    const getChallengeParticipants = useCallback((challengeId) => {
        const challenge = challenges.find(c => c.id === challengeId);
        if (!challenge || !challenge.joined_users) return [];

        const allUsers = isDemoMode
            ? [DEMO_USERS.employee, DEMO_USERS.manager, ...TEAM_MEMBERS]
            : profiles;

        const participants = challenge.joined_users.map(userId => {
            const userData = allUsers.find(u => u.id === userId);
            if (!userData) return null;

            const participantActivities = activities.filter(a =>
                a.user_id === userId &&
                a.status === 'approved' &&
                new Date(a.activity_date) >= new Date(challenge.start_date) &&
                new Date(a.activity_date) <= new Date(challenge.end_date) &&
                (!challenge.activity_type || a.activity_type === challenge.activity_type)
            );

            const contribution = participantActivities.reduce((sum, a) => {
                return sum + (a.co2_saved || a.quantity || a.hours || 0);
            }, 0);

            const progress = Math.min((contribution / challenge.target_value) * 100, 100);

            return {
                ...userData,
                contribution,
                progress,
                activitiesCount: participantActivities.length,
                joinedAt: new Date().toISOString(),
            };
        }).filter(Boolean);

        return participants.sort((a, b) => b.progress - a.progress);
    }, [challenges, activities, profiles]);

    // Get overall challenge progress
    const getChallengeProgress = useCallback((challengeId) => {
        const challenge = challenges.find(c => c.id === challengeId);
        if (!challenge) return { total: 0, percentage: 0, completed: 0 };

        const joinedUserIds = challenge.joined_users || [];
        let totalContribution = 0;
        let completedCount = 0;

        joinedUserIds.forEach(userId => {
            const participantActivities = activities.filter(a =>
                a.user_id === userId &&
                a.status === 'approved' &&
                new Date(a.activity_date) >= new Date(challenge.start_date) &&
                new Date(a.activity_date) <= new Date(challenge.end_date) &&
                (!challenge.activity_type || a.activity_type === challenge.activity_type)
            );

            const contribution = participantActivities.reduce((sum, a) => {
                return sum + (a.co2_saved || a.quantity || a.hours || 0);
            }, 0);

            totalContribution += contribution;
            if (contribution >= challenge.target_value) {
                completedCount++;
            }
        });

        return {
            total: totalContribution,
            percentage: challenge.target_value > 0
                ? Math.min((totalContribution / (challenge.target_value * Math.max(joinedUserIds.length, 1))) * 100, 100)
                : 0,
            completed: completedCount,
        };
    }, [challenges, activities]);

    const value = {
        activities,
        notifications,
        challenges,
        loading,
        getUserActivities,
        getPendingActivities,
        getTeamActivities,
        submitActivity,
        approveActivity,
        rejectActivity,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        getUserNotifications,
        getUnreadCount,
        getUserBadges,
        getAllBadges,
        getLeaderboard,
        getTeamMembers,
        joinChallenge,
        hasJoinedChallenge,
        createChallenge,
        updateChallenge,
        deleteChallenge,
        getChallengeParticipants,
        getChallengeProgress,
        refetchData: fetchSupabaseData,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
