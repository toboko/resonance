$(document).ready(function () {
    // Initialize the application by setting up all UI components
    initializeUI();

    // Initialize form synchronization when the page loads
    initializeFormSync();

    // Automatically calculate and display results when the page loads
    // Small delay to ensure all DOM elements are ready
    setTimeout(() => {
        calculateBothSections();
    }, 100);

    // Handle window resize to update canvas sizes
    let resizeTimeout;
    $(window).on('resize', function() {
        // Debounce resize events to avoid excessive redraws
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Redraw charts with new canvas sizes
            const length = parseFloat($('#room-length').val());
            const width = parseFloat($('#room-width').val());
            const height = parseFloat($('#room-height').val());

            // Get sound speed value
            const soundSpeed = parseFloat($('#sound-speed').val());

            // Get max modes value
            let maxModes = parseInt($('#max-modes').val());

            // Calculate resonance frequencies
            const resonanceResults = calculateResonanceFrequencies(length, width, height, soundSpeed, maxModes);

            // Calculate standing waves
            const standingWavesResults = calculateStandingWaves(length, width, height, soundSpeed, maxModes);

            // Redraw charts with new sizes
            drawResonanceChart('frequency-chart', resonanceResults.axial, resonanceResults.tangential, resonanceResults.oblique);
            drawStandingWavesChart('standing-waves-chart', standingWavesResults);
        }, 250); // 250ms delay to avoid too frequent updates
    });
});
