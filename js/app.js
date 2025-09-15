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
            // Use unified update function for consistency
            calculateBothSections();
        }, 250); // 250ms delay to avoid too frequent updates
    });
});
