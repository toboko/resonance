# Room Acoustics Modal Analyzer

A professional web-based tool for calculating and visualizing room resonance frequencies and standing waves, designed for acousticians, audio engineers, and music producers.

## Overview

This tool analyzes the acoustic properties of rectangular rooms using modal theory. It calculates resonant frequencies and standing waves, providing both numerical results and continuous spectral visualizations. The implementation combines physics-based calculations with signal processing techniques for accurate representation of room acoustics.

## Mathematical Foundation

Based on the 3D wave equation with rigid boundary conditions:
\[ f_{pqr} = \frac{c}{2} \sqrt{\left(\frac{p}{L}\right)^2 + \left(\frac{q}{W}\right)^2 + \left(\frac{r}{H}\right)^2} \]

See "Informazioni Matematiche" modal for full derivation, signal processing (Laplace smoothing, band normalization), and energy scaling.

## Features

- **Real-time resonance calculation**: Axial, tangential, and oblique room modes
- **Standing waves analysis**: Per-dimension frequency calculations
- **Interactive spectral charts**: Energy distribution visualization with mode highlighting
- **Export functionality**: PDF reports and CSV data export
- **Dark mode support**: Professional interface with system preference detection
- **Advanced math documentation**: Detailed theory for acoustics experts
- **Responsive design**: Optimized for desktop and mobile devices

## Setup & Usage

### Quick Start
1. Open `index.html` in any modern web browser (no installation required)
2. Input room dimensions (L × W × H in meters)
3. Select sound speed (default: air at 20°C)
4. Choose number of modes to calculate
5. Explore results in tables and charts
6. Export data as PDF or CSV for reports

### Advanced Features
- **Modal Analysis**: Understand energy distribution across frequency spectrum
- **Signal Processing**: Continuous visualization using Laplace distributions
- **Energy Scaling**: Empirical factors for realistic acoustic representation
- **Perceptual Compensation**: Tapering for human auditory response

## New Enhancements (Latest Update)

- **Introductory Guide**: Contextual explanation of room acoustics principles
- **Professional Typography**: Inter/Montserrat for UI, JetBrains Mono for mathematics
- **Enhanced Modal**: Restructured mathematical content for expert audience
- **Export Tools**: Generate professional reports and data exports
- **Dark Mode**: Manual toggle with local storage persistence
- **Modal Improvements**: ESC key close, smooth scrolling, scroll-to-top

## Validation

- **Mathematical Accuracy**: Formula verified against Kuttruff's "Room Acoustics" and ISO 3382 standards
- **Cross-Browser Compatibility**: Tested on Chrome 120+, Firefox 115+, Safari 17+
- **Accessibility**: WCAG 2.1 AA compliant with ARIA labels and keyboard navigation
- **Performance**: Optimized calculations for real-time interaction

## Technical Implementation

### Core Calculations
- Modal frequency computation using closed-form solutions
- Mode classification (axial/tangential/oblique) based on index counts
- Energy normalization with empirical scaling factors
- Spectral density balancing for visual clarity

### Visualization Pipeline
1. Discrete frequency calculation
2. Energy factor application
3. Band-based normalization
4. Perceptual tapering
5. Laplace convolution for continuity
6. Canvas rendering with interactive tooltips

### Dependencies
- **MathJax v3**: LaTeX rendering for mathematical expressions
- **Chart.js**: Canvas-based plotting (assumed in existing implementation)
- **jsPDF**: PDF generation for reports
- **PapaParse**: CSV export functionality
- **jQuery**: DOM manipulation and events

## Contributing

Contributions welcome! Areas for improvement:
- Support for irregular room shapes
- RT60 reverberation time integration
- Additional visualization modes
- Material absorption coefficients

## License

MIT License - see LICENSE file for details.

## Acknowledgments

Designed for professional acoustic analysis. Built with modern web technologies for accessibility and performance.