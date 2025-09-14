/**
 * Chart drawing module for rendering charts and graphs
 */

// Function to draw resonance chart with continuous signals
function drawResonanceChart(canvasId, axial, tangential, oblique) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');

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
        const oldMaxFrequency = allOldFrequencies.length > 0 ? Math.max(...allOldFrequencies.map(f => parseFloat(f.frequency))) + 80 : 1000;
        const oldAxialSignal = generateContinuousSignal(canvas.animationState.oldAxial, oldMaxFrequency, 'axial');
        const oldTangentialSignal = generateContinuousSignal(canvas.animationState.oldTangential, oldMaxFrequency, 'tangential');
        const oldObliqueSignal = generateContinuousSignal(canvas.animationState.oldOblique, oldMaxFrequency, 'oblique');
        canvas.animationState.oldCombined = combineSignals([oldAxialSignal, oldTangentialSignal, oldObliqueSignal]);
    }

    // If animating, use animation frame
    if (canvas.animationState.isAnimating) {
        requestAnimationFrame(() => animateResonanceChart(canvas, ctx));
        return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set dimensions
    const padding = 60;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;

    // Combine all frequencies for max frequency calculation
    const allFrequencies = [...axial, ...tangential, ...oblique];
    const maxFrequency = Math.max(...allFrequencies.map(f => parseFloat(f.frequency))) + 80;

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
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.strokeStyle = '#000';
    ctx.stroke();

    // Draw frequency scale on x-axis
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

    // Function to draw signal curve
    function drawSignal(signal, color, label, alpha = 0.8) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = alpha;

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

    // Info icon removed - now using button in description

    // Draw legend in top-right corner
    const legendX = canvas.width - padding - 120;
    let legendY = padding + 20;
    const legendSpacing = 25;

    // Count visible signals for legend
    const visibleCount = [showAxial && axial.length > 0, showTangential && tangential.length > 0,
                         showOblique && oblique.length > 0, showCombined && combinedSignal.length > 0]
                         .filter(Boolean).length;

    if (visibleCount > 0) {
        // Axial
        if (showAxial && axial.length > 0) {
            ctx.fillStyle = typeColors['axial'];
            ctx.fillRect(legendX, legendY, 15, 15);
            ctx.fillStyle = '#000';
            ctx.textAlign = 'left';
            ctx.font = '12px Arial';
            ctx.fillText('Assiale', legendX + 20, legendY + 12);
            legendY += legendSpacing;
        }

        // Tangential
        if (showTangential && tangential.length > 0) {
            ctx.fillStyle = typeColors['tangential'];
            ctx.fillRect(legendX, legendY, 15, 15);
            ctx.fillStyle = '#000';
            ctx.fillText('Tangenziale', legendX + 20, legendY + 12);
            legendY += legendSpacing;
        }

        // Oblique
        if (showOblique && oblique.length > 0) {
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
    }

    // Add axis labels
    ctx.fillStyle = '#000';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Frequenza (Hz)', canvas.width / 2, canvas.height - 10);

    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Ampiezza', 0, 0);
    ctx.restore();

    // Add interactive frequency display
    addInteractiveFrequencyDisplay(canvas, maxFrequency, padding, width);

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

    // If animating, use animation frame
    if (canvas.animationState.isAnimating) {
        requestAnimationFrame(() => animateStandingWavesChart(canvas, ctx));
        return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set dimensions
    const padding = 60;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;

    // Sort by frequency
    waves.sort((a, b) => parseFloat(a.frequency) - parseFloat(b.frequency));

    // Find max frequency and add 80Hz padding
    const maxFrequency = Math.max(...waves.map(f => parseFloat(f.frequency))) + 80;

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.strokeStyle = '#000';
    ctx.stroke();

    // Draw frequency scale on x-axis
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

    waves.forEach(wave => {
        const key = wave.dimension;
        if (!dimensionModeWaves[key]) {
            dimensionModeWaves[key] = [];
        }
        dimensionModeWaves[key].push(wave);
    });

    // Prepare data for table
    const tableData = [];

    // Draw frequency lines with graduated opacity based on mode
    Object.entries(dimensionModeWaves).forEach(([dimension, dimensionWaves]) => {
        // Sort by mode for each dimension
        dimensionWaves.sort((a, b) => a.mode - b.mode);

        dimensionWaves.forEach((wave, index) => {
            const x = padding + (parseFloat(wave.frequency) / maxFrequency) * width;
            const color = colors[dimension];
            const waveNumber = waves.findIndex(w => w.frequency === wave.frequency && w.dimension === wave.dimension) + 1;

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
            const opacity = Math.max(baseOpacity - (wave.mode - 1) * opacityStep, minOpacity);

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
            ctx.font = 'bold 9px Arial';
            ctx.fillText(waveNumber, x, canvas.height - padding - 3);
        });
    });

    // Reset opacity for legend and other elements
    ctx.globalAlpha = 1.0;

    // Draw legend
    const legendX = padding + 10;
    const legendY = padding + 20;

    // Length
    ctx.fillStyle = colors['Lunghezza'];
    ctx.fillRect(legendX, legendY, 15, 15);
    ctx.fillStyle = '#000';
    ctx.textAlign = 'left';
    ctx.font = '12px Arial';
    ctx.fillText('Lunghezza', legendX + 20, legendY + 12);

    // Width
    ctx.fillStyle = colors['Larghezza'];
    ctx.fillRect(legendX + 100, legendY, 15, 15);
    ctx.fillStyle = '#000';
    ctx.fillText('Larghezza', legendX + 120, legendY + 12);

    // Height
    ctx.fillStyle = colors['Altezza'];
    ctx.fillRect(legendX + 200, legendY, 15, 15);
    ctx.fillStyle = '#000';
    ctx.fillText('Altezza', legendX + 220, legendY + 12);

    // Add opacity legend
    ctx.textAlign = 'right';
    ctx.fillStyle = '#666';
    ctx.font = '11px Arial';
    ctx.fillText('* Opacità ridotta per i modi superiori', canvas.width - padding, canvas.height - 10);

    // Create and display frequency table only if data hasn't changed (animation will handle it otherwise)
    if (!dataChanged) {
        createFrequencyTable('standing-waves-results', tableData);
    }
}

// Export functions
window.drawResonanceChart = drawResonanceChart;
window.drawStandingWavesChart = drawStandingWavesChart;
