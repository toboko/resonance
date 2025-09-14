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
    });
}

// Handle custom sound speed selection
function setupSoundSpeedSync() {
    $('#sound-speed').on('change', function () {
        if ($(this).val() === 'custom') {
            $('#custom-sound-speed-container').show();
        } else {
            $('#custom-sound-speed-container').hide();
        }
        // Sync with standing waves
        $('#sw-sound-speed').val($(this).val());
        if ($(this).val() === 'custom') {
            $('#sw-custom-sound-speed-container').show();
            $('#sw-custom-sound-speed').val($('#custom-sound-speed').val());
        } else {
            $('#sw-custom-sound-speed-container').hide();
        }
    });

    $('#sw-sound-speed').on('change', function () {
        if ($(this).val() === 'custom') {
            $('#sw-custom-sound-speed-container').show();
        } else {
            $('#sw-custom-sound-speed-container').hide();
        }
        // Sync with resonance
        $('#sound-speed').val($(this).val());
        if ($(this).val() === 'custom') {
            $('#custom-sound-speed-container').show();
            $('#custom-sound-speed').val($('#sw-custom-sound-speed').val());
        } else {
            $('#custom-sound-speed-container').hide();
        }
    });

    // Sync custom sound speed values
    $('#custom-sound-speed').on('input', function() {
        $('#sw-custom-sound-speed').val($(this).val());
    });

    $('#sw-custom-sound-speed').on('input', function() {
        $('#custom-sound-speed').val($(this).val());
    });
}

// Sync max modes values between tabs
function setupMaxModesSync() {
    $('#max-modes').on('input', function() {
        $('#sw-max-modes').val($(this).val());
    });

    $('#sw-max-modes').on('input', function() {
        $('#max-modes').val($(this).val());
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
        '#custom-sound-speed', '#sw-custom-sound-speed',
        '#max-modes', '#sw-max-modes'
    ];

    // Add change and input event listeners to all input elements
    inputSelectors.forEach(selector => {
        $(selector).on('input change', function() {
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
    if ($('#sound-speed').val() === 'custom') {
        $('#sw-custom-sound-speed-container').show();
        $('#sw-custom-sound-speed').val($('#custom-sound-speed').val());
    } else {
        $('#sw-custom-sound-speed-container').hide();
    }

    // Sync max modes
    $('#sw-max-modes').val($('#max-modes').val());
}

// Initialize the sync between forms when the page loads
function initializeFormSync() {
    // Set initial values from resonance to standing waves
    $('#sw-length').val($('#room-length').val());
    $('#sw-width').val($('#room-width').val());
    $('#sw-height').val($('#room-height').val());
    $('#sw-sound-speed').val($('#sound-speed').val());
    $('#sw-max-modes').val($('#max-modes').val());

    // If custom options are selected, sync those too
    if ($('#sound-speed').val() === 'custom') {
        $('#sw-custom-sound-speed-container').show();
        $('#sw-custom-sound-speed').val($('#custom-sound-speed').val());
    }
}

// Setup chart controls for showing/hiding signals
function setupChartControls() {
    $('.chart-controls input[type="checkbox"]').on('change', function() {
        // Re-draw the chart with current visibility settings
        const length = parseFloat($('#room-length').val());
        const width = parseFloat($('#room-width').val());
        const height = parseFloat($('#room-height').val());

        // Get sound speed value
        let soundSpeed;
        if ($('#sound-speed').val() === 'custom') {
            soundSpeed = parseFloat($('#custom-sound-speed').val());
        } else {
            soundSpeed = parseFloat($('#sound-speed').val());
        }

        // Get max modes value
        let maxModes = parseInt($('#max-modes').val());

        // Calculate resonance frequencies
        const resonanceResults = calculateResonanceFrequencies(length, width, height, soundSpeed, maxModes);

        // Re-draw chart with new visibility settings
        drawResonanceChart('frequency-chart', resonanceResults.axial, resonanceResults.tangential, resonanceResults.oblique);
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
