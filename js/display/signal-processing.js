/**
 * Signal processing module for generating and combining signals
 */

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

// Export functions
window.generateContinuousSignal = generateContinuousSignal;
window.combineSignals = combineSignals;
window.interpolateSignals = interpolateSignals;
