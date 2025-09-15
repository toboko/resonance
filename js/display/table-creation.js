/**
 * Table creation module for generating frequency tables
 */

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

    // Definisci i colori per i tipi di modo usando le costanti globali
    const typeColors = {
        'axial': COLORS.AXIAL,
        'tangential': COLORS.TANGENTIAL,
        'oblique': COLORS.OBLIQUE
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
                        <span class="toggle-icon"><i class="fas fa-folder-open"></i></span>
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

            // Se non è il primo gruppo delle frequenze assiali, nascondi le righe all'inizio e imposta icona chiusa
            if (!(groupIndex === 0 && type === 'axial')) {
                groupContent.hide();
                groupHeader.find('.toggle-icon').html('<i class="fas fa-folder"></i>');
            }

            // Aggiungi il gestore di eventi per il toggle
            groupHeader.on('click', function() {
                const content = $(`#${groupContentId}`);
                content.toggle();

                // Cambia l'icona del toggle
                const toggleIcon = $(this).find('.toggle-icon');
                if (content.is(':visible')) {
                    toggleIcon.html('<i class="fas fa-folder-open"></i>');
                } else {
                    toggleIcon.html('<i class="fas fa-folder"></i>');
                }
            });
        }

        container.append(table);
    }

    // Crea le tabelle per ogni tipo
    createTypeTable(axialContainerId, typeGroups['axial'], 'axial');
    createTypeTable(tangentialContainerId, typeGroups['tangential'], 'tangential');
    createTypeTable(obliqueContainerId, typeGroups['oblique'], 'oblique');

    // Ensure table styles are loaded
    if (!$('#table-styles-link').length) {
        $('head').append('<link id="table-styles-link" rel="stylesheet" href="css/table-styles.css">');
    }
}

// Nuova funzione per creare la tabella delle frequenze
function createFrequencyTable(containerId, data) {
    const container = $('#' + containerId);
    container.empty();

    // Raggruppa i dati per modo
    const modeGroups = {};
    const dimensionColors = {
        'Lunghezza': COLORS.LENGTH,
        'Larghezza': COLORS.WIDTH,
        'Altezza': COLORS.HEIGHT
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
    container.append('<p class="table-note">* I numeri nei cerchi colorati corrispondono ai marcatori nel grafico</p>');

    // Ensure table styles are loaded (already handled in createResonanceTable)
}

// Export functions
window.createResonanceTable = createResonanceTable;
window.createFrequencyTable = createFrequencyTable;
