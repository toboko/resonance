/**
 * Calculations module for resonance and standing waves
 */

// Utility functions needed for calculations
function getModeType(p, q, r) {
    const nonZeroCount = (p > 0 ? 1 : 0) + (q > 0 ? 1 : 0) + (r > 0 ? 1 : 0);
    if (nonZeroCount === 1) return 'axial';
    else if (nonZeroCount === 2) return 'tangential';
    else return 'oblique';
}

// Function to calculate resonance frequencies
function calculateResonanceFrequencies(length, width, height, soundSpeed, maxModes) {
    const axialFrequencies = [];
    const tangentialFrequencies = [];
    const obliqueFrequencies = [];

    // Calculate resonance frequencies for different modes (p, q, r)
    // We need to iterate up to maxModes for each dimension
    for (let p = 0; p <= maxModes; p++) {
        for (let q = 0; q <= maxModes; q++) {
            for (let r = 0; r <= maxModes; r++) {
                // Skip the (0,0,0) mode
                if (p === 0 && q === 0 && r === 0) continue;

                // Skip modes where the sum of indices exceeds maxModes to keep calculation reasonable
                // This prevents excessive calculations for higher mode numbers
                if (p + q + r > maxModes * 2) continue;

                const pComponent = p / length;
                const qComponent = q / width;
                const rComponent = r / height;

                const frequency = (soundSpeed / 2) * Math.sqrt(
                    Math.pow(pComponent, 2) +
                    Math.pow(qComponent, 2) +
                    Math.pow(rComponent, 2)
                );

                const modeType = getModeType(p, q, r);
                const modeData = {
                    p: p,
                    q: q,
                    r: r,
                    frequency: frequency.toFixed(2),
                    mode: `(${p},${q},${r})`
                };

                if (modeType === 'axial') {
                    axialFrequencies.push(modeData);
                } else if (modeType === 'tangential') {
                    tangentialFrequencies.push(modeData);
                } else {
                    obliqueFrequencies.push(modeData);
                }
            }
        }
    }

    // Sort frequencies
    axialFrequencies.sort((a, b) => parseFloat(a.frequency) - parseFloat(b.frequency));
    tangentialFrequencies.sort((a, b) => parseFloat(a.frequency) - parseFloat(b.frequency));
    obliqueFrequencies.sort((a, b) => parseFloat(a.frequency) - parseFloat(b.frequency));

    return {
        axial: axialFrequencies,
        tangential: tangentialFrequencies,
        oblique: obliqueFrequencies
    };
}

// Function to calculate standing waves
function calculateStandingWaves(length, width, height, soundSpeed, maxModes) {
    const standingWaves = [];

    // Calculate standing waves for each dimension
    for (let i = 1; i <= maxModes; i++) {
        // Length dimension
        const freqLength = soundSpeed / (2 * length) * i;
        standingWaves.push({
            dimension: 'Lunghezza',
            mode: i,
            frequency: freqLength.toFixed(2)
        });

        // Width dimension
        const freqWidth = soundSpeed / (2 * width) * i;
        standingWaves.push({
            dimension: 'Larghezza',
            mode: i,
            frequency: freqWidth.toFixed(2)
        });

        // Height dimension
        const freqHeight = soundSpeed / (2 * height) * i;
        standingWaves.push({
            dimension: 'Altezza',
            mode: i,
            frequency: freqHeight.toFixed(2)
        });
    }

    // Sort by frequency
    standingWaves.sort((a, b) => parseFloat(a.frequency) - parseFloat(b.frequency));

    return standingWaves;
}

function calculateBothSections() {
    // Get values from the active tab
    const length = parseFloat($('#room-length').val());
    const width = parseFloat($('#room-width').val());
    const height = parseFloat($('#room-height').val());

    // Get sound speed value
    let soundSpeed;
    if ($('#sound-speed').val() === 'custom') {
        soundSpeed = parseFloat($('#custom-sound-speed').val());
    } else {
        soundSpeed = parseFloat($('#sound-speed').val());
    }

    // Get max modes value
    let maxModes;
    if ($('#max-modes').val() === 'custom') {
        maxModes = parseInt($('#custom-max-modes').val());
    } else {
        maxModes = parseInt($('#max-modes').val());
    }

    // Calculate resonance frequencies
    const resonanceResults = calculateResonanceFrequencies(length, width, height, soundSpeed, maxModes);

    // Calculate standing waves
    const standingWavesResults = calculateStandingWaves(length, width, height, soundSpeed, maxModes);

    // Display results
    displayResonanceResults('axial-results', resonanceResults.axial);
    displayResonanceResults('tangential-results', resonanceResults.tangential);
    displayResonanceResults('oblique-results', resonanceResults.oblique);
    displayStandingWavesResults('standing-waves-results', standingWavesResults);

    // Draw charts
    drawResonanceChart('frequency-chart', resonanceResults.axial, resonanceResults.tangential, resonanceResults.oblique);
    drawStandingWavesChart('standing-waves-chart', standingWavesResults);

    // Sync form values between tabs
    syncFormValues();
}

// Export functions for use in other modules
window.calculateResonanceFrequencies = calculateResonanceFrequencies;
window.calculateStandingWaves = calculateStandingWaves;
window.calculateBothSections = calculateBothSections;
