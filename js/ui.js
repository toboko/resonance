/**
 * UI module for user interface interactions and form handling
 */

// Tab switching functionality
function setupTabSwitching() {
    $('.tab-button').on('click', function () {
        const tabId = $(this).data('tab');

        // Update active tab button
        $('.tab-button').removeClass('active');
        $(this).addClass('active');

        // Show selected tab content
        $('.tab-content').removeClass('active');
        $('#' + tabId).addClass('active');

        // Trigger canvas drawing for the newly activated tab
        setTimeout(() => {
            calculateBothSections();
        }, 50); // Small delay to ensure DOM is updated
    });
}

// Handle sound speed selection
function setupSoundSpeedSync() {
    $('#sound-speed').on('change', function () {
        // Sync with standing waves
        $('#sw-sound-speed').val($(this).val());
    });

    $('#sw-sound-speed').on('change', function () {
        // Sync with resonance
        $('#sound-speed').val($(this).val());
    });
}

// Sync max modes values between tabs
function setupMaxModesSync() {
    $('#max-modes').on('input', function() {
        const validatedValue = validateMaxModes(this);
        $('#sw-max-modes').val(validatedValue);
    });

    $('#sw-max-modes').on('input', function() {
        const validatedValue = validateMaxModes(this);
        $('#max-modes').val(validatedValue);
    });
}

// Sync room dimensions
function setupRoomDimensionsSync() {
    $('#room-length').on('input', function() {
        $('#sw-length').val($(this).val());
    });

    $('#sw-length').on('input', function() {
        $('#room-length').val($(this).val());
    });

    $('#room-width').on('input', function() {
        $('#sw-width').val($(this).val());
    });

    $('#sw-width').on('input', function() {
        $('#room-width').val($(this).val());
    });

    $('#room-height').on('input', function() {
        $('#sw-height').val($(this).val());
    });

    $('#sw-height').on('input', function() {
        $('#room-height').val($(this).val());
    });
}

// Function to validate and clamp max modes value
function validateMaxModes(inputElement) {
    let value = parseInt($(inputElement).val());

    // Clamp value between 1 and 10
    if (isNaN(value) || value < 1) {
        value = 1;
    } else if (value > 10) {
        value = 10;
    }

    // Update the input value if it was clamped
    if ($(inputElement).val() != value) {
        $(inputElement).val(value);
    }

    return value;
}

// Auto-update calculations when inputs change
function setupAutoUpdateHandlers() {
    // Debounce function to limit update frequency
    let updateTimeout;
    function debouncedUpdate() {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
            calculateBothSections();
        }, 300); // 300ms delay to avoid too frequent updates
    }

    // List of all input elements that should trigger updates
    const inputSelectors = [
        '#room-length', '#room-width', '#room-height',
        '#sw-length', '#sw-width', '#sw-height',
        '#sound-speed', '#sw-sound-speed',
        '#max-modes', '#sw-max-modes'
    ];

    // Add change and input event listeners to all input elements
    inputSelectors.forEach(selector => {
        $(selector).on('input change', function() {
            // Validate max modes inputs before processing
            if (selector === '#max-modes' || selector === '#sw-max-modes') {
                validateMaxModes(this);
            }

            // Sync values between tabs
            syncFormValues();
            // Trigger debounced update
            debouncedUpdate();
        });
    });

    // Also trigger update when custom containers are shown/hidden
    $('#sound-speed, #sw-sound-speed, #max-modes, #sw-max-modes').on('change', function() {
        // Small delay to allow DOM updates
        setTimeout(() => {
            debouncedUpdate();
        }, 50);
    });
}

// Function to sync form values between tabs
function syncFormValues() {
    // Sync dimensions
    $('#sw-length').val($('#room-length').val());
    $('#sw-width').val($('#room-width').val());
    $('#sw-height').val($('#room-height').val());

    // Sync sound speed
    $('#sw-sound-speed').val($('#sound-speed').val());

    // Sync max modes with validation
    const maxModesValue = validateMaxModes('#max-modes');
    $('#sw-max-modes').val(maxModesValue);
}

// Initialize the sync between forms when the page loads
function initializeFormSync() {
    // Validate initial max modes values
    validateMaxModes('#max-modes');
    validateMaxModes('#sw-max-modes');

    // Set initial values from resonance to standing waves
    $('#sw-length').val($('#room-length').val());
    $('#sw-width').val($('#room-width').val());
    $('#sw-height').val($('#room-height').val());
    $('#sw-sound-speed').val($('#sound-speed').val());
    $('#sw-max-modes').val($('#max-modes').val());
}

// Setup chart controls for showing/hiding signals
function setupChartControls() {
    $('.chart-controls input[type="checkbox"]').on('change', function() {
        const chartContainer = $(this).closest('.chart-container');
        const isResonanceTab = chartContainer.find('#frequency-chart').length > 0;

        // Use the unified update function for consistency
        calculateBothSections();
    });
}

// Setup number input buttons for increment/decrement
function setupNumberButtons() {
    $('.number-btn').on('click', function() {
        const targetId = $(this).data('target');
        const input = $('#' + targetId);
        let value = parseInt(input.val());

        if ($(this).hasClass('plus-btn')) {
            value += 1;
        } else if ($(this).hasClass('minus-btn')) {
            value -= 1;
        }

        input.val(value);
        validateMaxModes('#' + targetId);
        input.trigger('input');
    });
}

// Initialize all UI components
function initializeUI() {
    setupTabSwitching();
    setupSoundSpeedSync();
    setupMaxModesSync();
    setupRoomDimensionsSync();
    setupAutoUpdateHandlers();
    setupChartControls();
    setupNumberButtons();
    initializeFormSync();
}

// Export functions for use in other modules
window.setupTabSwitching = setupTabSwitching;
window.setupSoundSpeedSync = setupSoundSpeedSync;
window.setupMaxModesSync = setupMaxModesSync;
window.setupRoomDimensionsSync = setupRoomDimensionsSync;
window.setupAutoUpdateHandlers = setupAutoUpdateHandlers;
window.syncFormValues = syncFormValues;
window.initializeFormSync = initializeFormSync;
window.initializeUI = initializeUI;
window.validateMaxModes = validateMaxModes;
