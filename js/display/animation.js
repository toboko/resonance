/**
 * Animation module for chart transitions and effects
 */

    // Function to animate resonance chart transitions
    function animateResonanceChart(canvas, ctx) {
        const state = canvas.animationState;
        const elapsed = performance.now() - state.startTime;
        const progress = Math.min(elapsed / state.duration, 1);

        // Apply linear easing function for uniform animation
        const easedProgress = easeSmoothLinear(progress);

        // Resize canvas to match container
        resizeCanvasToContainer(canvas);

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set dimensions
    const padding = 60;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;

    // Combine all frequencies for max frequency calculation
    const allFrequencies = [...state.newAxial, ...state.newTangential, ...state.newOblique];
    const maxFrequency = Math.max(...allFrequencies.map(f => parseFloat(f.frequency))) + 80;

    // Generate new signals
    const newAxialSignal = generateContinuousSignal(state.newAxial, maxFrequency, 'axial');
    const newTangentialSignal = generateContinuousSignal(state.newTangential, maxFrequency, 'tangential');
    const newObliqueSignal = generateContinuousSignal(state.newOblique, maxFrequency, 'oblique');
    const newCombinedSignal = combineSignals([newAxialSignal, newTangentialSignal, newObliqueSignal]);

    // Generate old signals if available
    let oldAxialSignal = [];
    let oldTangentialSignal = [];
    let oldObliqueSignal = [];
    let oldCombinedSignal = [];

    if (state.oldAxial.length > 0) {
        const allOldFrequencies = [...state.oldAxial, ...state.oldTangential, ...state.oldOblique];
        const oldMaxFrequency = allOldFrequencies.length > 0 ? Math.max(...allOldFrequencies.map(f => parseFloat(f.frequency))) + 80 : 1000;
        oldAxialSignal = generateContinuousSignal(state.oldAxial, oldMaxFrequency, 'axial');
        oldTangentialSignal = generateContinuousSignal(state.oldTangential, oldMaxFrequency, 'tangential');
        oldObliqueSignal = generateContinuousSignal(state.oldOblique, oldMaxFrequency, 'oblique');
        oldCombinedSignal = combineSignals([oldAxialSignal, oldTangentialSignal, oldObliqueSignal]);
    }

    // Interpolate signals
    const axialSignal = interpolateSignals(oldAxialSignal, newAxialSignal, easedProgress);
    const tangentialSignal = interpolateSignals(oldTangentialSignal, newTangentialSignal, easedProgress);
    const obliqueSignal = interpolateSignals(oldObliqueSignal, newObliqueSignal, easedProgress);
    const combinedSignal = interpolateSignals(oldCombinedSignal, newCombinedSignal, easedProgress);

    // Get visibility settings from checkboxes
    const showAxial = $('#show-axial').is(':checked');
    const showTangential = $('#show-tangential').is(':checked');
    const showOblique = $('#show-oblique').is(':checked');
    const showCombined = $('#show-combined').is(':checked');

    // Collect visible signals for amplitude scaling
    const visibleSignals = [];
    if (showAxial && axialSignal.length > 0) visibleSignals.push(...axialSignal);
    if (showTangential && tangentialSignal.length > 0) visibleSignals.push(...tangentialSignal);
    if (showOblique && obliqueSignal.length > 0) visibleSignals.push(...obliqueSignal);
    if (showCombined && combinedSignal.length > 0) visibleSignals.push(...combinedSignal);

    // Find max amplitude for scaling (only from visible signals)
    const maxAmplitude = visibleSignals.length > 0 ? Math.max(...visibleSignals) : 1;

    // Draw axes
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.strokeStyle = '#000';
    ctx.stroke();

    // Draw frequency scale on x-axis
    ctx.font = CHART_CONFIG.FONT_SIZE.TICK_LABEL;
    const numTicks = 10;
    for (let i = 0; i <= numTicks; i++) {
        const x = padding + (width * i) / numTicks;
        const freqValue = (maxFrequency * i) / numTicks;

        // Draw tick
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - padding);
        ctx.lineTo(x, canvas.height - padding + 5);
        ctx.strokeStyle = '#000';
        ctx.stroke();

        // Draw label
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(Math.round(freqValue) + ' Hz', x, canvas.height - padding + 20);
    }

    // Draw amplitude scale on y-axis
    const amplitudeTicks = 5;
    for (let i = 0; i <= amplitudeTicks; i++) {
        const y = canvas.height - padding - (height * i) / amplitudeTicks;
        const amplitudeValue = (maxAmplitude * i) / amplitudeTicks;

        // Draw tick
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding - 5, y);
        ctx.strokeStyle = '#000';
        ctx.stroke();

        // Draw label
        ctx.fillStyle = '#000';
        ctx.textAlign = 'right';
        ctx.fillText(amplitudeValue.toFixed(2), padding - 10, y + 4);
    }

    // Define colors for mode types using global constants
    const typeColors = {
        'axial': COLORS.AXIAL,
        'tangential': COLORS.TANGENTIAL,
        'oblique': COLORS.OBLIQUE,
        'combined': COLORS.COMBINED
    };

    // Function to draw signal curve with animation
    function drawSignal(signal, color, label, alpha = 0.8, fadeIn = false) {
        if (!signal || signal.length === 0) return;

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        // Apply fade-in effect for new data
        let finalAlpha = alpha;
        if (fadeIn && progress < 0.5) {
            finalAlpha = alpha * (progress * 2);
        }

        ctx.globalAlpha = finalAlpha;

        const step = width / signal.length;
        let hasStarted = false;

        for (let i = 0; i < signal.length; i++) {
            const x = padding + (i / signal.length) * width;
            const y = canvas.height - padding - (signal[i] / maxAmplitude) * height;

            if (!hasStarted) {
                ctx.moveTo(x, y);
                hasStarted = true;
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();

        // Fill area under curve
        ctx.lineTo(padding + width, canvas.height - padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.closePath();
        ctx.globalAlpha = finalAlpha * 0.3;
        ctx.fillStyle = color;
        ctx.fill();

        ctx.globalAlpha = 1.0;
    }

    // Draw individual signals based on visibility settings
    if (showAxial && axialSignal.length > 0) {
        const isNew = state.oldAxial.length === 0 && state.newAxial.length > 0;
        drawSignal(axialSignal, typeColors.axial, 'Assiale', 0.8, isNew);
    }

    if (showTangential && tangentialSignal.length > 0) {
        const isNew = state.oldTangential.length === 0 && state.newTangential.length > 0;
        drawSignal(tangentialSignal, typeColors.tangential, 'Tangenziale', 0.8, isNew);
    }

    if (showOblique && obliqueSignal.length > 0) {
        const isNew = state.oldOblique.length === 0 && state.newOblique.length > 0;
        drawSignal(obliqueSignal, typeColors.oblique, 'Obliqua', 0.8, isNew);
    }

    // Draw combined signal
    if (showCombined && combinedSignal.length > 0) {
        const isNew = state.oldCombined.length === 0 && state.newCombined.length > 0;
        drawSignal(combinedSignal, typeColors.combined, 'Risultante', 1.0, isNew);
    }

    // Draw legend with fade-in effect
    const legendX = canvas.width - padding - 120;
    let legendY = padding + 20;
    const legendSpacing = 25;

    // Count visible signals for legend
    const visibleCount = [showAxial && axialSignal.length > 0, showTangential && tangentialSignal.length > 0,
                         showOblique && obliqueSignal.length > 0, showCombined && combinedSignal.length > 0]
                         .filter(Boolean).length;

    if (visibleCount > 0) {
        // Apply legend fade-in
        const legendAlpha = progress < 0.3 ? (progress / 0.3) : 1.0;
        ctx.globalAlpha = legendAlpha;

        // Axial
        if (showAxial && axialSignal.length > 0) {
            ctx.fillStyle = typeColors['axial'];
            ctx.fillRect(legendX, legendY, 15, 15);
            ctx.fillStyle = '#000';
            ctx.textAlign = 'left';
            ctx.font = CHART_CONFIG.FONT_SIZE.LEGEND;
            ctx.fillText('Assiale', legendX + 20, legendY + 12);
            legendY += legendSpacing;
        }

        // Tangential
        if (showTangential && tangentialSignal.length > 0) {
            ctx.fillStyle = typeColors['tangential'];
            ctx.fillRect(legendX, legendY, 15, 15);
            ctx.fillStyle = '#000';
            ctx.fillText('Tangenziale', legendX + 20, legendY + 12);
            legendY += legendSpacing;
        }

        // Oblique
        if (showOblique && obliqueSignal.length > 0) {
            ctx.fillStyle = typeColors['oblique'];
            ctx.fillRect(legendX, legendY, 15, 15);
            ctx.fillStyle = '#000';
            ctx.fillText('Obliqua', legendX + 20, legendY + 12);
            legendY += legendSpacing;
        }

        // Combined
        if (showCombined && combinedSignal.length > 0) {
            ctx.fillStyle = typeColors['combined'];
            ctx.fillRect(legendX, legendY, 15, 15);
            ctx.fillStyle = '#000';
            ctx.fillText('Risultante', legendX + 20, legendY + 12);
        }

        ctx.globalAlpha = 1.0;
    }

    // Add axis labels
    ctx.fillStyle = '#000';
    ctx.font = CHART_CONFIG.FONT_SIZE.AXIS_LABEL;
    ctx.textAlign = 'center';
    ctx.fillText('Frequenza (Hz)', canvas.width / 2, canvas.height - 10);

    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Ampiezza', 0, 0);
    ctx.restore();

    // Continue animation or finish
    if (progress < 1) {
        requestAnimationFrame(() => animateResonanceChart(canvas, ctx));
    } else {
        // Animation complete
        state.isAnimating = false;

        // Update stored data
        state.oldAxial = [...state.newAxial];
        state.oldTangential = [...state.newTangential];
        state.oldOblique = [...state.newOblique];
        state.oldCombined = [...state.newCombined];

        // Add interactive frequency display after animation completes
        addInteractiveFrequencyDisplay(canvas, maxFrequency, padding, width);

        // Create and display frequency table
        const allFrequenciesWithTypes = [];
        let frequencyNumber = 1;

        state.newAxial.forEach(freq => {
            allFrequenciesWithTypes.push({
                ...freq,
                type: 'axial',
                typeLabel: 'Assiale',
                number: frequencyNumber++
            });
        });

        state.newTangential.forEach(freq => {
            allFrequenciesWithTypes.push({
                ...freq,
                type: 'tangential',
                typeLabel: 'Tangenziale',
                number: frequencyNumber++
            });
        });

        state.newOblique.forEach(freq => {
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
}

// Function to animate standing waves chart transitions
function animateStandingWavesChart(canvas, ctx) {
    const state = canvas.animationState;
    const elapsed = performance.now() - state.startTime;
    const progress = Math.min(elapsed / state.duration, 1);

    // Apply linear easing function for uniform animation
    const easedProgress = easeSmoothLinear(progress);

    // Resize canvas to match container
    resizeCanvasToContainer(canvas);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set dimensions
    const padding = 60;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;

    // Sort waves by frequency
    const currentWaves = [...state.newWaves].sort((a, b) => parseFloat(a.frequency) - parseFloat(b.frequency));
    const oldWaves = [...state.oldWaves].sort((a, b) => parseFloat(a.frequency) - parseFloat(b.frequency));

    // Find max frequency and add 80Hz padding
    const maxFrequency = Math.max(...currentWaves.map(f => parseFloat(f.frequency))) + 80;

    // Draw axes
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.strokeStyle = '#000';
    ctx.stroke();

    // Draw frequency scale on x-axis
    ctx.font = CHART_CONFIG.FONT_SIZE.TICK_LABEL;
    const numTicks = 10;
    for (let i = 0; i <= numTicks; i++) {
        const x = padding + (width * i) / numTicks;
        const freqValue = (maxFrequency * i) / numTicks;

        // Draw tick
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - padding);
        ctx.lineTo(x, canvas.height - padding + 5);
        ctx.strokeStyle = '#000';
        ctx.stroke();

        // Draw label
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(Math.round(freqValue) + ' Hz', x, canvas.height - padding + 20);
    }

    // Define colors for dimensions using global constants
    const colors = {
        'Lunghezza': COLORS.LENGTH,
        'Larghezza': COLORS.WIDTH,
        'Altezza': COLORS.HEIGHT
    };

    // Group waves by dimension and mode
    const dimensionModeWaves = {};

    currentWaves.forEach(wave => {
        const key = wave.dimension;
        if (!dimensionModeWaves[key]) {
            dimensionModeWaves[key] = [];
        }
        dimensionModeWaves[key].push(wave);
    });

    // Prepare data for table
    const tableData = [];

    // Draw frequency lines with graduated opacity based on mode and animation
    Object.entries(dimensionModeWaves).forEach(([dimension, dimensionWaves]) => {
        // Sort by mode for each dimension
        dimensionWaves.sort((a, b) => a.mode - b.mode);

        dimensionWaves.forEach((wave, index) => {
            const x = padding + (parseFloat(wave.frequency) / maxFrequency) * width;
            const color = colors[dimension];
            const waveNumber = currentWaves.findIndex(w => w.frequency === wave.frequency && w.dimension === wave.dimension) + 1;

            // Add to table data
            tableData.push({
                number: waveNumber,
                dimension: wave.dimension,
                mode: wave.mode,
                frequency: wave.frequency
            });

            // Calculate opacity based on mode
            // First mode: 0.9, subsequent modes: gradually decreasing but not below 0.3
            const baseOpacity = 1;
            const minOpacity = 0.3;
            const opacityStep = (baseOpacity - minOpacity) / 8; // Gradual decrease
            let opacity = Math.max(baseOpacity - (wave.mode - 1) * opacityStep, minOpacity);

            // Apply fade-in effect for new waves
            const isNewWave = !oldWaves.some(oldWave =>
                oldWave.frequency === wave.frequency &&
                oldWave.dimension === wave.dimension &&
                oldWave.mode === wave.mode
            );

            if (isNewWave && progress < 0.5) {
                opacity *= (progress * 2);
            }

            // Draw line with appropriate opacity
            ctx.beginPath();
            ctx.moveTo(x, canvas.height - padding);
            ctx.lineTo(x, padding);
            ctx.strokeStyle = color;
            ctx.globalAlpha = opacity;
            ctx.stroke();

            // Draw numbered marker at bottom of line with the same opacity
            ctx.beginPath();
            ctx.arc(x, canvas.height - padding - 3, 8, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            // Draw number in marker
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = CHART_CONFIG.FONT_SIZE.BOLD;
            ctx.fillText(waveNumber, x, canvas.height - padding - 3);
        });
    });

    // Reset opacity for legend and other elements
    ctx.globalAlpha = 1.0;

    // Draw legend with fade-in effect
    const legendX = canvas.width - padding - 120;
    let legendY = padding + 20;
    const legendSpacing = 25;

    // Apply legend fade-in
    const legendAlpha = progress < 0.3 ? (progress / 0.3) : 1.0;
    ctx.globalAlpha = legendAlpha;

    // Length
    ctx.fillStyle = colors['Lunghezza'];
    ctx.fillRect(legendX, legendY, 15, 15);
    ctx.fillStyle = '#000';
    ctx.textAlign = 'left';
    ctx.font = CHART_CONFIG.FONT_SIZE.LEGEND;
    ctx.fillText('Lunghezza', legendX + 20, legendY + 12);
    legendY += legendSpacing;

    // Width
    ctx.fillStyle = colors['Larghezza'];
    ctx.fillRect(legendX, legendY, 15, 15);
    ctx.fillStyle = '#000';
    ctx.fillText('Larghezza', legendX + 20, legendY + 12);
    legendY += legendSpacing;

    // Height
    ctx.fillStyle = colors['Altezza'];
    ctx.fillRect(legendX, legendY, 15, 15);
    ctx.fillStyle = '#000';
    ctx.fillText('Altezza', legendX + 20, legendY + 12);

    // Add opacity legend
    ctx.textAlign = 'right';
    ctx.fillStyle = '#666';
    ctx.font = CHART_CONFIG.FONT_SIZE.LEGEND;
    ctx.fillText('* Opacità ridotta per i modi superiori', canvas.width - padding, canvas.height - 10);

    ctx.globalAlpha = 1.0;

    // Continue animation or finish
    if (progress < 1) {
        requestAnimationFrame(() => animateStandingWavesChart(canvas, ctx));
    } else {
        // Animation complete
        state.isAnimating = false;

        // Update stored data
        state.oldWaves = [...state.newWaves];

        // Create and display frequency table
        createFrequencyTable('standing-waves-results', tableData);
    }
}

// Easing function for smooth animations
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Linear easing function for more uniform animations
function easeLinear(t) {
    return t;
}

// Slightly smoothed linear easing (more natural than pure linear)
function easeSmoothLinear(t) {
    // Simple smoothstep-like function for subtle smoothing
    return t * t * (3 - 2 * t);
}

// Export functions
window.animateResonanceChart = animateResonanceChart;
window.animateStandingWavesChart = animateStandingWavesChart;
window.easeInOutCubic = easeInOutCubic;
window.easeLinear = easeLinear;
window.easeSmoothLinear = easeSmoothLinear;
