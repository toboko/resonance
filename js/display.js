/**
 * Main display module - imports and exports all display-related functionality
 */

// Import all display modules in the correct dependency order
// Note: In a browser environment without ES6 modules, we include scripts in index.html

// The modules are loaded in this order in index.html:
// 1. results-display.js
// 2. signal-processing.js
// 3. chart-drawing.js
// 4. table-creation.js
// 5. interactive-features.js
// 6. animation.js
// 7. helpers.js

// This file serves as the main entry point and ensures all functions are available globally
// All functions are exported to window object in their respective modules

// Export all functions for backward compatibility
window.displayResonanceResults = displayResonanceResults;
window.displayStandingWavesResults = displayStandingWavesResults;
window.generateContinuousSignal = generateContinuousSignal;
window.combineSignals = combineSignals;
window.interpolateSignals = interpolateSignals;
window.drawResonanceChart = drawResonanceChart;
window.drawStandingWavesChart = drawStandingWavesChart;
window.createResonanceTable = createResonanceTable;
window.createFrequencyTable = createFrequencyTable;
window.showMathInfoModal = showMathInfoModal;
window.hideMathInfoModal = hideMathInfoModal;
window.findClosestFrequency = findClosestFrequency;
window.addInteractiveFrequencyDisplay = addInteractiveFrequencyDisplay;
window.animateResonanceChart = animateResonanceChart;
window.animateStandingWavesChart = animateStandingWavesChart;
window.easeInOutCubic = easeInOutCubic;
window.easeLinear = easeLinear;
window.easeSmoothLinear = easeSmoothLinear;
window.arraysEqual = arraysEqual;
