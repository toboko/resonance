$(document).ready(function() {
    // Tab switching functionality
    $('.tab-button').on('click', function() {
        const tabId = $(this).data('tab');
        
        // Update active tab button
        $('.tab-button').removeClass('active');
        $(this).addClass('active');
        
        // Show selected tab content
        $('.tab-content').removeClass('active');
        $('#' + tabId).addClass('active');
    });
    
    // Calculate resonance frequencies
    $('#calculate-resonance').on('click', function() {
        const length = parseFloat($('#room-length').val());
        const width = parseFloat($('#room-width').val());
        const height = parseFloat($('#room-height').val());
        const soundSpeed = parseFloat($('#sound-speed').val());
        const maxModes = parseInt($('#max-modes').val());
        
        if (isNaN(length) || isNaN(width) || isNaN(height) || isNaN(soundSpeed)) {
            alert('Per favore, inserisci valori numerici validi per tutte le dimensioni e la velocità del suono.');
            return;
        }
        
        calculateResonanceFrequencies(length, width, height, soundSpeed, maxModes);
    });
    
    // Calculate standing waves
    $('#calculate-standing-waves').on('click', function() {
        const length = parseFloat($('#sw-length').val());
        const width = parseFloat($('#sw-width').val());
        const height = parseFloat($('#sw-height').val());
        const soundSpeed = parseFloat($('#sw-sound-speed').val());
        const maxModes = parseInt($('#sw-max-modes').val());
        
        if (isNaN(length) || isNaN(width) || isNaN(height) || isNaN(soundSpeed)) {
            alert('Per favore, inserisci valori numerici validi per tutte le dimensioni e la velocità del suono.');
            return;
        }
        
        calculateStandingWaves(length, width, height, soundSpeed, maxModes);
    });
    
    // Function to calculate resonance frequencies
    function calculateResonanceFrequencies(length, width, height, soundSpeed, maxModes) {
        const axialFrequencies = [];
        const tangentialFrequencies = [];
        const obliqueFrequencies = [];
        
        // Calculate resonance frequencies for different modes (p, q, r)
        for (let p = 0; p <= maxModes; p++) {
            for (let q = 0; q <= maxModes; q++) {
                for (let r = 0; r <= maxModes; r++) {
                    // Skip the (0,0,0) mode
                    if (p === 0 && q === 0 && r === 0) continue;
                    
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
        
        // Add some CSS for the tables
        $('<style>')
            .text(`
                .waves-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                .waves-table th, .waves-table td {
                    padding: 8px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }
                .waves-table th {
                    background-color: #f2f2f2;
                }
                .waves-table tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
            `)
            .appendTo('head');
    }
    
    // Function to draw resonance chart
    function drawResonanceChart(canvasId, axial, tangential, oblique) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set dimensions
        const padding = 40;
        const width = canvas.width - padding * 2;
        const height = canvas.height - padding * 2;
        
        // Combine all frequencies
        const allFrequencies = [
            ...axial.map(f => ({ ...f, type: 'axial' })),
            ...tangential.map(f => ({ ...f, type: 'tangential' })),
            ...oblique.map(f => ({ ...f, type: 'oblique' }))
        ];
        
        // Sort by frequency
        allFrequencies.sort((a, b) => parseFloat(a.frequency) - parseFloat(b.frequency));
        
        // Find max frequency for scaling
        const maxFrequency = Math.max(...allFrequencies.map(f => parseFloat(f.frequency)));
        
        // Draw axes
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.strokeStyle = '#000';
        ctx.stroke();
        
        // Draw frequency lines
        allFrequencies.forEach((freq, index) => {
            if (index >= 50) return; // Limit to 50 frequencies for clarity
            
            const x = padding + (parseFloat(freq.frequency) / maxFrequency) * width;
            
            // Set color based on type
            let color;
            if (freq.type === 'axial') {
                color = '#ff6384'; // Red
            } else if (freq.type === 'tangential') {
                color = '#36a2eb'; // Blue
            } else {
                color = '#ffce56'; // Yellow
            }
            
            // Draw line
            ctx.beginPath();
            ctx.moveTo(x, canvas.height - padding);
            ctx.lineTo(x, padding);
            ctx.strokeStyle = color;
            ctx.globalAlpha = 0.7;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
            
            // Draw frequency value
            if (index % 5 === 0) { // Show every 5th label to avoid clutter
                ctx.fillStyle = '#000';
                ctx.textAlign = 'center';
                ctx.fillText(freq.frequency + ' Hz', x, canvas.height - padding + 15);
            }
        });
        
        // Draw legend
        const legendX = padding + 10;
        const legendY = padding + 20;
        
        // Axial
        ctx.fillStyle = '#ff6384';
        ctx.fillRect(legendX, legendY, 15, 15);
        ctx.fillStyle = '#000';
        ctx.textAlign = 'left';
        ctx.fillText('Assiale', legendX + 20, legendY + 12);
        
        // Tangential
        ctx.fillStyle = '#36a2eb';
        ctx.fillRect(legendX + 100, legendY, 15, 15);
        ctx.fillStyle = '#000';
        ctx.fillText('Tangenziale', legendX + 120, legendY + 12);
        
        // Oblique
        ctx.fillStyle = '#ffce56';
        ctx.fillRect(legendX + 220, legendY, 15, 15);
        ctx.fillStyle = '#000';
        ctx.fillText('Obliqua', legendX + 240, legendY + 12);
    }
    
    // Function to draw standing waves chart
    function drawStandingWavesChart(canvasId, waves) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set dimensions
        const padding = 40;
        const width = canvas.width - padding * 2;
        const height = canvas.height - padding * 2;
        
        // Sort by frequency
        waves.sort((a, b) => parseFloat(a.frequency) - parseFloat(b.frequency));
        
        // Find max frequency for scaling
        const maxFrequency = Math.max(...waves.map(f => parseFloat(f.frequency)));
        
        // Draw axes
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.strokeStyle = '#000';
        ctx.stroke();
        
        // Define colors for dimensions
        const colors = {
            'Lunghezza': '#ff6384', // Red
            'Larghezza': '#36a2eb', // Blue
            'Altezza': '#4bc0c0'    // Green
        };
        
        // Draw frequency lines
        waves.forEach((wave, index) => {
            if (index >= 30) return; // Limit to 30 frequencies for clarity
            
            const x = padding + (parseFloat(wave.frequency) / maxFrequency) * width;
            
            // Set color based on dimension
            const color = colors[wave.dimension];
            
            // Draw line
            ctx.beginPath();
            ctx.moveTo(x, canvas.height - padding);
            ctx.lineTo(x, padding);
            ctx.strokeStyle = color;
            ctx.globalAlpha = 0.7;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
            
            // Draw frequency value
            if (index % 3 === 0) { // Show every 3rd label to avoid clutter
                ctx.fillStyle = '#000';
                ctx.textAlign = 'center';
                ctx.fillText(wave.frequency + ' Hz', x, canvas.height - padding + 15);
            }
        });
        
        // Draw legend
        const legendX = padding + 10;
        const legendY = padding + 20;
        
        // Length
        ctx.fillStyle = colors['Lunghezza'];
        ctx.fillRect(legendX, legendY, 15, 15);
        ctx.fillStyle = '#000';
        ctx.textAlign = 'left';
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
    }
});