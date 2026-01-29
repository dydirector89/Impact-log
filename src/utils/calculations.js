// CO₂ conversion factors (kg CO₂ saved per unit)
export const CO2_FACTORS = {
    volunteering: 0, // No direct CO₂ impact, but social value
    recycling: 2.5, // kg CO₂ per kg recycled
    energy_saving: 0.5, // kg CO₂ per kWh saved
    water_saving: 0.3, // kg CO₂ per liter saved
    tree_planting: 22, // kg CO₂ per tree per year
    composting: 0.5, // kg CO₂ per kg composted
    public_transport: 0.15, // kg CO₂ per km (vs driving)
    cycling: 0.21, // kg CO₂ per km (vs driving)
    carpooling: 0.1, // kg CO₂ per km shared
    paperless: 0.01, // kg CO₂ per sheet saved
    reusable_items: 0.5, // kg CO₂ per use
    food_waste_reduction: 2.5, // kg CO₂ per kg food saved
    renewable_energy: 0.4, // kg CO₂ per kWh
    education: 0, // No direct CO₂, but awareness value
};

// Impact score calculation weights
export const IMPACT_WEIGHTS = {
    volunteering: 10, // High social impact
    recycling: 5,
    energy_saving: 8,
    water_saving: 4,
    tree_planting: 15,
    composting: 4,
    public_transport: 3,
    cycling: 5,
    carpooling: 3,
    paperless: 2,
    reusable_items: 3,
    food_waste_reduction: 6,
    renewable_energy: 7,
    education: 8,
};

// Activity type metadata
export const ACTIVITY_TYPES = {
    volunteering: {
        label: 'Volunteering',
        unit: 'hours',
        icon: 'VolunteerActivism',
        color: '#8b5cf6',
        description: 'Community service and volunteer work',
    },
    recycling: {
        label: 'Recycling',
        unit: 'kg',
        icon: 'Recycling',
        color: '#10b981',
        description: 'Recycling materials (paper, plastic, glass, metal)',
    },
    energy_saving: {
        label: 'Energy Saving',
        unit: 'kWh',
        icon: 'BoltOutlined',
        color: '#f59e0b',
        description: 'Reducing electricity consumption',
    },
    water_saving: {
        label: 'Water Conservation',
        unit: 'liters',
        icon: 'WaterDrop',
        color: '#3b82f6',
        description: 'Reducing water usage',
    },
    tree_planting: {
        label: 'Tree Planting',
        unit: 'trees',
        icon: 'Park',
        color: '#059669',
        description: 'Planting trees and vegetation',
    },
    composting: {
        label: 'Composting',
        unit: 'kg',
        icon: 'Compost',
        color: '#84cc16',
        description: 'Composting organic waste',
    },
    public_transport: {
        label: 'Public Transport',
        unit: 'km',
        icon: 'DirectionsBus',
        color: '#6366f1',
        description: 'Using public transportation instead of driving',
    },
    cycling: {
        label: 'Cycling/Walking',
        unit: 'km',
        icon: 'DirectionsBike',
        color: '#ec4899',
        description: 'Cycling or walking instead of driving',
    },
    carpooling: {
        label: 'Carpooling',
        unit: 'km',
        icon: 'Groups',
        color: '#14b8a6',
        description: 'Sharing rides with colleagues',
    },
    paperless: {
        label: 'Paperless Initiative',
        unit: 'sheets',
        icon: 'Description',
        color: '#0ea5e9',
        description: 'Reducing paper usage',
    },
    reusable_items: {
        label: 'Reusable Items',
        unit: 'uses',
        icon: 'ShoppingBag',
        color: '#f97316',
        description: 'Using reusable bags, bottles, containers',
    },
    food_waste_reduction: {
        label: 'Food Waste Reduction',
        unit: 'kg',
        icon: 'NoFood',
        color: '#ef4444',
        description: 'Reducing food waste',
    },
    renewable_energy: {
        label: 'Renewable Energy',
        unit: 'kWh',
        icon: 'SolarPower',
        color: '#fbbf24',
        description: 'Using renewable energy sources',
    },
    education: {
        label: 'Sustainability Education',
        unit: 'hours',
        icon: 'School',
        color: '#a855f7',
        description: 'Teaching or learning about sustainability',
    },
};

/**
 * Calculate CO₂ saved for an activity
 * @param {string} activityType - Type of activity
 * @param {number} quantity - Amount/hours/distance
 * @returns {number} CO₂ saved in kg
 */
export function calculateCO2Saved(activityType, quantity) {
    const factor = CO2_FACTORS[activityType] || 0;
    return Math.round(factor * quantity * 100) / 100;
}

/**
 * Calculate impact score for an activity
 * @param {string} activityType - Type of activity
 * @param {number} quantity - Amount/hours/distance
 * @returns {number} Impact score
 */
export function calculateImpactScore(activityType, quantity) {
    const weight = IMPACT_WEIGHTS[activityType] || 1;
    return Math.round(weight * quantity * 10) / 10;
}

/**
 * Calculate total CSR hours
 * @param {Array} activities - List of activities
 * @returns {number} Total hours
 */
export function calculateTotalCSRHours(activities) {
    return activities
        .filter(a => a.status === 'approved')
        .reduce((total, activity) => {
            if (ACTIVITY_TYPES[activity.activity_type]?.unit === 'hours') {
                return total + (activity.hours || activity.quantity || 0);
            }
            return total;
        }, 0);
}

/**
 * Calculate total CO₂ saved
 * @param {Array} activities - List of activities
 * @returns {number} Total CO₂ in kg
 */
export function calculateTotalCO2Saved(activities) {
    return activities
        .filter(a => a.status === 'approved')
        .reduce((total, activity) => {
            return total + (activity.co2_saved || 0);
        }, 0);
}

/**
 * Calculate total impact score
 * @param {Array} activities - List of activities
 * @returns {number} Total impact score
 */
export function calculateTotalImpactScore(activities) {
    return activities
        .filter(a => a.status === 'approved')
        .reduce((total, activity) => {
            return total + (activity.impact_score || 0);
        }, 0);
}

/**
 * Get statistics breakdown by activity type
 * @param {Array} activities - List of activities
 * @returns {Object} Stats by type
 */
export function getStatsByActivityType(activities) {
    const approved = activities.filter(a => a.status === 'approved');
    const stats = {};

    Object.keys(ACTIVITY_TYPES).forEach(type => {
        const typeActivities = approved.filter(a => a.activity_type === type);
        stats[type] = {
            count: typeActivities.length,
            totalQuantity: typeActivities.reduce((sum, a) => sum + (a.quantity || a.hours || 0), 0),
            totalCO2: typeActivities.reduce((sum, a) => sum + (a.co2_saved || 0), 0),
            totalImpact: typeActivities.reduce((sum, a) => sum + (a.impact_score || 0), 0),
        };
    });

    return stats;
}

/**
 * Get monthly trends
 * @param {Array} activities - List of activities
 * @param {number} months - Number of months to analyze
 * @returns {Array} Monthly data
 */
export function getMonthlyTrends(activities, months = 6) {
    const approved = activities.filter(a => a.status === 'approved');
    const trends = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const monthActivities = approved.filter(a => {
            const actDate = new Date(a.activity_date || a.created_at);
            return actDate >= date && actDate <= monthEnd;
        });

        trends.push({
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            year: date.getFullYear(),
            activities: monthActivities.length,
            co2Saved: monthActivities.reduce((sum, a) => sum + (a.co2_saved || 0), 0),
            impactScore: monthActivities.reduce((sum, a) => sum + (a.impact_score || 0), 0),
            csrHours: monthActivities
                .filter(a => ACTIVITY_TYPES[a.activity_type]?.unit === 'hours')
                .reduce((sum, a) => sum + (a.hours || a.quantity || 0), 0),
        });
    }

    return trends;
}

/**
 * Format CO₂ value for display
 * @param {number} value - CO₂ in kg
 * @returns {string} Formatted string
 */
export function formatCO2(value) {
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}t`;
    }
    return `${value.toFixed(1)}kg`;
}

/**
 * Format large numbers
 * @param {number} value - Number to format
 * @returns {string} Formatted string
 */
export function formatNumber(value) {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
}
