/**
 * Chart drawing module for rendering charts and graphs
 */

// Chart styling configuration constants
const CHART_STYLE = {
    TICK_LENGTH: 6,
    TICK_LABEL_OFFSET_X: 18,
    TICK_LABEL_OFFSET_Y: 8,
    AXIS_LABEL_OFFSET_X: 38,
    AXIS_LABEL_OFFSET_Y: 43,
    CHART_HEIGHT: {
        MOBILE: 250,
        DESKTOP: 350
    },
    FONT_SIZE: {
        TICK_LABEL: CHART_CONFIG.FONT_SIZE.TICK_LABEL,
        AXIS_LABEL: CHART_CONFIG.FONT_SIZE.AXIS_LABEL,
        BOLD: CHART_CONFIG.FONT_SIZE.BOLD
    }
};

// Independent padding configurations for each chart type
const RESONANCE_CHART_PADDING = {
    PADDING_LEFT: 55,
    PADDING_BOTTOM: 45,
    PADDING_TOP: 15,
    PADDING_RIGHT: 25
};

const STANDING_WAVES_CHART_PADDING = {
    PADDING_LEFT: 15,
    PADDING_BOTTOM: 45,
    PADDING_TOP: 15,
    PADDING_RIGHT: 25
};

// Function to draw axis ticks and labels (shared between main drawing and animation)
function drawAxisTicks(ctx, canvas, leftPadding, bottomPadding, rightPadding, topPadding, maxFrequency, maxAmplitude, numTicksX, numTicksY, isAnimation = false) {
    const chartWidth = canvas.width - leftPadding - rightPadding;
    const chartHeight = canvas.height - topPadding - bottomPadding;

    // Draw X-axis ticks
    for (let i = 0; i <= numTicksX; i++) {
        const x = leftPadding + (chartWidth * i) / numTicksX;
        const freqValue = (maxFrequency * i) / numTicksX;

        // Draw tick (external - pointing downward)
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - bottomPadding);
        ctx.lineTo(x, canvas.height - bottomPadding + CHART_STYLE.TICK_LENGTH);
        ctx.strokeStyle = '#000';
        ctx.stroke();

        // Draw label
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.font = CHART_STYLE.FONT_SIZE.TICK_LABEL;
        ctx.fillText(Math.round(freqValue) + ' Hz', x, canvas.height - bottomPadding + CHART_STYLE.TICK_LABEL_OFFSET_X);
    }

    // Draw Y-axis ticks (only for resonance chart)
    if (maxAmplitude !== undefined) {
        for (let i = 0; i <= numTicksY; i++) {
            const y = canvas.height - bottomPadding - (chartHeight * i) / numTicksY;
            const amplitudeValue = (maxAmplitude * i) / numTicksY;

            // Draw tick (external - pointing left)
            ctx.beginPath();
            ctx.moveTo(leftPadding, y);
            ctx.lineTo(leftPadding - CHART_STYLE.TICK_LENGTH, y);
            ctx.strokeStyle = '#000';
            ctx.stroke();

            // Draw label
            ctx.fillStyle = '#000';
            ctx.textAlign = 'right';
            ctx.font = CHART_STYLE.FONT_SIZE.TICK_LABEL;
            ctx.fillText(amplitudeValue.toFixed(2), leftPadding - CHART_STYLE.TICK_LABEL_OFFSET_Y, y + 4);
        }
    }
}

// Function to draw axis labels (shared between main drawing and animation)
function drawAxisLabels(ctx, canvas, leftPadding, bottomPadding, chartType = 'resonance') {
    // X-axis label
    ctx.fillStyle = '#000';
    ctx.font = CHART_STYLE.FONT_SIZE.AXIS_LABEL;
    ctx.textAlign = 'center';
    ctx.fillText('Frequenza (Hz)', canvas.width / 2, canvas.height - bottomPadding + CHART_STYLE.AXIS_LABEL_OFFSET_X);

    // Y-axis label (only for resonance)
    if (chartType === 'resonance') {
        ctx.save();
        ctx.translate(leftPadding - CHART_STYLE.AXIS_LABEL_OFFSET_Y, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.font = CHART_STYLE.FONT_SIZE.AXIS_LABEL;
        ctx.fillText('Ampiezza', 0, 0);
        ctx.restore();
    }
}

// Function to resize canvas to match its container
function resizeCanvasToContainer(canvas) {
    // Get the chart-container (parent of chart-wrapper) to ignore wrapper padding
    const wrapper = canvas.parentElement;
    const container = wrapper.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight || canvas.height || 300;

    // Calculate 1rem in pixels for compensation
    const remInPixels = parseFloat(getComputedStyle(document.documentElement).fontSize);
    console.log(remInPixels)
    const isMobile = window.innerWidth <= 768;
    const isFullscreen = !!document.fullscreenElement && document.fullscreenElement.contains(container);

    let canvasWidth, canvasHeight;

    if (isFullscreen) {
        // In fullscreen, use the full container dimensions for dynamic sizing
        canvasWidth = containerWidth;
        canvasHeight = containerHeight;
    } else {
        // Normal mode
        if (isMobile) {
            // Fixed height for mobile when not in fullscreen
            canvasWidth = containerWidth;
            canvasHeight = CHART_STYLE.CHART_HEIGHT.MOBILE;
        } else {
            // Desktop mode - fixed height to prevent dynamic resizing during scroll
            canvasWidth = containerWidth - (2 * remInPixels);
            canvasHeight = CHART_STYLE.CHART_HEIGHT.DESKTOP;
        }
    }

    // Set canvas size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Set CSS size to match for proper scaling
    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';
}

// Function to draw resonance chart with continuous signals
function drawResonanceChart(canvasId, axial, tangential, oblique) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');

    // Resize canvas to match container
    resizeCanvasToContainer(canvas);

    // Also resize the lines canvas if it exists
    const linesCanvas = canvas.parentElement.querySelector('canvas[style*="position: absolute"]');
    if (linesCanvas) {
        linesCanvas.width = canvas.width;
        linesCanvas.height = canvas.height;
        linesCanvas.style.width = canvas.width + 'px';
        linesCanvas.style.height = canvas.height + 'px';
        // Clear the lines canvas on resize to remove any drawn lines
        const linesCtx = linesCanvas.getContext('2d');
        linesCtx.clearRect(0, 0, linesCanvas.width, linesCanvas.height);
    }

    // Store data on canvas for interactive redrawing
    canvas.axialData = axial;
    canvas.tangentialData = tangential;
    canvas.obliqueData = oblique;

    // Initialize animation properties if not exists
    if (!canvas.animationState) {
        canvas.animationState = {
            isAnimating: false,
            startTime: 0,
            duration: 800, // Animation duration in ms
            oldAxial: [],
            oldTangential: [],
            oldOblique: [],
            oldCombined: [],
            newAxial: axial,
            newTangential: tangential,
            newOblique: oblique,
            newCombined: []
        };
    }

    // Check if data has changed
    const dataChanged = !arraysEqual(canvas.animationState.oldAxial, axial) ||
                       !arraysEqual(canvas.animationState.oldTangential, tangential) ||
                       !arraysEqual(canvas.animationState.oldOblique, oblique);

    if (dataChanged) {
        // First create the table with new data
        const allFrequenciesWithTypes = [];
        let frequencyNumber = 1;

        axial.forEach(freq => {
            allFrequenciesWithTypes.push({
                ...freq,
                type: 'axial',
                typeLabel: 'Assiale',
                number: frequencyNumber++
            });
        });

        tangential.forEach(freq => {
            allFrequenciesWithTypes.push({
                ...freq,
                type: 'tangential',
                typeLabel: 'Tangenziale',
                number: frequencyNumber++
            });
        });

        oblique.forEach(freq => {
            allFrequenciesWithTypes.push({
                ...freq,
                type: 'oblique',
                typeLabel: 'Obliqua',
                number: frequencyNumber++
            });
        });

        allFrequenciesWithTypes.sort((a, b) => parseFloat(a.frequency) - parseFloat(b.frequency));

        // Create table immediately with new data
        createResonanceTable('axial-results', 'tangential-results', 'oblique-results', allFrequenciesWithTypes);

        // Then start animation
        canvas.animationState.isAnimating = true;
        canvas.animationState.startTime = performance.now();
        canvas.animationState.oldAxial = [...canvas.animationState.newAxial];
        canvas.animationState.oldTangential = [...canvas.animationState.newTangential];
        canvas.animationState.oldOblique = [...canvas.animationState.newOblique];
        canvas.animationState.newAxial = axial;
        canvas.animationState.newTangential = tangential;
        canvas.animationState.newOblique = oblique;

        // Generate old combined signal
        const allOldFrequencies = [...canvas.animationState.oldAxial, ...canvas.animationState.oldTangential, ...canvas.animationState.oldOblique];
        const oldMaxFrequency = allOldFrequencies.length > 0 ? Math.max(...allOldFrequencies.map(f => parseFloat(f.frequency))) + DEFAULTS.FREQUENCY_PADDING : 1000;
        const oldAxialSignal = generateContinuousSignal(canvas.animationState.oldAxial, oldMaxFrequency, 'axial');
        const oldTangentialSignal = generateContinuousSignal(canvas.animationState.oldTangential, oldMaxFrequency, 'tangential');
        const oldObliqueSignal = generateContinuousSignal(canvas.animationState.oldOblique, oldMaxFrequency, 'oblique');
        canvas.animationState.oldCombined = combineSignals([oldAxialSignal, oldTangentialSignal, oldObliqueSignal]);
    }

    // Use animation for smooth transitions
    if (canvas.animationState.isAnimating) {
        requestAnimationFrame(() => animateResonanceChart(canvas, ctx));
        return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set dimensions with asymmetric padding for labels and ticks
    const leftPadding = RESONANCE_CHART_PADDING.PADDING_LEFT;
    const bottomPadding = RESONANCE_CHART_PADDING.PADDING_BOTTOM;
    const rightPadding = RESONANCE_CHART_PADDING.PADDING_RIGHT;
    const topPadding = RESONANCE_CHART_PADDING.PADDING_TOP;
    const width = canvas.width - leftPadding - rightPadding;
    const height = canvas.height - topPadding - bottomPadding;

    // Combine all frequencies for max frequency calculation
    const allFrequencies = [...axial, ...tangential, ...oblique];
    const maxFrequency = Math.max(...allFrequencies.map(f => parseFloat(f.frequency))) + DEFAULTS.FREQUENCY_PADDING;

    // Generate continuous signals for each type
    const axialSignal = generateContinuousSignal(axial, maxFrequency, 'axial');
    const tangentialSignal = generateContinuousSignal(tangential, maxFrequency, 'tangential');
    const obliqueSignal = generateContinuousSignal(oblique, maxFrequency, 'oblique');

    // Generate combined signal
    const combinedSignal = combineSignals([axialSignal, tangentialSignal, obliqueSignal]);

    // Get visibility settings from checkboxes
    const showAxial = $('#show-axial').is(':checked');
    const showTangential = $('#show-tangential').is(':checked');
    const showOblique = $('#show-oblique').is(':checked');
    const showCombined = $('#show-combined').is(':checked');

    // Collect visible signals for amplitude scaling
    const visibleSignals = [];
    if (showAxial && axial.length > 0) visibleSignals.push(...axialSignal);
    if (showTangential && tangential.length > 0) visibleSignals.push(...tangentialSignal);
    if (showOblique && oblique.length > 0) visibleSignals.push(...obliqueSignal);
    if (showCombined && combinedSignal.length > 0) visibleSignals.push(...combinedSignal);

    // Find max amplitude for scaling (only from visible signals)
    const maxAmplitude = visibleSignals.length > 0 ? Math.max(...visibleSignals) : 1;

    // Draw axes
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(leftPadding, topPadding);
    ctx.lineTo(leftPadding, canvas.height - bottomPadding);
    ctx.lineTo(canvas.width - rightPadding, canvas.height - bottomPadding);
    ctx.strokeStyle = '#000';
    ctx.stroke();

    // Check if we're on mobile (screen width <= 768px)
    const isMobile = window.innerWidth <= 768;

    // Draw axis ticks and labels using shared function
    const numTicksX = isMobile ? 4 : 10;
    const numTicksY = 4;
    drawAxisTicks(ctx, canvas, leftPadding, bottomPadding, rightPadding, topPadding, maxFrequency, maxAmplitude, numTicksX, numTicksY);

    // Define colors for mode types using global constants
    const typeColors = {
        'axial': COLORS.AXIAL,
        'tangential': COLORS.TANGENTIAL,
        'oblique': COLORS.OBLIQUE,
        'combined': COLORS.COMBINED
    };

    // Function to draw signal curve
    function drawSignal(signal, colorVar, label, alpha = 0.8) {
        const color = getComputedStyle(document.documentElement).getPropertyValue(colorVar).trim();
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = alpha;

        const step = width / signal.length;
        let hasStarted = false;

        for (let i = 0; i < signal.length; i++) {
            const x = leftPadding + (i / signal.length) * width;
            const y = canvas.height - bottomPadding - (signal[i] / maxAmplitude) * height;

            if (!hasStarted) {
                ctx.moveTo(x, y);
                hasStarted = true;
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();

        // Fill area under curve
        ctx.lineTo(leftPadding + width, canvas.height - bottomPadding);
        ctx.lineTo(leftPadding, canvas.height - bottomPadding);
        ctx.closePath();
        ctx.globalAlpha = alpha * 0.3;
        ctx.fillStyle = color;
        ctx.fill();

        ctx.globalAlpha = 1.0;
    }

    // Draw individual signals based on visibility settings
    if (showAxial && axial.length > 0) {
        drawSignal(axialSignal, typeColors.axial, 'Assiale');
    }

    if (showTangential && tangential.length > 0) {
        drawSignal(tangentialSignal, typeColors.tangential, 'Tangenziale');
    }

    if (showOblique && oblique.length > 0) {
        drawSignal(obliqueSignal, typeColors.oblique, 'Obliqua');
    }

    // Draw combined signal
    if (showCombined && combinedSignal.length > 0) {
        drawSignal(combinedSignal, typeColors.combined, 'Risultante', 1.0);
    }

    // Add axis labels using shared function
    drawAxisLabels(ctx, canvas, leftPadding, bottomPadding, 'resonance');

    // Add interactive frequency display
    addInteractiveFrequencyDisplay(canvas, maxFrequency, leftPadding, width);

    // Create and display frequency table (original functionality preserved)
    const allFrequenciesWithTypes = [];
    let frequencyNumber = 1;

    axial.forEach(freq => {
        allFrequenciesWithTypes.push({
            ...freq,
            type: 'axial',
            typeLabel: 'Assiale',
            number: frequencyNumber++
        });
    });

    tangential.forEach(freq => {
        allFrequenciesWithTypes.push({
            ...freq,
            type: 'tangential',
            typeLabel: 'Tangenziale',
            number: frequencyNumber++
        });
    });

    oblique.forEach(freq => {
        allFrequenciesWithTypes.push({
            ...freq,
            type: 'oblique',
            typeLabel: 'Obliqua',
            number: frequencyNumber++
        });
    });

    allFrequenciesWithTypes.sort((a, b) => parseFloat(a.frequency) - parseFloat(b.frequency));

    createResonanceTable('axial-results', 'tangential-results', 'oblique-results', allFrequenciesWithTypes);
}

// Function to draw standing waves chart - IMPROVED VERSION
function drawStandingWavesChart(canvasId, waves) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');

    // Resize canvas to match container
    resizeCanvasToContainer(canvas);

    // Initialize animation properties if not exists
    if (!canvas.animationState) {
        canvas.animationState = {
            isAnimating: false,
            startTime: 0,
            duration: 600, // Animation duration in ms
            oldWaves: [],
            newWaves: waves
        };
    }

    // Check if data has changed
    const dataChanged = !arraysEqual(canvas.animationState.oldWaves, waves);

    if (dataChanged) {
        // First create the table with new data
        const newWaves = waves.sort((a, b) => parseFloat(a.frequency) - parseFloat(b.frequency));
        const newTableData = [];

        // Prepare table data for new waves
        const newDimensionModeWaves = {};
        newWaves.forEach(wave => {
            const key = wave.dimension;
            if (!newDimensionModeWaves[key]) {
                newDimensionModeWaves[key] = [];
            }
            newDimensionModeWaves[key].push(wave);
        });

        Object.entries(newDimensionModeWaves).forEach(([dimension, dimensionWaves]) => {
            dimensionWaves.sort((a, b) => a.mode - b.mode);
            dimensionWaves.forEach((wave) => {
                const waveNumber = newWaves.findIndex(w => w.frequency === wave.frequency && w.dimension === wave.dimension) + 1;
                newTableData.push({
                    number: waveNumber,
                    dimension: wave.dimension,
                    mode: wave.mode,
                    frequency: wave.frequency
                });
            });
        });

        // Create table immediately with new data
        createFrequencyTable('standing-waves-results', newTableData);

        // Then start animation
        canvas.animationState.isAnimating = true;
        canvas.animationState.startTime = performance.now();
        canvas.animationState.oldWaves = [...canvas.animationState.newWaves];
        canvas.animationState.newWaves = waves;
    }

    // Use animation for smooth transitions
    if (canvas.animationState.isAnimating) {
        requestAnimationFrame(() => animateStandingWavesChart(canvas, ctx));
        return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set dimensions with asymmetric padding for labels and ticks
    const leftPadding = STANDING_WAVES_CHART_PADDING.PADDING_LEFT;
    const bottomPadding = STANDING_WAVES_CHART_PADDING.PADDING_BOTTOM;
    const rightPadding = STANDING_WAVES_CHART_PADDING.PADDING_RIGHT;
    const topPadding = STANDING_WAVES_CHART_PADDING.PADDING_TOP;
    const width = canvas.width - leftPadding - rightPadding;
    const height = canvas.height - topPadding - bottomPadding;

    // Sort by frequency
    waves.sort((a, b) => parseFloat(a.frequency) - parseFloat(b.frequency));

    // Find max frequency and add padding
    const maxFrequency = Math.max(...waves.map(f => parseFloat(f.frequency))) + DEFAULTS.STANDING_WAVES_PADDING;

    // Draw axes
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(leftPadding, topPadding);
    ctx.lineTo(leftPadding, canvas.height - bottomPadding);
    ctx.lineTo(canvas.width - rightPadding, canvas.height - bottomPadding);
    ctx.strokeStyle = '#000';
    ctx.stroke();

    // Check if we're on mobile (screen width <= 768px)
    const isMobile = window.innerWidth <= 768;

    // Draw axis ticks and labels using shared function
    const numTicksX = isMobile ? 4 : 10;
    drawAxisTicks(ctx, canvas, leftPadding, bottomPadding, rightPadding, topPadding, maxFrequency, undefined, numTicksX, 0);

    // Define colors for dimensions using global constants
    const colors = {
        'Lunghezza': COLORS.LENGTH,
        'Larghezza': COLORS.WIDTH,
        'Altezza': COLORS.HEIGHT
    };

    // Group waves by dimension and mode
    const dimensionModeWaves = {};

    waves.forEach(wave => {
        const key = wave.dimension;
        if (!dimensionModeWaves[key]) {
            dimensionModeWaves[key] = [];
        }
        dimensionModeWaves[key].push(wave);
    });

    // Prepare data for table
    const tableData = [];

    // Get visibility settings from checkboxes
    const showLength = $('#show-length').is(':checked');
    const showWidth = $('#show-width').is(':checked');
    const showHeight = $('#show-height').is(':checked');

    // Draw frequency lines with graduated opacity based on mode
    Object.entries(dimensionModeWaves).forEach(([dimension, dimensionWaves]) => {
        // Check if this dimension should be shown
        let shouldShow = false;
        if (dimension === 'Lunghezza' && showLength) shouldShow = true;
        if (dimension === 'Larghezza' && showWidth) shouldShow = true;
        if (dimension === 'Altezza' && showHeight) shouldShow = true;

        if (!shouldShow) return; // Skip this dimension if not selected

        // Sort by mode for each dimension
        dimensionWaves.sort((a, b) => a.mode - b.mode);

        dimensionWaves.forEach((wave, index) => {
            const x = leftPadding + (parseFloat(wave.frequency) / maxFrequency) * width;
            const colorVar = colors[dimension];
            const color = getComputedStyle(document.documentElement).getPropertyValue(colorVar).trim();
            const waveNumber = waves.findIndex(w => w.frequency === wave.frequency && w.dimension === wave.dimension) + 1;

            // Add to table data
            tableData.push({
                number: waveNumber,
                dimension: wave.dimension,
                mode: wave.mode,
                frequency: wave.frequency
            });

            // Draw line with full opacity (deprecated reduced opacity for higher modes)
            ctx.beginPath();
            ctx.moveTo(x, canvas.height - bottomPadding);
            ctx.lineTo(x, topPadding);
            ctx.strokeStyle = color;
            ctx.globalAlpha = 1.0;
            ctx.stroke();

            // Draw numbered marker at bottom of line with the same opacity
            ctx.beginPath();
            ctx.arc(x, canvas.height - bottomPadding - 3, 8, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            // Draw number in marker
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = CHART_CONFIG.FONT_SIZE.BOLD;
            ctx.fillText(waveNumber, x, canvas.height - bottomPadding - 3);
        });
    });

    // Reset opacity for legend and other elements
    ctx.globalAlpha = 1.0;

    // Opacity legend removed - deprecated feature

    // Add axis labels using shared function
    drawAxisLabels(ctx, canvas, leftPadding, bottomPadding, 'standing-waves');

    // Create and display frequency table only if data hasn't changed (animation will handle it otherwise)
    if (!dataChanged) {
        createFrequencyTable('standing-waves-results', tableData);
    }
}

// Function to draw resonance chart for PDF export with fixed dimensions
function drawResonanceChartForPDF(axial, tangential, oblique) {
    const canvas = document.getElementById('pdf-chart-canvas');
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set fixed dimensions for PDF export
    const leftPadding = RESONANCE_CHART_PADDING.PADDING_LEFT;
    const bottomPadding = RESONANCE_CHART_PADDING.PADDING_BOTTOM;
    const rightPadding = RESONANCE_CHART_PADDING.PADDING_RIGHT;
    const topPadding = RESONANCE_CHART_PADDING.PADDING_TOP;
    const width = canvas.width - leftPadding - rightPadding;
    const height = canvas.height - topPadding - bottomPadding;

    // Combine all frequencies for max frequency calculation
    const allFrequencies = [...axial, ...tangential, ...oblique];
    const maxFrequency = Math.max(...allFrequencies.map(f => parseFloat(f.frequency))) + DEFAULTS.FREQUENCY_PADDING;

    // Generate continuous signals for each type
    const axialSignal = generateContinuousSignal(axial, maxFrequency, 'axial');
    const tangentialSignal = generateContinuousSignal(tangential, maxFrequency, 'tangential');
    const obliqueSignal = generateContinuousSignal(oblique, maxFrequency, 'oblique');

    // Generate combined signal
    const combinedSignal = combineSignals([axialSignal, tangentialSignal, obliqueSignal]);

    // Get visibility settings from checkboxes (same as main chart)
    const showAxial = $('#show-axial').is(':checked');
    const showTangential = $('#show-tangential').is(':checked');
    const showOblique = $('#show-oblique').is(':checked');
    const showCombined = $('#show-combined').is(':checked');

    // Collect visible signals for amplitude scaling
    const visibleSignals = [];
    if (showAxial && axial.length > 0) visibleSignals.push(...axialSignal);
    if (showTangential && tangential.length > 0) visibleSignals.push(...tangentialSignal);
    if (showOblique && oblique.length > 0) visibleSignals.push(...obliqueSignal);
    if (showCombined && combinedSignal.length > 0) visibleSignals.push(...combinedSignal);

    // Find max amplitude for scaling (only from visible signals)
    const maxAmplitude = visibleSignals.length > 0 ? Math.max(...visibleSignals) : 1;

    // Draw axes
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(leftPadding, topPadding);
    ctx.lineTo(leftPadding, canvas.height - bottomPadding);
    ctx.lineTo(canvas.width - rightPadding, canvas.height - bottomPadding);
    ctx.strokeStyle = '#000';
    ctx.stroke();

    // Draw axis ticks and labels using shared function
    const numTicksX = 10; // Fixed number for PDF
    const numTicksY = 4;
    drawAxisTicks(ctx, canvas, leftPadding, bottomPadding, rightPadding, topPadding, maxFrequency, maxAmplitude, numTicksX, numTicksY);

    // Define colors for mode types using global constants
    const typeColors = {
        'axial': COLORS.AXIAL,
        'tangential': COLORS.TANGENTIAL,
        'oblique': COLORS.OBLIQUE,
        'combined': COLORS.COMBINED
    };

    // Function to draw signal curve
    function drawSignal(signal, colorVar, label, alpha = 0.8) {
        const color = getComputedStyle(document.documentElement).getPropertyValue(colorVar).trim();
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = alpha;

        const step = width / signal.length;
        let hasStarted = false;

        for (let i = 0; i < signal.length; i++) {
            const x = leftPadding + (i / signal.length) * width;
            const y = canvas.height - bottomPadding - (signal[i] / maxAmplitude) * height;

            if (!hasStarted) {
                ctx.moveTo(x, y);
                hasStarted = true;
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();

        // Fill area under curve
        ctx.lineTo(leftPadding + width, canvas.height - bottomPadding);
        ctx.lineTo(leftPadding, canvas.height - bottomPadding);
        ctx.closePath();
        ctx.globalAlpha = alpha * 0.3;
        ctx.fillStyle = color;
        ctx.fill();

        ctx.globalAlpha = 1.0;
    }

    // Draw individual signals based on visibility settings
    if (showAxial && axial.length > 0) {
        drawSignal(axialSignal, typeColors.axial, 'Assiale');
    }

    if (showTangential && tangential.length > 0) {
        drawSignal(tangentialSignal, typeColors.tangential, 'Tangenziale');
    }

    if (showOblique && oblique.length > 0) {
        drawSignal(obliqueSignal, typeColors.oblique, 'Obliqua');
    }

    // Draw combined signal
    if (showCombined && combinedSignal.length > 0) {
        drawSignal(combinedSignal, typeColors.combined, 'Risultante', 1.0);
    }

    // Add axis labels using shared function
    drawAxisLabels(ctx, canvas, leftPadding, bottomPadding, 'resonance');

    // Add legend
    const legendX = canvas.width - 120;
    let legendY = 20;
    const legendSpacing = 25;

    // Count visible signals for legend
    const visibleCount = [showAxial && axial.length > 0, showTangential && tangential.length > 0,
                         showOblique && oblique.length > 0, showCombined && combinedSignal.length > 0]
                         .filter(Boolean).length;

    if (visibleCount > 0) {
        ctx.font = CHART_CONFIG.FONT_SIZE.LEGEND;

        // Axial
        if (showAxial && axial.length > 0) {
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(typeColors.axial).trim();
            ctx.fillRect(legendX, legendY, 15, 15);
            ctx.fillStyle = '#000';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText('Assiale', legendX + 20, legendY + 7.5);
            legendY += legendSpacing;
        }

        // Tangential
        if (showTangential && tangential.length > 0) {
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(typeColors.tangential).trim();
            ctx.fillRect(legendX, legendY, 15, 15);
            ctx.fillStyle = '#000';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText('Tangenziale', legendX + 20, legendY + 7.5);
            legendY += legendSpacing;
        }

        // Oblique
        if (showOblique && oblique.length > 0) {
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(typeColors.oblique).trim();
            ctx.fillRect(legendX, legendY, 15, 15);
            ctx.fillStyle = '#000';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText('Obliqua', legendX + 20, legendY + 7.5);
            legendY += legendSpacing;
        }

        // Combined
        if (showCombined && combinedSignal.length > 0) {
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(typeColors.combined).trim();
            ctx.fillRect(legendX, legendY, 15, 15);
            ctx.fillStyle = '#000';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText('Risultante', legendX + 20, legendY + 7.5);
        }
    }
}

// Export functions
window.drawResonanceChart = drawResonanceChart;
window.drawStandingWavesChart = drawStandingWavesChart;
window.drawResonanceChartForPDF = drawResonanceChartForPDF;
