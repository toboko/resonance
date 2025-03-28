$(document).ready(function () {
    // Tab switching functionality
    $('.tab-button').on('click', function () {
        const tabId = $(this).data('tab');

        // Update active tab button
        $('.tab-button').removeClass('active');
        $(this).addClass('active');

        // Show selected tab content
        $('.tab-content').removeClass('active');
        $('#' + tabId).addClass('active');
    });

    // Handle custom sound speed selection
    $('#sound-speed').on('change', function () {
        if ($(this).val() === 'custom') {
            $('#custom-sound-speed-container').show();
        } else {
            $('#custom-sound-speed-container').hide();
        }
        // Sync with standing waves
        $('#sw-sound-speed').val($(this).val());
        if ($(this).val() === 'custom') {
            $('#sw-custom-sound-speed-container').show();
            $('#sw-custom-sound-speed').val($('#custom-sound-speed').val());
        } else {
            $('#sw-custom-sound-speed-container').hide();
        }
    });

    $('#sw-sound-speed').on('change', function () {
        if ($(this).val() === 'custom') {
            $('#sw-custom-sound-speed-container').show();
        } else {
            $('#sw-custom-sound-speed-container').hide();
        }
        // Sync with resonance
        $('#sound-speed').val($(this).val());
        if ($(this).val() === 'custom') {
            $('#custom-sound-speed-container').show();
            $('#custom-sound-speed').val($('#sw-custom-sound-speed').val());
        } else {
            $('#custom-sound-speed-container').hide();
        }
    });

    // Sync custom sound speed values
    $('#custom-sound-speed').on('input', function() {
        $('#sw-custom-sound-speed').val($(this).val());
    });

    $('#sw-custom-sound-speed').on('input', function() {
        $('#custom-sound-speed').val($(this).val());
    });

    // Handle custom max modes selection
    $('#max-modes').on('change', function () {
        if ($(this).val() === 'custom') {
            $('#custom-max-modes-container').show();
        } else {
            $('#custom-max-modes-container').hide();
        }
        // Sync with standing waves
        $('#sw-max-modes').val($(this).val());
        if ($(this).val() === 'custom') {
            $('#sw-custom-max-modes-container').show();
            $('#sw-custom-max-modes').val($('#custom-max-modes').val());
        } else {
            $('#sw-custom-max-modes-container').hide();
        }
    });

    $('#sw-max-modes').on('change', function () {
        if ($(this).val() === 'custom') {
            $('#sw-custom-max-modes-container').show();
        } else {
            $('#sw-custom-max-modes-container').hide();
        }
        // Sync with resonance
        $('#max-modes').val($(this).val());
        if ($(this).val() === 'custom') {
            $('#custom-max-modes-container').show();
            $('#custom-max-modes').val($('#sw-custom-max-modes').val());
        } else {
            $('#custom-max-modes-container').hide();
        }
    });

    // Sync custom max modes values
    $('#custom-max-modes').on('input', function() {
        $('#sw-custom-max-modes').val($(this).val());
    });

    $('#sw-custom-max-modes').on('input', function() {
        $('#custom-max-modes').val($(this).val());
    });

    // Sync room dimensions
    $('#room-length').on('input', function() {
        $('#sw-length').val($(this).val());
    });

    $('#sw-length').on('input', function() {
        $('#room-length').val($(this).val());
    });

    $('#room-width').on('input', function() {
        $('#sw-width').val($(this).val());
    });

    $('#sw-width').on('input', function() {
        $('#room-width').val($(this).val());
    });

    $('#room-height').on('input', function() {
        $('#sw-height').val($(this).val());
    });

    $('#sw-height').on('input', function() {
        $('#room-height').val($(this).val());
    });

    // Calculate resonance and standing waves frequencies
    $('#calculate-resonance, #calculate-standing-waves').on('click', function() {
        // If clicked from standing waves tab, first sync values to resonance form
        if ($(this).attr('id') === 'calculate-standing-waves') {
            // Update resonance form with standing waves form values
            $('#room-length').val($('#sw-length').val());
            $('#room-width').val($('#sw-width').val());
            $('#room-height').val($('#sw-height').val());

            $('#sound-speed').val($('#sw-sound-speed').val());
            if ($('#sw-sound-speed').val() === 'custom') {
                $('#custom-sound-speed-container').show();
                $('#custom-sound-speed').val($('#sw-custom-sound-speed').val());
            }

            $('#max-modes').val($('#sw-max-modes').val());
            if ($('#sw-max-modes').val() === 'custom') {
                $('#custom-max-modes-container').show();
                $('#custom-max-modes').val($('#sw-custom-max-modes').val());
            }
        }

        // Calculate both sections
        calculateBothSections();
    });

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

        // Display results
        displayResonanceResults('axial-results', axialFrequencies);
        displayResonanceResults('tangential-results', tangentialFrequencies);
        displayResonanceResults('oblique-results', obliqueFrequencies);

        // Draw chart
        drawResonanceChart('frequency-chart', axialFrequencies, tangentialFrequencies, obliqueFrequencies);
    }

    // Function to determine mode type
    function getModeType(p, q, r) {
        const nonZeroCount = (p > 0 ? 1 : 0) + (q > 0 ? 1 : 0) + (r > 0 ? 1 : 0);

        if (nonZeroCount === 1) {
            return 'axial';
        } else if (nonZeroCount === 2) {
            return 'tangential';
        } else {
            return 'oblique';
        }
    }

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

        // Display results
        displayStandingWavesResults('standing-waves-results', standingWaves);

        // Draw chart
        drawStandingWavesChart('standing-waves-chart', standingWaves);
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

    // Function to draw resonance chart
    function drawResonanceChart(canvasId, axial, tangential, oblique) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set dimensions
        const padding = 60;
        const width = canvas.width - padding * 2;
        const height = canvas.height - padding * 2;

        // Combine all frequencies
        const allFrequencies = [];
        let frequencyNumber = 1;

        // Add axial frequencies with type info
        axial.forEach(freq => {
            allFrequencies.push({
                ...freq,
                type: 'axial',
                typeLabel: 'Assiale',
                number: frequencyNumber++
            });
        });

        // Add tangential frequencies with type info
        tangential.forEach(freq => {
            allFrequencies.push({
                ...freq,
                type: 'tangential',
                typeLabel: 'Tangenziale',
                number: frequencyNumber++
            });
        });

        // Add oblique frequencies with type info
        oblique.forEach(freq => {
            allFrequencies.push({
                ...freq,
                type: 'oblique',
                typeLabel: 'Obliqua',
                number: frequencyNumber++
            });
        });

        // Sort by frequency
        allFrequencies.sort((a, b) => parseFloat(a.frequency) - parseFloat(b.frequency));

        // Find max frequency for scaling and add 80Hz padding
        const maxFrequency = Math.max(...allFrequencies.map(f => parseFloat(f.frequency))) + 80;

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

        // Define colors for mode types
        const typeColors = {
            'axial': '#ff6384', // Red
            'tangential': '#36a2eb', // Blue
            'oblique': '#ffce56' // Yellow
        };

        // Group frequencies by type
        const typeGroups = {
            'axial': [],
            'tangential': [],
            'oblique': []
        };

        allFrequencies.forEach(freq => {
            typeGroups[freq.type].push(freq);
        });

        // Draw frequency lines for each type
        Object.entries(typeGroups).forEach(([type, frequencies]) => {
            // Sort by complexity within each type
            frequencies.sort((a, b) => (a.p + a.q + a.r) - (b.p + b.q + b.r));

            frequencies.forEach((freq, index) => {
                const x = padding + (parseFloat(freq.frequency) / maxFrequency) * width;
                const color = typeColors[type];

                // Calculate complexity based on sum of mode indices (p+q+r)
                const complexity = freq.p + freq.q + freq.r;

                // Calculate opacity based on complexity
                // Lower complexity (simpler modes) = higher opacity
                const baseOpacity = 1.0;
                const minOpacity = 0.3;
                const opacityStep = 0.1;
                const opacity = Math.max(baseOpacity - (complexity - 1) * opacityStep, minOpacity);

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
                ctx.fillText(freq.number, x, canvas.height - padding - 3);
            });
        });

        // Reset opacity for legend and other elements
        ctx.globalAlpha = 1.0;

        // Draw legend
        const legendX = padding + 10;
        const legendY = padding + 20;

        // Axial
        ctx.fillStyle = typeColors['axial'];
        ctx.fillRect(legendX, legendY, 15, 15);
        ctx.fillStyle = '#000';
        ctx.textAlign = 'left';
        ctx.font = '12px Arial';
        ctx.fillText('Assiale', legendX + 20, legendY + 12);

        // Tangential
        ctx.fillStyle = typeColors['tangential'];
        ctx.fillRect(legendX + 100, legendY, 15, 15);
        ctx.fillStyle = '#000';
        ctx.fillText('Tangenziale', legendX + 120, legendY + 12);

        // Oblique
        ctx.fillStyle = typeColors['oblique'];
        ctx.fillRect(legendX + 220, legendY, 15, 15);
        ctx.fillStyle = '#000';
        ctx.fillText('Obliqua', legendX + 240, legendY + 12);

        // Add opacity legend
        ctx.textAlign = 'right';
        ctx.fillStyle = '#666';
        ctx.font = '11px Arial';
        ctx.fillText('* Opacità ridotta per i modi più complessi', canvas.width - padding, canvas.height - 10);

        // Create and display frequency table
        createResonanceTable('axial-results', 'tangential-results', 'oblique-results', allFrequencies);
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

            // Aggiungi una nota sulla tabella
            container.append('<p class="table-note">* I numeri nei cerchi colorati corrispondono ai marcatori nel grafico sotto</p>');
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

    // Function to draw standing waves chart - IMPROVED VERSION
    function drawStandingWavesChart(canvasId, waves) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');

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

        // Create and display frequency table
        createFrequencyTable('standing-waves-results', tableData);
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

    // Helper function to draw chart with specific max frequency
    function drawStandingWavesChartWithMaxFreq(canvasId, waves, maxFreqToShow) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set dimensions
        const padding = 60;
        const width = canvas.width - padding * 2;
        const height = canvas.height - padding * 2;

        // Find max frequency for reference
        const maxFrequency = Math.max(...waves.map(f => parseFloat(f.frequency)));

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
            const freqValue = (maxFreqToShow * i) / numTicks;

            // Draw tick
            ctx.beginPath();
            ctx.moveTo(x, canvas.height - padding);
            ctx.lineTo(x, canvas.height - padding + 5);
            ctx.strokeStyle = '#000';
            ctx.stroke();

            // Draw label
            ctx.fillStyle = '#000';
            ctx.textAlign = 'center';
            ctx.fillText(freqValue.toFixed(0) + ' Hz', x, canvas.height - padding + 20);
        }

        // Define colors for dimensions
        const colors = {
            'Lunghezza': '#ff6384', // Red
            'Larghezza': '#36a2eb', // Blue
            'Altezza': '#4bc0c0'    // Green
        };

        // Group waves by dimension
        const dimensionWaves = {
            'Lunghezza': [],
            'Larghezza': [],
            'Altezza': []
        };

        waves.forEach(wave => {
            if (parseFloat(wave.frequency) <= maxFreqToShow) {
                dimensionWaves[wave.dimension].push(wave);
            }
        });

        // Draw frequency lines by dimension with slight vertical offset
        const dimensionOffsets = {
            'Lunghezza': -10,
            'Larghezza': 0,
            'Altezza': 10
        };

        // Draw lines for each dimension separately
        Object.entries(dimensionWaves).forEach(([dimension, wavesList]) => {
            const color = colors[dimension];
            const verticalOffset = dimensionOffsets[dimension];

            wavesList.forEach(wave => {
                const freq = parseFloat(wave.frequency);
                if (freq > maxFreqToShow) return;

                const x = padding + (freq / maxFreqToShow) * width;

                // Draw line
                ctx.beginPath();
                ctx.moveTo(x, canvas.height - padding);
                ctx.lineTo(x, padding);
                ctx.strokeStyle = color;
                ctx.globalAlpha = 0.5;
                ctx.stroke();
                ctx.globalAlpha = 1.0;

                // Draw mode indicator
                ctx.beginPath();
                ctx.arc(x, padding + 40 + verticalOffset, 3, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();

                // Draw frequency value for selected modes
                if (wave.mode % 2 === 0 || wave.mode === 1) {
                    const labelY = padding + 30 + verticalOffset;
                    ctx.fillStyle = color;
                    ctx.textAlign = 'center';
                    ctx.font = '10px Arial';
                    ctx.fillText(`${wave.mode}`, x, labelY);
                }
            });
        });

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

        // Add note about frequency range
        if (maxFrequency > maxFreqToShow) {
            ctx.fillStyle = '#666';
            ctx.textAlign = 'right';
            ctx.font = '11px Arial';
            ctx.fillText(`* Grafico limitato a ${maxFreqToShow}Hz per maggiore leggibilità. Frequenza massima calcolata: ${maxFrequency.toFixed(0)}Hz`,
                canvas.width - padding, canvas.height - 10);
        }
    }

    // Initialize the sync between forms when the page loads
    function initializeFormSync() {
        // Set initial values from resonance to standing waves
        $('#sw-length').val($('#room-length').val());
        $('#sw-width').val($('#room-width').val());
        $('#sw-height').val($('#room-height').val());
        $('#sw-sound-speed').val($('#sound-speed').val());
        $('#sw-max-modes').val($('#max-modes').val());

        // If custom options are selected, sync those too
        if ($('#sound-speed').val() === 'custom') {
            $('#sw-custom-sound-speed-container').show();
            $('#sw-custom-sound-speed').val($('#custom-sound-speed').val());
        }

        if ($('#max-modes').val() === 'custom') {
            $('#sw-custom-max-modes-container').show();
            $('#sw-custom-max-modes').val($('#custom-max-modes').val());
        }
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
        calculateResonanceFrequencies(length, width, height, soundSpeed, maxModes);

        // Calculate standing waves
        calculateStandingWaves(length, width, height, soundSpeed, maxModes);

        // Sync form values between tabs
        syncFormValues();
    }

    // Function to sync form values between tabs
    function syncFormValues() {
        // Sync dimensions
        $('#sw-length').val($('#room-length').val());
        $('#sw-width').val($('#room-width').val());
        $('#sw-height').val($('#room-height').val());

        // Sync sound speed
        $('#sw-sound-speed').val($('#sound-speed').val());
        if ($('#sound-speed').val() === 'custom') {
            $('#sw-custom-sound-speed-container').show();
            $('#sw-custom-sound-speed').val($('#custom-sound-speed').val());
        } else {
            $('#sw-custom-sound-speed-container').hide();
        }

        // Sync max modes
        $('#sw-max-modes').val($('#max-modes').val());
        if ($('#max-modes').val() === 'custom') {
            $('#sw-custom-max-modes-container').show();
            $('#sw-custom-max-modes').val($('#custom-max-modes').val());
        } else {
            $('#sw-custom-max-modes-container').hide();
        }
    }


    // Call the initialization function when the document is ready
    initializeFormSync();
});