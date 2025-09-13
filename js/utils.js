import { DEFAULTS, COLORS, CHART_CONFIG } from './constants.js';

/**
 * Determines the type of mode based on the indices p, q, r.
 *
 * @param {number} p - The index for the length dimension (x-axis)
 * @param {number} q - The index for the width dimension (y-axis)
 * @param {number} r - The index for the height dimension (z-axis)
 *
 * @returns {string} - 'axial' if only one of p, q, or r is non-zero,
 *                     'tangential' if two are non-zero,
 *                     'oblique' if all three are non-zero
 */
export function getModeType(p, q, r) {
    // Count how many dimensions have a non-zero index
    const nonZeroCount = (p > 0 ? 1 : 0) + (q > 0 ? 1 : 0) + (r > 0 ? 1 : 0);

    // Determine mode type based on the count of non-zero indices
    if (nonZeroCount === 1) {
        return 'axial'; // Only one dimension is active - axial mode
    } else if (nonZeroCount === 2) {
        return 'tangential'; // Two dimensions are active - tangential mode
    } else {
        return 'oblique'; // All three dimensions are active - oblique mode
    }
}

/**
 * Gets color for mode type
 *
 * @param {string} type - Mode type ('axial', 'tangential', 'oblique')
 * @returns {string} - Color hex code
 */
export function getModeTypeColor(type) {
    switch (type) {
        case 'axial': return COLORS.AXIAL;
        case 'tangential': return COLORS.TANGENTIAL;
        case 'oblique': return COLORS.OBLIQUE;
        default: return COLORS.AXIS;
    }
}

/**
 * Gets color for dimension
 *
 * @param {string} dimension - Dimension name
 * @returns {string} - Color hex code
 */
export function getDimensionColor(dimension) {
    switch (dimension) {
        case 'Lunghezza': return COLORS.LENGTH;
        case 'Larghezza': return COLORS.WIDTH;
        case 'Altezza': return COLORS.HEIGHT;
        default: return COLORS.AXIS;
    }
}

/**
 * Calculates opacity based on complexity or mode number
 *
 * @param {number} complexity - Complexity value (higher = more complex)
 * @param {number} baseOpacity - Base opacity value
 * @param {number} minOpacity - Minimum opacity value
 * @param {number} step - Opacity decrease step
 * @returns {number} - Calculated opacity
 */
export function calculateOpacity(complexity, baseOpacity = CHART_CONFIG.OPACITY.BASE,
                                minOpacity = CHART_CONFIG.OPACITY.MIN,
                                step = CHART_CONFIG.OPACITY.STEP) {
    return Math.max(baseOpacity - complexity * step, minOpacity);
}

/**
 * Groups data by a specified key
 *
 * @param {Array} data - Array of data objects
 * @param {string} key - Key to group by
 * @returns {object} - Grouped data object
 */
export function groupBy(data, key) {
    return data.reduce((groups, item) => {
        const groupKey = item[key];
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        return groups;
    }, {});
}

/**
 * Finds the maximum value in an array of objects by key
 *
 * @param {Array} data - Array of objects
 * @param {string} key - Key to find max value for
 * @returns {number} - Maximum value
 */
export function findMaxValue(data, key) {
    return Math.max(...data.map(item => parseFloat(item[key])));
}
