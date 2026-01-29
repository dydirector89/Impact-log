import { ACTIVITY_TYPES } from './calculations';

/**
 * AI Validation flags for activity submissions
 */
export const VALIDATION_FLAGS = {
    MISSING_DESCRIPTION: 'missing_description',
    SHORT_DESCRIPTION: 'short_description',
    MISSING_PHOTO: 'missing_photo',
    EXCESSIVE_QUANTITY: 'excessive_quantity',
    DUPLICATE_SUBMISSION: 'duplicate_submission',
    FUTURE_DATE: 'future_date',
    SUSPICIOUS_PATTERN: 'suspicious_pattern',
    MISSING_LOCATION: 'missing_location_for_outdoor',
};

/**
 * Thresholds for validation
 */
const THRESHOLDS = {
    min_description_length: 10,
    max_daily_hours: 12,
    max_daily_quantity: {
        recycling: 100, // kg
        energy_saving: 500, // kWh
        water_saving: 1000, // liters
        tree_planting: 50, // trees
        composting: 50, // kg
        public_transport: 200, // km
        cycling: 100, // km
        carpooling: 200, // km
        paperless: 1000, // sheets
        reusable_items: 50, // uses
        food_waste_reduction: 50, // kg
        renewable_energy: 500, // kWh
        volunteering: 12, // hours
        education: 8, // hours
    },
};

/**
 * Outdoor activities that should have location
 */
const OUTDOOR_ACTIVITIES = [
    'tree_planting',
    'volunteering',
    'cycling',
    'public_transport',
];

/**
 * Validate an activity submission
 * @param {Object} activity - Activity data
 * @param {Array} existingActivities - User's existing activities
 * @returns {Object} Validation result with flags and messages
 */
export function validateActivity(activity, existingActivities = []) {
    const flags = [];
    const warnings = [];
    const errors = [];

    // Check for missing or short description
    if (!activity.description || activity.description.trim() === '') {
        flags.push(VALIDATION_FLAGS.MISSING_DESCRIPTION);
        errors.push('Description is required');
    } else if (activity.description.trim().length < THRESHOLDS.min_description_length) {
        flags.push(VALIDATION_FLAGS.SHORT_DESCRIPTION);
        warnings.push('Description is very short. Please provide more details.');
    }

    // Check for missing photo (warning only)
    if (!activity.photo_url && !activity.photo) {
        flags.push(VALIDATION_FLAGS.MISSING_PHOTO);
        warnings.push('Consider adding a photo as proof of your activity.');
    }

    // Check for excessive quantity
    const quantity = activity.quantity || activity.hours || 0;
    const maxQuantity = THRESHOLDS.max_daily_quantity[activity.activity_type] || 100;

    if (quantity > maxQuantity) {
        flags.push(VALIDATION_FLAGS.EXCESSIVE_QUANTITY);
        warnings.push(`The quantity (${quantity}) seems unusually high for a single day. Please verify.`);
    }

    // Check for future date
    const activityDate = new Date(activity.activity_date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (activityDate > today) {
        flags.push(VALIDATION_FLAGS.FUTURE_DATE);
        errors.push('Activity date cannot be in the future.');
    }

    // Check for duplicate submission (same type, same day)
    const sameDay = existingActivities.filter(a => {
        const existingDate = new Date(a.activity_date).toDateString();
        const newDate = activityDate.toDateString();
        return a.activity_type === activity.activity_type && existingDate === newDate;
    });

    if (sameDay.length > 0) {
        flags.push(VALIDATION_FLAGS.DUPLICATE_SUBMISSION);
        warnings.push('You already have a similar activity logged for this date.');
    }

    // Check for suspicious patterns (multiple high-value submissions in short time)
    const last7Days = existingActivities.filter(a => {
        const date = new Date(a.activity_date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date >= weekAgo;
    });

    if (last7Days.length >= 20) {
        flags.push(VALIDATION_FLAGS.SUSPICIOUS_PATTERN);
        warnings.push('High submission frequency detected. Manager review recommended.');
    }

    // Check for location on outdoor activities
    if (OUTDOOR_ACTIVITIES.includes(activity.activity_type) && !activity.location) {
        flags.push(VALIDATION_FLAGS.MISSING_LOCATION);
        warnings.push('Location is recommended for outdoor activities.');
    }

    return {
        isValid: errors.length === 0,
        flags,
        warnings,
        errors,
        requiresReview: flags.some(f => [
            VALIDATION_FLAGS.EXCESSIVE_QUANTITY,
            VALIDATION_FLAGS.SUSPICIOUS_PATTERN,
            VALIDATION_FLAGS.DUPLICATE_SUBMISSION,
        ].includes(f)),
    };
}

/**
 * Get flag severity level
 * @param {string} flag - Validation flag
 * @returns {string} 'error' | 'warning' | 'info'
 */
export function getFlagSeverity(flag) {
    const errorFlags = [
        VALIDATION_FLAGS.MISSING_DESCRIPTION,
        VALIDATION_FLAGS.FUTURE_DATE,
    ];

    const warningFlags = [
        VALIDATION_FLAGS.EXCESSIVE_QUANTITY,
        VALIDATION_FLAGS.DUPLICATE_SUBMISSION,
        VALIDATION_FLAGS.SUSPICIOUS_PATTERN,
    ];

    if (errorFlags.includes(flag)) return 'error';
    if (warningFlags.includes(flag)) return 'warning';
    return 'info';
}

/**
 * Get human-readable flag description
 * @param {string} flag - Validation flag
 * @returns {string} Description
 */
export function getFlagDescription(flag) {
    const descriptions = {
        [VALIDATION_FLAGS.MISSING_DESCRIPTION]: 'Missing description',
        [VALIDATION_FLAGS.SHORT_DESCRIPTION]: 'Description too short',
        [VALIDATION_FLAGS.MISSING_PHOTO]: 'No photo proof',
        [VALIDATION_FLAGS.EXCESSIVE_QUANTITY]: 'Unusually high quantity',
        [VALIDATION_FLAGS.DUPLICATE_SUBMISSION]: 'Possible duplicate',
        [VALIDATION_FLAGS.FUTURE_DATE]: 'Future date not allowed',
        [VALIDATION_FLAGS.SUSPICIOUS_PATTERN]: 'Unusual submission pattern',
        [VALIDATION_FLAGS.MISSING_LOCATION]: 'Location recommended',
    };

    return descriptions[flag] || flag;
}

/**
 * Validate required fields
 * @param {Object} activity - Activity data
 * @returns {Object} Field validation errors
 */
export function validateRequiredFields(activity) {
    const errors = {};

    if (!activity.activity_type) {
        errors.activity_type = 'Please select an activity type';
    }

    if (!activity.description || activity.description.trim() === '') {
        errors.description = 'Description is required';
    }

    const quantity = activity.quantity || activity.hours;
    if (!quantity || quantity <= 0) {
        errors.quantity = 'Please enter a valid quantity/hours';
    }

    if (!activity.activity_date) {
        errors.activity_date = 'Please select a date';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}
