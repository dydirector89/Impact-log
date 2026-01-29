import { calculateCO2Saved, calculateImpactScore } from './calculations';

// Demo users
export const DEMO_USERS = {
    employee: {
        id: 'emp-001',
        email: 'employee@impactlog.demo',
        password: 'Employee123',
        full_name: 'Alex Johnson',
        role: 'employee',
        department: 'Engineering',
        avatar_url: null,
        total_points: 850,
        created_at: '2025-06-15T10:00:00Z',
    },
    manager: {
        id: 'mgr-001',
        email: 'manager@impactlog.demo',
        password: 'Manager123',
        full_name: 'Sarah Williams',
        role: 'manager',
        department: 'Engineering',
        avatar_url: null,
        total_points: 1250,
        created_at: '2025-03-01T09:00:00Z',
    },
};

// Additional team members for leaderboard
export const TEAM_MEMBERS = [
    { id: 'emp-002', full_name: 'Michael Chen', department: 'Engineering', total_points: 920, role: 'employee' },
    { id: 'emp-003', full_name: 'Emily Rodriguez', department: 'Marketing', total_points: 780, role: 'employee' },
    { id: 'emp-004', full_name: 'David Kim', department: 'Operations', total_points: 1100, role: 'employee' },
    { id: 'emp-005', full_name: 'Jessica Taylor', department: 'HR', total_points: 650, role: 'employee' },
    { id: 'emp-006', full_name: 'Ryan Martinez', department: 'Finance', total_points: 890, role: 'employee' },
    { id: 'emp-007', full_name: 'Amanda Foster', department: 'Engineering', total_points: 720, role: 'employee' },
    { id: 'emp-008', full_name: 'Chris Anderson', department: 'Sales', total_points: 550, role: 'employee' },
];

// Generate sample activities
function generateActivities() {
    const activities = [];
    const now = new Date();

    // Helper function to create a date X days ago
    const daysAgo = (days) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - days).toISOString();

    // Helper function to create a date in a specific month (0 = current month, -1 = last month, etc.)
    const monthsAgo = (months, day) => {
        const date = new Date(now.getFullYear(), now.getMonth() - months, day);
        return date.toISOString();
    };

    // Employee's activities - spread across 6 months for chart data
    const employeeActivities = [
        // Current month activities
        {
            id: 'act-001',
            user_id: 'emp-001',
            user_name: 'Alex Johnson',
            activity_type: 'volunteering',
            description: 'Participated in local beach cleanup event with community volunteers. Collected and sorted plastic waste.',
            hours: 4,
            quantity: 4,
            activity_date: daysAgo(2),
            status: 'approved',
            reviewer_id: 'mgr-001',
            reviewer_comment: 'Great initiative! Thank you for your dedication.',
            reviewed_at: daysAgo(1),
            photo_url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=400',
            location: 'Sunset Beach, California',
        },
        {
            id: 'act-002',
            user_id: 'emp-001',
            user_name: 'Alex Johnson',
            activity_type: 'recycling',
            description: 'Collected and recycled office paper and cardboard boxes from the engineering department.',
            quantity: 15,
            activity_date: daysAgo(5),
            status: 'approved',
            reviewer_id: 'mgr-001',
            reviewer_comment: 'Excellent recycling effort!',
            reviewed_at: daysAgo(4),
            photo_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400',
        },
        {
            id: 'act-003',
            user_id: 'emp-001',
            user_name: 'Alex Johnson',
            activity_type: 'cycling',
            description: 'Commuted to work by bicycle instead of driving for the entire week.',
            quantity: 50,
            activity_date: daysAgo(7),
            status: 'approved',
            reviewer_id: 'mgr-001',
            reviewed_at: daysAgo(6),
        },
        {
            id: 'act-004',
            user_id: 'emp-001',
            user_name: 'Alex Johnson',
            activity_type: 'energy_saving',
            description: 'Implemented power-saving mode on all department computers and monitors.',
            quantity: 120,
            activity_date: daysAgo(10),
            status: 'approved',
            reviewer_id: 'mgr-001',
            reviewed_at: daysAgo(9),
        },
        {
            id: 'act-005',
            user_id: 'emp-001',
            user_name: 'Alex Johnson',
            activity_type: 'tree_planting',
            description: 'Planted trees in the company garden as part of Earth Day initiative.',
            quantity: 5,
            activity_date: daysAgo(1),
            status: 'pending',
            photo_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400',
            location: 'Company Campus, Building A',
        },
        {
            id: 'act-006',
            user_id: 'emp-001',
            user_name: 'Alex Johnson',
            activity_type: 'education',
            description: 'Conducted sustainability awareness workshop for new employees.',
            hours: 2,
            quantity: 2,
            activity_date: daysAgo(3),
            status: 'pending',
        },
        // Last month activities
        {
            id: 'act-007',
            user_id: 'emp-001',
            user_name: 'Alex Johnson',
            activity_type: 'recycling',
            description: 'Organized departmental recycling drive for plastic bottles.',
            quantity: 45,
            activity_date: monthsAgo(1, 15),
            status: 'approved',
            reviewer_id: 'mgr-001',
            reviewed_at: monthsAgo(1, 16),
        },
        {
            id: 'act-008',
            user_id: 'emp-001',
            user_name: 'Alex Johnson',
            activity_type: 'public_transport',
            description: 'Used metro for daily commute entire month.',
            quantity: 200,
            activity_date: monthsAgo(1, 20),
            status: 'approved',
            reviewer_id: 'mgr-001',
            reviewed_at: monthsAgo(1, 21),
        },
        {
            id: 'act-009',
            user_id: 'emp-001',
            user_name: 'Alex Johnson',
            activity_type: 'volunteering',
            description: 'Participated in tree planting community event.',
            hours: 6,
            quantity: 6,
            activity_date: monthsAgo(1, 8),
            status: 'approved',
            reviewer_id: 'mgr-001',
            reviewed_at: monthsAgo(1, 10),
        },
        // 2 months ago
        {
            id: 'act-010',
            user_id: 'emp-001',
            user_name: 'Alex Johnson',
            activity_type: 'cycling',
            description: 'Bike commute to work for two weeks.',
            quantity: 80,
            activity_date: monthsAgo(2, 12),
            status: 'approved',
            reviewer_id: 'mgr-001',
            reviewed_at: monthsAgo(2, 14),
        },
        {
            id: 'act-011',
            user_id: 'emp-001',
            user_name: 'Alex Johnson',
            activity_type: 'energy_saving',
            description: 'LED light installation in home office.',
            quantity: 150,
            activity_date: monthsAgo(2, 5),
            status: 'approved',
            reviewer_id: 'mgr-001',
            reviewed_at: monthsAgo(2, 7),
        },
        {
            id: 'act-012',
            user_id: 'emp-001',
            user_name: 'Alex Johnson',
            activity_type: 'paperless',
            description: 'Digitized personal documents and notes.',
            quantity: 200,
            activity_date: monthsAgo(2, 18),
            status: 'approved',
            reviewer_id: 'mgr-001',
            reviewed_at: monthsAgo(2, 20),
        },
        // 3 months ago
        {
            id: 'act-013',
            user_id: 'emp-001',
            user_name: 'Alex Johnson',
            activity_type: 'recycling',
            description: 'Electronics recycling - old phones and cables.',
            quantity: 8,
            activity_date: monthsAgo(3, 10),
            status: 'approved',
            reviewer_id: 'mgr-001',
            reviewed_at: monthsAgo(3, 12),
        },
        {
            id: 'act-014',
            user_id: 'emp-001',
            user_name: 'Alex Johnson',
            activity_type: 'food_waste_reduction',
            description: 'Started composting at home.',
            quantity: 20,
            activity_date: monthsAgo(3, 22),
            status: 'approved',
            reviewer_id: 'mgr-001',
            reviewed_at: monthsAgo(3, 24),
        },
        // 4 months ago
        {
            id: 'act-015',
            user_id: 'emp-001',
            user_name: 'Alex Johnson',
            activity_type: 'volunteering',
            description: 'Mentored students on environmental science.',
            hours: 8,
            quantity: 8,
            activity_date: monthsAgo(4, 5),
            status: 'approved',
            reviewer_id: 'mgr-001',
            reviewed_at: monthsAgo(4, 8),
        },
        {
            id: 'act-016',
            user_id: 'emp-001',
            user_name: 'Alex Johnson',
            activity_type: 'public_transport',
            description: 'Bus commute for business trips.',
            quantity: 100,
            activity_date: monthsAgo(4, 15),
            status: 'approved',
            reviewer_id: 'mgr-001',
            reviewed_at: monthsAgo(4, 17),
        },
        // 5 months ago
        {
            id: 'act-017',
            user_id: 'emp-001',
            user_name: 'Alex Johnson',
            activity_type: 'tree_planting',
            description: 'Community garden tree planting.',
            quantity: 3,
            activity_date: monthsAgo(5, 20),
            status: 'approved',
            reviewer_id: 'mgr-001',
            reviewed_at: monthsAgo(5, 22),
        },
        {
            id: 'act-018',
            user_id: 'emp-001',
            user_name: 'Alex Johnson',
            activity_type: 'cycling',
            description: 'Started cycling to work.',
            quantity: 30,
            activity_date: monthsAgo(5, 8),
            status: 'approved',
            reviewer_id: 'mgr-001',
            reviewed_at: monthsAgo(5, 10),
        },
    ];

    // Other team members' activities (for manager dashboard)
    const teamActivities = [
        {
            id: 'act-101',
            user_id: 'emp-002',
            user_name: 'Michael Chen',
            activity_type: 'recycling',
            description: 'Organized e-waste collection drive in the IT department.',
            quantity: 25,
            activity_date: daysAgo(1),
            status: 'pending',
            photo_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
        },
        {
            id: 'act-102',
            user_id: 'emp-003',
            user_name: 'Emily Rodriguez',
            activity_type: 'volunteering',
            description: 'Led marketing campaign for company sustainability initiatives.',
            hours: 6,
            quantity: 6,
            activity_date: daysAgo(2),
            status: 'pending',
        },
        {
            id: 'act-103',
            user_id: 'emp-004',
            user_name: 'David Kim',
            activity_type: 'public_transport',
            description: 'Used public transit for business travel instead of rental car.',
            quantity: 120,
            activity_date: daysAgo(3),
            status: 'pending',
        },
        {
            id: 'act-104',
            user_id: 'emp-002',
            user_name: 'Michael Chen',
            activity_type: 'energy_saving',
            description: 'Implemented server virtualization reducing power consumption.',
            quantity: 200,
            activity_date: daysAgo(8),
            status: 'approved',
            reviewer_id: 'mgr-001',
            reviewed_at: daysAgo(7),
        },
        {
            id: 'act-105',
            user_id: 'emp-005',
            user_name: 'Jessica Taylor',
            activity_type: 'paperless',
            description: 'Digitized HR onboarding documents eliminating paper forms.',
            quantity: 500,
            activity_date: daysAgo(12),
            status: 'approved',
            reviewer_id: 'mgr-001',
            reviewed_at: daysAgo(11),
        },
        {
            id: 'act-106',
            user_id: 'emp-006',
            user_name: 'Ryan Martinez',
            activity_type: 'food_waste_reduction',
            description: 'Implemented food waste tracking in office cafeteria.',
            quantity: 30,
            activity_date: daysAgo(4),
            status: 'pending',
            photo_url: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400',
        },
        // More team activities across months
        {
            id: 'act-107',
            user_id: 'emp-002',
            user_name: 'Michael Chen',
            activity_type: 'cycling',
            description: 'Biked to work for environmental week.',
            quantity: 60,
            activity_date: monthsAgo(1, 10),
            status: 'approved',
            reviewer_id: 'mgr-001',
            reviewed_at: monthsAgo(1, 12),
        },
        {
            id: 'act-108',
            user_id: 'emp-003',
            user_name: 'Emily Rodriguez',
            activity_type: 'education',
            description: 'Created sustainability training materials.',
            hours: 10,
            quantity: 10,
            activity_date: monthsAgo(1, 18),
            status: 'approved',
            reviewer_id: 'mgr-001',
            reviewed_at: monthsAgo(1, 20),
        },
        {
            id: 'act-109',
            user_id: 'emp-004',
            user_name: 'David Kim',
            activity_type: 'recycling',
            description: 'Set up recycling stations in operations area.',
            quantity: 35,
            activity_date: monthsAgo(2, 5),
            status: 'approved',
            reviewer_id: 'mgr-001',
            reviewed_at: monthsAgo(2, 7),
        },
        {
            id: 'act-110',
            user_id: 'emp-005',
            user_name: 'Jessica Taylor',
            activity_type: 'volunteering',
            description: 'Organized company volunteering day.',
            hours: 8,
            quantity: 8,
            activity_date: monthsAgo(2, 15),
            status: 'approved',
            reviewer_id: 'mgr-001',
            reviewed_at: monthsAgo(2, 17),
        },
        {
            id: 'act-111',
            user_id: 'emp-006',
            user_name: 'Ryan Martinez',
            activity_type: 'energy_saving',
            description: 'Installed motion sensors in finance department.',
            quantity: 80,
            activity_date: monthsAgo(3, 20),
            status: 'approved',
            reviewer_id: 'mgr-001',
            reviewed_at: monthsAgo(3, 22),
        },
        {
            id: 'act-112',
            user_id: 'emp-007',
            user_name: 'Amanda Foster',
            activity_type: 'tree_planting',
            description: 'Planted fruit trees in office garden.',
            quantity: 4,
            activity_date: monthsAgo(3, 8),
            status: 'approved',
            reviewer_id: 'mgr-001',
            reviewed_at: monthsAgo(3, 10),
        },
        {
            id: 'act-113',
            user_id: 'emp-008',
            user_name: 'Chris Anderson',
            activity_type: 'public_transport',
            description: 'Used train for client visits.',
            quantity: 150,
            activity_date: monthsAgo(4, 12),
            status: 'approved',
            reviewer_id: 'mgr-001',
            reviewed_at: monthsAgo(4, 14),
        },
        {
            id: 'act-114',
            user_id: 'emp-002',
            user_name: 'Michael Chen',
            activity_type: 'paperless',
            description: 'Migrated IT documentation to digital platform.',
            quantity: 300,
            activity_date: monthsAgo(4, 25),
            status: 'approved',
            reviewer_id: 'mgr-001',
            reviewed_at: monthsAgo(4, 27),
        },
        {
            id: 'act-115',
            user_id: 'emp-003',
            user_name: 'Emily Rodriguez',
            activity_type: 'recycling',
            description: 'Marketing materials recycling initiative.',
            quantity: 40,
            activity_date: monthsAgo(5, 5),
            status: 'approved',
            reviewer_id: 'mgr-001',
            reviewed_at: monthsAgo(5, 7),
        },
        {
            id: 'act-116',
            user_id: 'emp-004',
            user_name: 'David Kim',
            activity_type: 'food_waste_reduction',
            description: 'Started food donation program for operations.',
            quantity: 50,
            activity_date: monthsAgo(5, 18),
            status: 'approved',
            reviewer_id: 'mgr-001',
            reviewed_at: monthsAgo(5, 20),
        },
    ];

    // Calculate CO2 and impact scores for all activities
    [...employeeActivities, ...teamActivities].forEach(activity => {
        activity.co2_saved = calculateCO2Saved(activity.activity_type, activity.quantity || activity.hours);
        activity.impact_score = calculateImpactScore(activity.activity_type, activity.quantity || activity.hours);
        activity.created_at = activity.activity_date;
        activities.push(activity);
    });

    return activities;
}

// Badge definitions
export const BADGES = [
    {
        id: 'badge-001',
        name: 'Green Starter',
        description: 'Complete your first sustainability activity',
        icon: '🌱',
        criteria: { activities_count: 1 },
        points: 50,
    },
    {
        id: 'badge-002',
        name: 'Eco Warrior',
        description: 'Complete 10 approved activities',
        icon: '🛡️',
        criteria: { activities_count: 10 },
        points: 200,
    },
    {
        id: 'badge-003',
        name: 'Carbon Cutter',
        description: 'Save 100kg of CO₂',
        icon: '✂️',
        criteria: { co2_saved: 100 },
        points: 300,
    },
    {
        id: 'badge-004',
        name: 'Volunteer Champion',
        description: 'Complete 20 hours of volunteering',
        icon: '🏆',
        criteria: { volunteering_hours: 20 },
        points: 400,
    },
    {
        id: 'badge-005',
        name: 'Recycling Master',
        description: 'Recycle 50kg of materials',
        icon: '♻️',
        criteria: { recycling_quantity: 50 },
        points: 250,
    },
    {
        id: 'badge-006',
        name: 'Tree Hugger',
        description: 'Plant 10 trees',
        icon: '🌳',
        criteria: { trees_planted: 10 },
        points: 350,
    },
    {
        id: 'badge-007',
        name: 'Energy Saver',
        description: 'Save 500 kWh of energy',
        icon: '⚡',
        criteria: { energy_saved: 500 },
        points: 300,
    },
    {
        id: 'badge-008',
        name: 'Sustainability Leader',
        description: 'Reach 1000 total impact points',
        icon: '👑',
        criteria: { total_points: 1000 },
        points: 500,
    },
];

// User earned badges
export const EARNED_BADGES = [
    { user_id: 'emp-001', badge_id: 'badge-001', earned_at: '2025-07-01T10:00:00Z' },
    { user_id: 'emp-001', badge_id: 'badge-002', earned_at: '2025-09-15T14:30:00Z' },
    { user_id: 'emp-001', badge_id: 'badge-003', earned_at: '2025-11-20T09:00:00Z' },
    { user_id: 'emp-001', badge_id: 'badge-005', earned_at: '2025-12-10T16:45:00Z' },
    { user_id: 'mgr-001', badge_id: 'badge-001', earned_at: '2025-04-01T10:00:00Z' },
    { user_id: 'mgr-001', badge_id: 'badge-002', earned_at: '2025-06-15T14:30:00Z' },
    { user_id: 'mgr-001', badge_id: 'badge-003', earned_at: '2025-08-20T09:00:00Z' },
    { user_id: 'mgr-001', badge_id: 'badge-004', earned_at: '2025-10-10T16:45:00Z' },
    { user_id: 'mgr-001', badge_id: 'badge-008', earned_at: '2025-12-01T11:00:00Z' },
];

// Challenge definitions
export const CHALLENGES = [
    {
        id: 'chal-001',
        title: 'January Green Challenge',
        description: 'Save 50kg of CO₂ this month through any activities',
        target_value: 50,
        activity_type: null, // Any activity
        start_date: '2026-01-01',
        end_date: '2026-01-31',
        points_reward: 100,
        is_active: true,
        participants: 5,
        joined_users: ['emp-001', 'emp-002', 'emp-003', 'emp-004', 'mgr-001'],
        current_progress: 32,
    },
    {
        id: 'chal-002',
        title: 'Recycle Week',
        description: 'Recycle 20kg of materials this week',
        target_value: 20,
        activity_type: 'recycling',
        start_date: '2026-01-20',
        end_date: '2026-01-27',
        points_reward: 50,
        is_active: true,
        participants: 3,
        joined_users: ['emp-002', 'emp-005', 'emp-006'],
        current_progress: 12,
    },
    {
        id: 'chal-003',
        title: 'Bike to Work Month',
        description: 'Cycle 100km to work this month',
        target_value: 100,
        activity_type: 'cycling',
        start_date: '2026-01-01',
        end_date: '2026-01-31',
        points_reward: 150,
        is_active: true,
        participants: 2,
        joined_users: ['emp-001', 'emp-007'],
        current_progress: 68,
    },
];

// Sample notifications
export const NOTIFICATIONS = [
    {
        id: 'notif-001',
        user_id: 'emp-001',
        title: 'Activity Approved! 🎉',
        message: 'Your beach cleanup volunteering activity has been approved by Sarah Williams.',
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
        id: 'notif-002',
        user_id: 'emp-001',
        title: 'New Badge Earned! 🏅',
        message: 'Congratulations! You\'ve earned the "Carbon Cutter" badge for saving 100kg of CO₂.',
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    {
        id: 'notif-003',
        user_id: 'emp-001',
        title: 'Challenge Started',
        message: 'The "January Green Challenge" has begun. Join now to earn 100 bonus points!',
        is_read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    },
    {
        id: 'notif-004',
        user_id: 'mgr-001',
        title: 'Pending Approvals',
        message: 'You have 5 new activities pending your review.',
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    },
];

// Generate all seed data
export const SEED_DATA = {
    users: { ...DEMO_USERS, ...Object.fromEntries(TEAM_MEMBERS.map(m => [m.id, m])) },
    activities: generateActivities(),
    badges: BADGES,
    earnedBadges: EARNED_BADGES,
    challenges: CHALLENGES,
    notifications: NOTIFICATIONS,
    teamMembers: [DEMO_USERS.employee, DEMO_USERS.manager, ...TEAM_MEMBERS],
};

/**
 * Initialize demo data in localStorage
 */
export function initializeSeedData() {
    const existingData = localStorage.getItem('impactlog_initialized_v3');

    if (!existingData) {
        // Clear old versions
        localStorage.removeItem('impactlog_initialized');
        localStorage.removeItem('impactlog_initialized_v2');

        localStorage.setItem('impactlog_activities', JSON.stringify(SEED_DATA.activities));
        localStorage.setItem('impactlog_notifications', JSON.stringify(SEED_DATA.notifications));
        localStorage.setItem('impactlog_challenges', JSON.stringify(SEED_DATA.challenges));
        localStorage.setItem('impactlog_initialized_v3', 'true');
    }

    return SEED_DATA;
}

/**
 * Reset demo data
 */
export function resetSeedData() {
    localStorage.removeItem('impactlog_activities');
    localStorage.removeItem('impactlog_notifications');
    localStorage.removeItem('impactlog_challenges');
    localStorage.removeItem('impactlog_initialized');
    localStorage.removeItem('impactlog_user');
    initializeSeedData();
}
