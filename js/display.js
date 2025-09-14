/**
 * Display module for rendering results, charts, and tables
 */

// Function to display resonance results
function displayResonanceResults(containerId, frequencies) {
    const container = $('#' + containerId);
    container.empty();

    if (frequencies.length === 0) {
        container.append('<p>Nessun risultato disponibile.</p>');
        return;
    }

    // Display only the first 10 frequencies to avoid overwhelming the UI
    const displayFrequencies = frequencies.slice(0, 10);

    displayFrequencies.forEach(freq => {
        const item = $('<div class="result-item"></div>');
        item.append(`<span>Modo ${freq.mode}</span>`);
        item.append(`<span>${freq.frequency} Hz</span>`);
        container.append(item);
    });
}

// Function to display standing waves results
function displayStandingWavesResults(containerId, waves) {
    const container = $('#' + containerId);
    container.empty();

    if (waves.length === 0) {
        container.append('<p>Nessun risultato disponibile.</p>');
        return;
    }

    // Group by dimension
    const dimensionGroups = {
        'Lunghezza': [],
        'Larghezza': [],
        'Altezza': []
    };

    waves.forEach(wave => {
        dimensionGroups[wave.dimension].push(wave);
    });

    // Create a table for each dimension
    for (const [dimension, wavesList] of Object.entries(dimensionGroups)) {
        const table = $('<table class="waves-table"></table>');
        table.append(`
            <thead>
                <tr>
                    <th colspan="3">${dimension}</th>
                </tr>
                <tr>
                    <th>Modo</th>
                    <th>Frequenza (Hz)</th>
                </tr>
            </thead>
        `);

        const tbody = $('<tbody></tbody>');
        wavesList.forEach(wave => {
            tbody.append(`
                <tr>
                    <td>${wave.mode}</td>
                    <td>${wave.frequency}</td>
                </tr>
            `);
        });

        table.append(tbody);
        container.append(table);
    }
}

// Function to generate continuous signal from frequency data
function generateContinuousSignal(frequencies, maxFrequency, modeType, resolution = 1000) {
    const signal = new Array(resolution).fill(0);
    const frequencyStep = maxFrequency / resolution;

    // Get the current max modes setting to make normalization adaptive
    const maxModes = parseInt($('#max-modes').val()) || 10;

    // Adaptive expected counts based on max modes setting
    const baseMultiplier = Math.max(1, maxModes - 1); // Scale with max modes: 2→1, 3→2, 4→3, etc.

    // Adaptive expected counts based on max modes setting (physically realistic)
    const expectedCounts = {
        'axial': Math.round(1 * baseMultiplier),      // Axial modes are less numerous
        'tangential': Math.round(5 * baseMultiplier), // Tangential modes are intermediate
        'oblique': Math.round(10 * baseMultiplier)     // Oblique modes are most numerous
    };

    const expectedCount = expectedCounts[modeType] || frequencies.length;

    // Create frequency bands for per-band normalization
    const numBands = 10;
    const bandWidth = maxFrequency / numBands;
    const frequenciesInBand = new Array(numBands).fill(0);

    // Count frequencies in each band
    frequencies.forEach(freq => {
        const freqValue = parseFloat(freq.frequency);
        const bandIndex = Math.min(Math.floor(freqValue / bandWidth), numBands - 1);
        frequenciesInBand[bandIndex]++;
    });

    frequencies.forEach(freq => {
        const freqValue = parseFloat(freq.frequency);
        const freqIndex = Math.floor(freqValue / frequencyStep);

        // Calculate complexity for amplitude scaling
        const complexity = freq.p + freq.q + freq.r;
        const baseAmplitude = 1.0;
        const amplitude = Math.max(baseAmplitude - (complexity - 1) * 0.1, 0.3);

        // Apply empirical amplitude scaling based on modal type (from acoustic practice)
        let physicsAmplitude = amplitude;
        if (modeType === 'axial') {
            physicsAmplitude *= 1.0;    // Reference: most efficient energy transfer
        } else if (modeType === 'tangential') {
            physicsAmplitude *= 0.71;   // Empirical factor for tangential modes
        } else if (modeType === 'oblique') {
            physicsAmplitude *= 0.58;   // Empirical factor for oblique modes
        }

        // Apply stronger normalization based on expected count for this mode type
        const normalizationFactor = Math.sqrt(expectedCount);
        let normalizedAmplitude = amplitude / normalizationFactor;

        // Apply per-band normalization to prevent crowding in dense frequency regions
        const bandIndex = Math.min(Math.floor(freqValue / bandWidth), numBands - 1);
        const bandNormalization = frequenciesInBand[bandIndex] > 0 ? 1 / Math.sqrt(frequenciesInBand[bandIndex]) : 1;
        normalizedAmplitude *= bandNormalization;

        // Apply tapering for high frequencies to reduce central peaking
        const taperingFactor = Math.max(0.1, 1 - (freqValue / maxFrequency) * 0.7);
        normalizedAmplitude *= taperingFactor;

        // Create a Laplace distribution around the frequency (sharper than Gaussian)
        const b = Math.max(freqValue * 0.01, 2); // Scale parameter for Laplace distribution

        for (let i = 0; i < resolution; i++) {
            const currentFreq = i * frequencyStep;
            const distance = Math.abs(currentFreq - freqValue);

            // Laplace distribution: (1/(2b)) * exp(-|x|/b)
            const laplace = (1 / (2 * b)) * Math.exp(-distance / b);
            signal[i] += normalizedAmplitude * laplace;
        }
    });

    return signal;
}

// Function to combine multiple signals
function combineSignals(signals) {
    if (signals.length === 0) return [];

    const length = signals[0].length;
    const combined = new Array(length).fill(0);

    signals.forEach(signal => {
        for (let i = 0; i < length; i++) {
            combined[i] += signal[i];
        }
    });

    return combined;
}

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

    // Define colors for mode types
    const typeColors = {
        'axial': '#ff6384', // Red
        'tangential': '#36a2eb', // Blue
        'oblique': '#ffce56', // Yellow
        'combined': '#9c88ff' // Purple for combined
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
            ctx.textAlign = 'left';
            ctx.font = '12px Arial';
            ctx.fillText('Tangenziale', legendX + 20, legendY + 12);
            legendY += legendSpacing;
        }

        // Oblique
        if (showOblique && oblique.length > 0) {
            ctx.fillStyle = typeColors['oblique'];
            ctx.fillRect(legendX, legendY, 15, 15);
            ctx.fillStyle = '#000';
            ctx.textAlign = 'left';
            ctx.font = '12px Arial';
            ctx.fillText('Obliqua', legendX + 20, legendY + 12);
            legendY += legendSpacing;
        }

        // Combined
        if (showCombined && combinedSignal.length > 0) {
            ctx.fillStyle = typeColors['combined'];
            ctx.fillRect(legendX, legendY, 15, 15);
            ctx.fillStyle = '#000';
            ctx.textAlign = 'left';
            ctx.font = '12px Arial';
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

    // Define colors for dimensions
    const colors = {
        'Lunghezza': '#ff6384', // Red
        'Larghezza': '#36a2eb', // Blue
        'Altezza': '#4bc0c0'    // Green
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
            // Keep the same opacity for the circle
            ctx.fill();

            // Draw number in marker
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 9px Arial';
            // Keep the same opacity for the number
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

// Nuova funzione per creare la tabella delle risonanze
function createResonanceTable(axialContainerId, tangentialContainerId, obliqueContainerId, frequencies) {
    // Raggruppa le frequenze per tipo
    const typeGroups = {
        'axial': [],
        'tangential': [],
        'oblique': []
    };

    frequencies.forEach(freq => {
        typeGroups[freq.type].push(freq);
    });

    // Definisci i colori per i tipi di modo
    const typeColors = {
        'axial': '#ff6384', // Red
        'tangential': '#36a2eb', // Blue
        'oblique': '#ffce56' // Yellow
    };

    // Funzione per creare una tabella per un tipo specifico con toggle a fisarmonica
    function createTypeTable(containerId, frequencies, type) {
        const container = $('#' + containerId);
        container.empty();

        if (frequencies.length === 0) {
            container.append('<p>Nessun risultato disponibile.</p>');
            return;
        }

        // Aggiungi informazioni sul numero totale di risultati
        container.append(`<div class="results-summary">Totale: ${frequencies.length} risultati</div>`);

        // Crea la tabella principale
        const table = $('<table class="frequency-table"></table>');

        // Aggiungi l'intestazione
        const thead = $('<thead></thead>');
        thead.append(`
        <tr>
            <th class="col-number">#</th>
            <th class="col-mode">Modo (p,q,r)</th>
            <th class="col-freq">Frequenza (Hz)</th>
        </tr>
    `);
        table.append(thead);

        // Dividi i risultati in gruppi di 10
        const groupSize = 10;
        const groupCount = Math.ceil(frequencies.length / groupSize);

        // Aggiungi il corpo della tabella - un unico tbody per tutta la tabella
        const tbody = $('<tbody></tbody>');
        table.append(tbody);

        for (let groupIndex = 0; groupIndex < groupCount; groupIndex++) {
            const startIndex = groupIndex * groupSize;
            const endIndex = Math.min(startIndex + groupSize, frequencies.length);
            const groupFrequencies = frequencies.slice(startIndex, endIndex);

            // Calcola l'intervallo di frequenze per questo gruppo
            const minFreq = parseFloat(groupFrequencies[0].frequency).toFixed(1);
            const maxFreq = parseFloat(groupFrequencies[groupFrequencies.length - 1].frequency).toFixed(1);

            // Crea una riga di intestazione per il gruppo con toggle
            const groupHeaderId = `${type}-header-${groupIndex}`;
            const groupContentId = `${type}-content-${groupIndex}`;

            const groupHeader = $(`
            <tr id="${groupHeaderId}" class="group-header">
                <td colspan="3">
                    <div class="group-toggle">
                        <span class="toggle-icon">▼</span>
                        Frequenze ${startIndex + 1}-${endIndex}
                        <span class="frequency-range">
                            (${minFreq} - ${maxFreq} Hz)
                        </span>
                    </div>
                </td>
            </tr>
        `);
            tbody.append(groupHeader);

            // Crea le righe del gruppo e aggiungile direttamente al tbody principale
            // Avvolgi le righe in un div con ID per poterle selezionare facilmente per il toggle
            const groupRows = $(`<tr><td colspan="3" class="p-0"><div id="${groupContentId}" class="group-content"></div></td></tr>`);
            const groupContent = groupRows.find(`#${groupContentId}`);

            // Crea una tabella interna per le righe del gruppo
            const innerTable = $('<table class="w-100"></table>');

            // Aggiungi le righe del gruppo alla tabella interna
            groupFrequencies.forEach(freq => {
                const row = $(`
                <tr>
                    <td class="col-number"><span class="number-marker" style="background-color: ${typeColors[type]}">${freq.number}</span></td>
                    <td class="col-mode">(${freq.p},${freq.q},${freq.r})</td>
                    <td class="col-freq">${freq.frequency}</td>
                </tr>
            `);
                innerTable.append(row);
            });

            // Aggiungi la tabella interna al div del contenuto del gruppo
            groupContent.append(innerTable);

            // Aggiungi le righe del gruppo al tbody principale
            tbody.append(groupRows);

            // Se non è il primo gruppo, nascondi le righe all'inizio
            if (groupIndex > 0) {
                groupContent.hide();
            }

            // Aggiungi il gestore di eventi per il toggle
            groupHeader.on('click', function() {
                const content = $(`#${groupContentId}`);
                content.toggle();

                // Cambia l'icona del toggle
                const toggleIcon = $(this).find('.toggle-icon');
                if (content.is(':visible')) {
                    toggleIcon.text('▼');
                } else {
                    toggleIcon.text('►');
                }
            });
        }

        container.append(table);
    }

    // Crea le tabelle per ogni tipo
    createTypeTable(axialContainerId, typeGroups['axial'], 'axial');
    createTypeTable(tangentialContainerId, typeGroups['tangential'], 'tangential');
    createTypeTable(obliqueContainerId, typeGroups['oblique'], 'oblique');

    // Aggiungi CSS per la tabella se non è già presente in styles.css
    if (!$('#frequency-table-styles').length) {
        $('head').append(`
        <style id="frequency-table-styles">
            .results-summary {
                font-size: 12px;
                color: #666;
                margin-bottom: 5px;
            }
            .frequency-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 5px;
                margin-bottom: 20px;
                table-layout: fixed;
            }
            .frequency-table th, .frequency-table td {
                padding: 8px;
                text-align: left;
                border-bottom: 1px solid #ddd;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .frequency-table th.col-number,
            .frequency-table td.col-number {
                width: 60px;
                text-align: center;
            }
            .frequency-table th.col-mode,
            .frequency-table td.col-mode {
                width: 110px;
                text-align: center;
            }
            .frequency-table th.col-freq,
            .frequency-table td.col-freq {
                width: auto;
                text-align: right;
                padding-right: 20px;
            }
            .frequency-table th {
                background-color: #f2f2f2;
                font-weight: bold;
            }
            .p-0 {
                padding: 0 !important;
            }
            .w-100 {
                width: 100%;
            }
            .group-content table {
                border-collapse: collapse;
            }
            .group-content tr:nth-child(even) {
                background-color: #f9f9f9;
            }
            .group-header {
                background-color: #eaeaea;
                cursor: pointer;
            }
            .group-header:hover {
                background-color: #e0e0e0;
            }
            .group-toggle {
                font-weight: bold;
                display: flex;
                align-items: center;
            }
            .toggle-icon {
                margin-right: 8px;
                font-size: 10px;
            }
            .frequency-range {
                font-weight: normal;
                color: #666;
                margin-left: 10px;
            }
            .number-marker {
                display: inline-block;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                color: white;
                text-align: center;
                line-height: 20px;
                font-weight: bold;
                font-size: 12px;
            }
            .table-note {
                font-size: 12px;
                color: #666;
                font-style: italic;
                margin-top: 5px;
            }
        </style>
    `);
    }
}

// Nuova funzione per creare la tabella delle frequenze
function createFrequencyTable(containerId, data) {
    const container = $('#' + containerId);
    container.empty();

    // Raggruppa i dati per modo
    const modeGroups = {};
    const dimensionColors = {
        'Lunghezza': '#ff6384',
        'Larghezza': '#36a2eb',
        'Altezza': '#4bc0c0'
    };

    // Trova il modo massimo
    let maxMode = 0;
    data.forEach(item => {
        if (item.mode > maxMode) maxMode = item.mode;
    });

    // Inizializza la struttura dei gruppi per modo
    for (let i = 1; i <= maxMode; i++) {
        modeGroups[i] = {
            'Lunghezza': null,
            'Larghezza': null,
            'Altezza': null
        };
    }

    // Popola i gruppi con i dati
    data.forEach(item => {
        modeGroups[item.mode][item.dimension] = {
            number: item.number,
            frequency: item.frequency
        };
    });

    // Crea la tabella
    const table = $('<table class="frequency-table"></table>');

    // Aggiungi l'intestazione
    const thead = $('<thead></thead>');
    thead.append(`
    <tr>
        <th>Modo</th>
        <th>Lunghezza</th>
        <th>Larghezza</th>
        <th>Altezza</th>
    </tr>
`);
    table.append(thead);

    // Aggiungi il corpo della tabella
    const tbody = $('<tbody></tbody>');

    for (let mode = 1; mode <= maxMode; mode++) {
        const row = $('<tr></tr>');

        // Colonna del modo
        row.append(`<td>${mode}</td>`);

        // Colonne per ogni dimensione
        ['Lunghezza', 'Larghezza', 'Altezza'].forEach(dimension => {
            const data = modeGroups[mode][dimension];
            if (data) {
                row.append(`
                <td>
                    <span class="number-marker" style="background-color: ${dimensionColors[dimension]}">${data.number}</span>
                    ${data.frequency} Hz
                </td>
            `);
            } else {
                row.append('<td>-</td>');
            }
        });

        tbody.append(row);
    }

    table.append(tbody);

    // Aggiungi la tabella al container
    container.append(table);

    // Aggiungi una nota sulla tabella
    container.append('<p class="table-note">* I numeri nei cerchi colorati corrispondono ai marcatori nel grafico sotto</p>');

    // Aggiungi CSS per la tabella se non è già presente in styles.css
    if (!$('#frequency-table-styles').length) {
        $('head').append(`
        <style id="frequency-table-styles">
            .frequency-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
                margin-bottom: 20px;
            }
            .frequency-table th, .frequency-table td {
                padding: 8px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            .frequency-table th {
                background-color: #f2f2f2;
                font-weight: bold;
            }
            .frequency-table tr:nth-child(even) {
                background-color: #f9f9f9;
            }
            .number-marker {
                display: inline-block;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                color: white;
                text-align: center;
                line-height: 20px;
                font-weight: bold;
                font-size: 12px;
                margin-right: 8px;
            }
            .table-note {
                font-size: 12px;
                color: #666;
                font-style: italic;
                margin-top: 5px;
            }
        </style>
    `);
    }
}

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

// Helper function to compare arrays of frequency objects
function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (!a[i] || !b[i]) return false;
        if (a[i].frequency !== b[i].frequency ||
            a[i].mode !== b[i].mode ||
            a[i].p !== b[i].p ||
            a[i].q !== b[i].q ||
            a[i].r !== b[i].r) {
            return false;
        }
    }
    return true;
}

// Function to interpolate between two signals
function interpolateSignals(signal1, signal2, progress) {
    if (!signal1 || !signal2 || signal1.length !== signal2.length) {
        return signal2 || signal1 || [];
    }

    const result = new Array(signal1.length);
    for (let i = 0; i < signal1.length; i++) {
        result[i] = signal1[i] + (signal2[i] - signal1[i]) * progress;
    }
    return result;
}

// Function to animate resonance chart transitions
function animateResonanceChart(canvas, ctx) {
    const state = canvas.animationState;
    const elapsed = performance.now() - state.startTime;
    const progress = Math.min(elapsed / state.duration, 1);

    // Apply linear easing function for uniform animation
    const easedProgress = easeSmoothLinear(progress);

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

    // Define colors for mode types
    const typeColors = {
        'axial': '#ff6384', // Red
        'tangential': '#36a2eb', // Blue
        'oblique': '#ffce56', // Yellow
        'combined': '#9c88ff' // Purple for combined
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
            ctx.font = '12px Arial';
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
    ctx.font = '14px Arial';
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

    // Define colors for dimensions
    const colors = {
        'Lunghezza': '#ff6384', // Red
        'Larghezza': '#36a2eb', // Blue
        'Altezza': '#4bc0c0'    // Green
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
            ctx.font = 'bold 9px Arial';
            ctx.fillText(waveNumber, x, canvas.height - padding - 3);
        });
    });

    // Reset opacity for legend and other elements
    ctx.globalAlpha = 1.0;

    // Draw legend with fade-in effect
    const legendX = padding + 10;
    const legendY = padding + 20;

    // Apply legend fade-in
    const legendAlpha = progress < 0.3 ? (progress / 0.3) : 1.0;
    ctx.globalAlpha = legendAlpha;

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

// Export functions for use in other modules
window.displayResonanceResults = displayResonanceResults;
window.displayStandingWavesResults = displayStandingWavesResults;
window.drawResonanceChart = drawResonanceChart;
window.drawStandingWavesChart = drawStandingWavesChart;
window.createResonanceTable = createResonanceTable;
window.createFrequencyTable = createFrequencyTable;
window.addInteractiveFrequencyDisplay = addInteractiveFrequencyDisplay;
