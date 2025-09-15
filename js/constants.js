// Default values and constants for the resonance calculator
const DEFAULTS = {
    SOUND_SPEED_AIR_0C: 331, // Default sound speed in air at 0°C (m/s)
    SOUND_SPEED_AIR_20C: 343, // Default sound speed in air at 20°C (m/s)
    DEFAULT_MAX_MODES: 10, // Default maximum mode index
    CHART_PADDING: 60,
    FREQUENCY_PADDING: 80, // Hz padding for chart scaling
    STANDING_WAVES_PADDING: 80, // Hz padding for standing waves chart
    RESULTS_GROUP_SIZE: 10, // Number of results per group in tables
    MARKER_RADIUS: 8,
    NUM_TICKS: 10
};

// Color schemes for different types of modes and dimensions
const COLORS = {
    // Mode types
    AXIAL: '#ff6384',      // Red
    TANGENTIAL: '#36a2eb', // Blue
    OBLIQUE: '#ffce56',    // Yellow

    // Combined signal
    COMBINED: '#9c88ff',   // Purple

    // Dimensions
    LENGTH: '#ff6384',     // Red
    WIDTH: '#36a2eb',      // Blue
    HEIGHT: '#4bc0c0',     // Teal

    // Chart elements
    AXIS: '#000',
    TEXT: '#000',
    LEGEND_TEXT: '#666'
};

// Mode type labels (Italian)
const MODE_LABELS = {
    AXIAL: 'Assiale',
    TANGENTIAL: 'Tangenziale',
    OBLIQUE: 'Obliqua'
};

// Dimension labels (Italian)
const DIMENSION_LABELS = {
    LENGTH: 'Lunghezza',
    WIDTH: 'Larghezza',
    HEIGHT: 'Altezza'
};

// Chart configuration
const CHART_CONFIG = {
    FONT_SIZE: {
        TICK_LABEL: '0.85rem Inter, sans-serif',
        AXIS_LABEL: '0.875rem Inter, sans-serif',
        LEGEND: '0.85rem Inter, sans-serif',
        BOLD: 'bold 0.75rem Inter, sans-serif'
    },
    OPACITY: {
        BASE: 1.0,
        MIN: 0.3,
        STEP: 0.1
    }
};

// Form field IDs
const FORM_IDS = {
    // Resonance tab
    ROOM_LENGTH: 'room-length',
    ROOM_WIDTH: 'room-width',
    ROOM_HEIGHT: 'room-height',
    SOUND_SPEED: 'sound-speed',
    CUSTOM_SOUND_SPEED_CONTAINER: 'custom-sound-speed-container',
    CUSTOM_SOUND_SPEED: 'custom-sound-speed',
    MAX_MODES: 'max-modes',
    CUSTOM_MAX_MODES_CONTAINER: 'custom-max-modes-container',
    CUSTOM_MAX_MODES: 'custom-max-modes',

    // Standing waves tab
    SW_LENGTH: 'sw-length',
    SW_WIDTH: 'sw-width',
    SW_HEIGHT: 'sw-height',
    SW_SOUND_SPEED: 'sw-sound-speed',
    SW_CUSTOM_SOUND_SPEED_CONTAINER: 'sw-custom-sound-speed-container',
    SW_CUSTOM_SOUND_SPEED: 'sw-custom-sound-speed',
    SW_MAX_MODES: 'sw-max-modes',
    SW_CUSTOM_MAX_MODES_CONTAINER: 'sw-custom-max-modes-container',
    SW_CUSTOM_MAX_MODES: 'sw-custom-max-modes',

    // Buttons
    CALCULATE_RESONANCE: 'calculate-resonance',
    CALCULATE_STANDING_WAVES: 'calculate-standing-waves'
};

// Result container IDs
const RESULT_IDS = {
    AXIAL_RESULTS: 'axial-results',
    TANGENTIAL_RESULTS: 'tangential-results',
    OBLIQUE_RESULTS: 'oblique-results',
    STANDING_WAVES_RESULTS: 'standing-waves-results',
    FREQUENCY_CHART: 'frequency-chart',
    STANDING_WAVES_CHART: 'standing-waves-chart'
};

// Tab IDs
const TAB_IDS = {
    RESONANCE: 'resonance',
    STANDING_WAVES: 'standing-waves'
};

// Make constants available globally
window.DEFAULTS = DEFAULTS;
window.COLORS = COLORS;
window.MODE_LABELS = MODE_LABELS;
window.DIMENSION_LABELS = DIMENSION_LABELS;
window.CHART_CONFIG = CHART_CONFIG;
window.FORM_IDS = FORM_IDS;
window.RESULT_IDS = RESULT_IDS;
window.TAB_IDS = TAB_IDS;
