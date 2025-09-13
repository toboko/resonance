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

// Handle custom max modes selection
function setupMaxModesSync() {
    $('#max-modes').on('change', function () {
        if ($(this).val() === 'custom') {
            $('#custom-max-modes-container').show();
        } else {
            $('#custom-max-modes-container').hide();
        }
        // Sync with standing waves
        $('#sw-max-modes').val($(this).val());
        if ($(this).val() === 'custom') {
            $('#sw-custom-max-modes-container').show();
            $('#sw-custom-max-modes').val($('#custom-max-modes').val());
        } else {
            $('#sw-custom-max-modes-container').hide();
        }
    });

    $('#sw-max-modes').on('change', function () {
        if ($(this).val() === 'custom') {
            $('#sw-custom-max-modes-container').show();
        } else {
            $('#sw-custom-max-modes-container').hide();
        }
        // Sync with resonance
        $('#max-modes').val($(this).val());
        if ($(this).val() === 'custom') {
            $('#custom-max-modes-container').show();
            $('#custom-max-modes').val($('#sw-custom-max-modes').val());
        } else {
            $('#custom-max-modes-container').hide();
        }
    });

    // Sync custom max modes values
    $('#custom-max-modes').on('input', function() {
        $('#sw-custom-max-modes').val($(this).val());
    });

    $('#sw-custom-max-modes').on('input', function() {
        $('#custom-max-modes').val($(this).val());
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

// Calculate resonance and standing waves frequencies
function setupCalculationHandlers() {
    $('#calculate-resonance, #calculate-standing-waves').on('click', function() {
        // If clicked from standing waves tab, first sync values to resonance form
        if ($(this).attr('id') === 'calculate-standing-waves') {
            // Update resonance form with standing waves form values
            $('#room-length').val($('#sw-length').val());
            $('#room-width').val($('#sw-width').val());
            $('#room-height').val($('#sw-height').val());

            $('#sound-speed').val($('#sw-sound-speed').val());
            if ($('#sw-sound-speed').val() === 'custom') {
                $('#custom-sound-speed-container').show();
                $('#custom-sound-speed').val($('#sw-custom-sound-speed').val());
            }

            $('#max-modes').val($('#sw-max-modes').val());
            if ($('#sw-max-modes').val() === 'custom') {
                $('#custom-max-modes-container').show();
                $('#custom-max-modes').val($('#sw-custom-max-modes').val());
            }
        }

        // Calculate both sections
        calculateBothSections();
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
    if ($('#max-modes').val() === 'custom') {
        $('#sw-custom-max-modes-container').show();
        $('#sw-custom-max-modes').val($('#custom-max-modes').val());
    } else {
        $('#sw-custom-max-modes-container').hide();
    }
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

    if ($('#max-modes').val() === 'custom') {
        $('#sw-custom-max-modes-container').show();
        $('#sw-custom-max-modes').val($('#custom-max-modes').val());
    }
}

// Initialize all UI components
function initializeUI() {
    setupTabSwitching();
    setupSoundSpeedSync();
    setupMaxModesSync();
    setupRoomDimensionsSync();
    setupCalculationHandlers();
    initializeFormSync();
}

// Export functions for use in other modules
window.setupTabSwitching = setupTabSwitching;
window.setupSoundSpeedSync = setupSoundSpeedSync;
window.setupMaxModesSync = setupMaxModesSync;
window.setupRoomDimensionsSync = setupRoomDimensionsSync;
window.setupCalculationHandlers = setupCalculationHandlers;
window.syncFormValues = syncFormValues;
window.initializeFormSync = initializeFormSync;
window.initializeUI = initializeUI;
