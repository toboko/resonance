/**
 * Helper functions module for utility functions
 */

// Helper function to compare arrays of frequency objects
function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (!a[i] || !b[i]) return false;
        if (a[i].frequency !== b[i].frequency ||
            a[i].mode !== b[i].mode ||
            a[i].p !== b[i].p ||
            a[i].q !== b[i].q ||
            a[i].r !== b[i].r) {
            return false;
        }
    }
    return true;
}

// Export functions
window.arraysEqual = arraysEqual;
