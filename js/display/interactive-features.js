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
    // Remove existing frequency display and fullscreen button
    $('.frequency-display, .fullscreen-btn').remove();

    // Create frequency display element in top-right
    const frequencyDisplay = $('<div class="frequency-display">--- Hz</div>');
    $(canvas).closest('.chart-container').append(frequencyDisplay);

    // Create fullscreen button for mobile (visible only on mobile)
    const fullscreenBtn = $('<button class="fullscreen-btn" aria-label="Toggle fullscreen">⛶</button>');
    $(canvas).closest('.chart-container').append(fullscreenBtn);

    // Initialize canvas properties for interactive display
    canvas.maxFrequency = maxFrequency;
    canvas.padding = padding;
    canvas.plotWidth = width;
    canvas.drawnLines = canvas.drawnLines || [];

    // Get or create the lines canvas (reuse existing one to avoid duplicates)
    let linesCanvas = canvas.parentElement.querySelector('#line-chart');
    if (!linesCanvas) {
        // Create a separate canvas for lines to avoid redrawing the chart
        linesCanvas = document.createElement('canvas');
        linesCanvas.id = 'line-chart';
        $(canvas).parent().append(linesCanvas);
    }

    // Update canvas dimensions
    linesCanvas.width = canvas.width;
    linesCanvas.height = canvas.height;
    linesCanvas.style.width = canvas.width + 'px';
    linesCanvas.style.height = canvas.height + 'px';
    const linesCtx = linesCanvas.getContext('2d');

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
    let currentTargetX = null;

    // Desktop interaction mode variables
    let isDesktopLocked = false;
    let lockedTargetX = null;
    let lockedFrequencyData = null;

    // Function to draw a vertical line at specified x position
    function drawVerticalLine(ctx, x) {
        // Determine padding based on canvas type
        let topPadding, bottomPadding;
        if (canvas.id === 'standing-waves-chart') {
            topPadding = STANDING_WAVES_CHART_PADDING.PADDING_TOP;
            bottomPadding = STANDING_WAVES_CHART_PADDING.PADDING_BOTTOM;
        } else {
            // Default to resonance chart padding
            topPadding = RESONANCE_CHART_PADDING.PADDING_TOP;
            bottomPadding = RESONANCE_CHART_PADDING.PADDING_BOTTOM;
        }
        ctx.beginPath();
        ctx.moveTo(x, topPadding);
        ctx.lineTo(x, canvas.height - bottomPadding);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

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

                // Calculate target x position for the closest frequency
                currentTargetX = padding + (parseFloat(closestData.frequency) / maxFrequency) * width;

                // Create detailed tooltip with mode information
                const modeText = closestData.mode ? ` ${closestData.mode}` : '';
                const typeText = closestData.type ? ` - ${closestData.type}` : '';
                const displayText = `${frequency} Hz${modeText}${typeText}`;

                frequencyDisplay.text(displayText);

                // Frequency display updated
            }
        } else {
            // Mouse outside plot area
            frequencyDisplay.text('--- Hz');
            lastDisplayedFrequency = null;
            currentTargetX = null;
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

    // Remove existing event listeners to prevent duplicates
    $(canvas).off('click.interactive mousemove.interactive mouseleave.interactive touchstart.interactive');

    // Add mousemove event listener with minimal processing
    $(canvas).on('mousemove.interactive', function(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        // Calculate precise mouse coordinates accounting for CSS scaling
        let x = (e.clientX - rect.left) * scaleX;
        let y = (e.clientY - rect.top) * scaleY;

        // For desktop: always update frequency display and draw line (unless locked)
        if (!isDesktopLocked) {
            updateFrequencyDisplay(x, y);

            // Draw line following mouse with frequency snapping
            if (currentTargetX !== null) {
                linesCtx.clearRect(0, 0, linesCanvas.width, linesCanvas.height);
                drawVerticalLine(linesCtx, currentTargetX);
            }
        }
    });

    // Add mouseleave event
    $(canvas).on('mouseleave.interactive', function() {
        if (!isDesktopLocked) {
            frequencyDisplay.text('--- Hz');
            lastDisplayedFrequency = null;
            currentTargetX = null;
            pendingUpdate = false;
            // Clear the line when mouse leaves
            linesCtx.clearRect(0, 0, linesCanvas.width, linesCanvas.height);
        }
    });

    // Add click event for desktop to toggle lock/unlock mode
    $(canvas).on('click.interactive', function(e) {
        if (isDesktopLocked) {
            // Unlock: clear everything and restart
            isDesktopLocked = false;
            lockedTargetX = null;
            lockedFrequencyData = null;
            linesCtx.clearRect(0, 0, linesCanvas.width, linesCanvas.height);
            frequencyDisplay.text('--- Hz');
            lastDisplayedFrequency = null;
            currentTargetX = null;
        } else {
            // Lock: fix the current line and stop updating frequency display
            if (currentTargetX !== null && lastDisplayedFrequency !== null) {
                isDesktopLocked = true;
                lockedTargetX = currentTargetX;

                // Find the frequency data for the locked frequency
                const lockedData = allFrequencies.find(f => Math.round(parseFloat(f.frequency)) === lastDisplayedFrequency);
                lockedFrequencyData = lockedData || { frequency: lastDisplayedFrequency, mode: null, type: null };

                // Update display with unlock message
                const modeText = lockedFrequencyData.mode ? ` ${lockedFrequencyData.mode}   ` : '';
                const typeText = lockedFrequencyData.type ? ` - ${lockedFrequencyData.type}` : '';
                const displayText = `${lastDisplayedFrequency} Hz${modeText}${typeText} - Fai click per sbloccare il puntatore`;
                frequencyDisplay.text(displayText);
                // Keep the line drawn
            }
        }
    });

    // Add touchstart event for mobile to draw vertical line at closest frequency
    $(canvas).on('touchstart.interactive', function(e) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0] || e.changedTouches[0];
        const scaleX = canvas.width / rect.width;
        const x = (touch.clientX - rect.left) * scaleX;

        // Update frequency display for mobile
        updateFrequencyDisplay(x, canvas.height / 2);

        // Check if touch is within plot area
        const inXRange = x >= padding && x <= padding + width;
        if (inXRange) {
            const closestData = findClosestFrequency(x, allFrequencies, padding, width, maxFrequency);
            const targetX = padding + (parseFloat(closestData.frequency) / maxFrequency) * width;
            linesCtx.clearRect(0, 0, linesCanvas.width, linesCanvas.height);
            drawVerticalLine(linesCtx, targetX);
        }
    });

    // Fullscreen functionality - use a persistent variable to avoid reset on redraws
    if (typeof window.canvasFullscreenState === 'undefined') {
        window.canvasFullscreenState = {};
    }

    // Use canvas-specific fullscreen state
    let canvasId = canvas.id;
    if (!window.canvasFullscreenState[canvasId]) {
        window.canvasFullscreenState[canvasId] = !!document.fullscreenElement;
    }

    let isFullscreen = window.canvasFullscreenState[canvasId];

    function enterFullscreen() {
        const chartContainer = $(canvas).closest('.chart-container')[0];

        if (chartContainer.requestFullscreen) {
            chartContainer.requestFullscreen().then(() => {
                // Lock orientation to landscape for mobile fullscreen experience
                if (screen.orientation && screen.orientation.lock) {
                    screen.orientation.lock('landscape').catch(err => {
                        console.warn('Could not lock orientation:', err);
                    });
                }
                // Note: isFullscreen will be set by fullscreenchange event
            }).catch(err => {
                console.warn('Error attempting to enable fullscreen:', err);
                // Fallback: try fullscreen on document element
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen().then(() => {
                        // Lock orientation to landscape for mobile fullscreen experience
                        if (screen.orientation && screen.orientation.lock) {
                            screen.orientation.lock('landscape').catch(err => {
                                console.warn('Could not lock orientation:', err);
                            });
                        }
                        // Note: isFullscreen will be set by fullscreenchange event
                        // Scroll to chart container
                        chartContainer.scrollIntoView({ behavior: 'smooth' });
                    }).catch(err2 => {
                        console.warn('Fallback fullscreen also failed:', err2);
                    });
                }
            });
        } else {
            console.warn('Fullscreen API not supported');
        }
    }

    function exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen().then(() => {
                // Unlock orientation when exiting fullscreen
                if (screen.orientation && screen.orientation.unlock) {
                    screen.orientation.unlock().catch(err => {
                        console.warn('Could not unlock orientation:', err);
                    });
                }
                // Note: isFullscreen will be set by fullscreenchange event
            }).catch(err => {
                console.warn('Error attempting to exit fullscreen:', err);
                // Unlock orientation even on exit error
                if (screen.orientation && screen.orientation.unlock) {
                    screen.orientation.unlock().catch(unlockErr => {
                        console.warn('Could not unlock orientation on exit error:', unlockErr);
                    });
                }
                // Force state reset even if exit failed
                isFullscreen = false;
                window.canvasFullscreenState[canvasId] = false; // Persist the state
                fullscreenBtn.text('⛶');
                fullscreenBtn.attr('aria-label', 'Toggle fullscreen');
            });
        } else {
            // Unlock orientation when forcing exit
            if (screen.orientation && screen.orientation.unlock) {
                screen.orientation.unlock().catch(err => {
                    console.warn('Could not unlock orientation on forced exit:', err);
                });
            }
            // Force state reset if exitFullscreen not available
            isFullscreen = false;
            window.canvasFullscreenState[canvasId] = false; // Persist the state
            fullscreenBtn.text('⛶');
            fullscreenBtn.attr('aria-label', 'Toggle fullscreen');
        }
    }

    function toggleFullscreen() {
        if (!isFullscreen) {
            enterFullscreen();
        } else {
            exitFullscreen();
        }
    }

    // Add fullscreen button click handler
    fullscreenBtn.on('click', toggleFullscreen);

    // Listen for fullscreen changes
    $(document).on('fullscreenchange', function() {
        const wasFullscreen = isFullscreen;
        isFullscreen = !!document.fullscreenElement;
        window.canvasFullscreenState[canvasId] = isFullscreen; // Persist the state

        if (isFullscreen && !wasFullscreen) {
            // Just entered fullscreen - update UI
            fullscreenBtn.text('⛶');
            fullscreenBtn.attr('aria-label', 'Exit fullscreen');

            // Force chart redraw with fullscreen dimensions after a short delay
            setTimeout(() => {
                if (canvas.id === 'frequency-chart') {
                    const event = new Event('resize');
                    window.dispatchEvent(event);
                } else if (canvas.id === 'standing-waves-chart') {
                    const event = new Event('resize');
                    window.dispatchEvent(event);
                }
            }, 300);
        } else if (!isFullscreen && wasFullscreen) {
            // Just exited fullscreen - update UI
            fullscreenBtn.text('⛶');
            fullscreenBtn.attr('aria-label', 'Toggle fullscreen');

            // Force chart redraw with restored dimensions
            setTimeout(() => {
                if (canvas.id === 'frequency-chart') {
                    const event = new Event('resize');
                    window.dispatchEvent(event);
                } else if (canvas.id === 'standing-waves-chart') {
                    const event = new Event('resize');
                    window.dispatchEvent(event);
                }
            }, 200);
        }
    });
}

// Export functions
window.showMathInfoModal = showMathInfoModal;
window.hideMathInfoModal = hideMathInfoModal;
window.findClosestFrequency = findClosestFrequency;
window.addInteractiveFrequencyDisplay = addInteractiveFrequencyDisplay;
