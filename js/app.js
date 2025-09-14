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
});
