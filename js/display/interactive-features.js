/**
 * Interactive features module for modal dialogs and interactive elements
 */

// Function to show/hide mathematical information modal
function showMathInfoModal() {
    $('#math-info-modal').addClass('show');
}

function hideMathInfoModal() {
    $('#math-info-modal').removeClass('show');
}

// Initialize modal event listeners when DOM is ready
$(document).ready(function() {
    // Math info button click
    $('#math-info-btn').on('click', function() {
        showMathInfoModal();
    });

    // Modal close button
    $('#math-info-modal .math-modal-close').on('click', function() {
        hideMathInfoModal();
    });

    // Modal overlay click to close
    $('#math-info-modal').on('click', function(e) {
        if (e.target === this) {
            hideMathInfoModal();
        }
    });

    // Prevent modal close when clicking on content
    $('.math-modal-content').on('click', function(e) {
        e.stopPropagation();
    });
});

// Function to find the closest frequency to a given x position
function findClosestFrequency(x, frequencies, padding, width, maxFrequency) {
    if (!frequencies || frequencies.length === 0) {
        // Fallback to linear approximation if no data
        const relativeX = Math.max(0, (x - padding) / width);
        return Math.round(relativeX * maxFrequency);
    }

    // Calculate the target frequency based on x position
    const relativeX = Math.max(0, Math.min(1, (x - padding) / width));
    const targetFrequency = relativeX * maxFrequency;

    // Find the closest frequency in the dataset
    let closestFreq = frequencies[0];
    let minDistance = Math.abs(parseFloat(closestFreq.frequency) - targetFrequency);

    for (const freq of frequencies) {
        const distance = Math.abs(parseFloat(freq.frequency) - targetFrequency);
        if (distance < minDistance) {
            minDistance = distance;
            closestFreq = freq;
        }
    }

    return {
        frequency: parseFloat(closestFreq.frequency),
        mode: closestFreq.mode,
        type: closestFreq.type
    };
}

// Function to add interactive frequency display with data-driven precision
function addInteractiveFrequencyDisplay(canvas, maxFrequency, padding, width) {
    // Remove existing frequency display
    $('.frequency-display').remove();

    // Create frequency display element in top-right
    const frequencyDisplay = $('<div class="frequency-display">--- Hz</div>');
    $(canvas).closest('.chart-container').append(frequencyDisplay);

    // Initialize canvas properties for interactive display
    canvas.maxFrequency = maxFrequency;
    canvas.padding = padding;
    canvas.plotWidth = width;

    // Store frequency data for precise lookup
    const allFrequencies = [
        ...(canvas.axialData || []),
        ...(canvas.tangentialData || []),
        ...(canvas.obliqueData || [])
    ].sort((a, b) => parseFloat(a.frequency) - parseFloat(b.frequency));

    // Performance optimization variables
    let lastUpdateTime = 0;
    let pendingUpdate = false;
    let lastMouseX = null;
    let lastMouseY = null;
    let lastDisplayedFrequency = null;

    // Function to update frequency display with data-driven precision
    function updateFrequencyDisplay(x, y) {
        const now = performance.now();

        // Throttle updates to ~60fps (every 16ms) for smoother experience
        if (now - lastUpdateTime < 16) {
            pendingUpdate = true;
            lastMouseX = x;
            lastMouseY = y;
            return;
        }

        lastUpdateTime = now;
        pendingUpdate = false;

        // Check if mouse is within plot area (extended by 10px for better UX)
        const inXRange = x >= padding && x <= padding + width;
        const inYRange = y >= padding - 10 && y <= canvas.height - padding + 10;
        const inPlotArea = inXRange && inYRange;

        if (inPlotArea) {
            // Find the closest actual frequency in the dataset
            const closestData = findClosestFrequency(x, allFrequencies, padding, width, maxFrequency);
            const frequency = Math.round(closestData.frequency);

            // Only update if frequency changed (prevents unnecessary DOM updates)
            if (lastDisplayedFrequency !== frequency) {
                lastDisplayedFrequency = frequency;

                // Create detailed tooltip with mode information
                const modeText = closestData.mode ? ` (${closestData.mode})` : '';
                const typeText = closestData.type ? ` - ${closestData.type}` : '';
                const displayText = `${frequency} Hz${modeText}${typeText}`;

                frequencyDisplay.text(displayText);

                // Frequency display updated
            }
        } else {
            // Mouse outside plot area
            frequencyDisplay.text('--- Hz');
            lastDisplayedFrequency = null;
        }
    }

    // Function to handle pending updates
    function processPendingUpdate() {
        if (pendingUpdate && lastMouseX !== null && lastMouseY !== null) {
            updateFrequencyDisplay(lastMouseX, lastMouseY);
        }
        requestAnimationFrame(processPendingUpdate);
    }

    // Start the update loop
    requestAnimationFrame(processPendingUpdate);

    // Add mousemove event listener with minimal processing
    $(canvas).on('mousemove.interactive', function(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        // Calculate precise mouse coordinates accounting for CSS scaling
        let x = (e.clientX - rect.left) * scaleX;
        let y = (e.clientY - rect.top) * scaleY;

        updateFrequencyDisplay(x, y);
    });

    // Add mouseleave event
    $(canvas).on('mouseleave.interactive', function() {
        frequencyDisplay.text('--- Hz');
        lastDisplayedFrequency = null;
        pendingUpdate = false;
    });
}

// Export functions
window.showMathInfoModal = showMathInfoModal;
window.hideMathInfoModal = hideMathInfoModal;
window.findClosestFrequency = findClosestFrequency;
window.addInteractiveFrequencyDisplay = addInteractiveFrequencyDisplay;
