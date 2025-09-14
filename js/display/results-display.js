/**
 * Results display module for showing basic results
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

// Export functions
window.displayResonanceResults = displayResonanceResults;
window.displayStandingWavesResults = displayStandingWavesResults;
