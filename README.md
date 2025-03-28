# Room Acoustics Calculator

A web-based tool for calculating and visualizing room acoustic properties, including resonant frequencies and standing waves.

![Room Acoustics Calculator](https://via.placeholder.com/800x400?text=Room+Acoustics+Calculator)

## Overview

The Room Acoustics Calculator is a comprehensive tool designed for audio professionals, acousticians, and enthusiasts to analyze the acoustic properties of rooms. It helps identify potential acoustic issues in a space by calculating and visualizing:

- **Resonant Frequencies (Room Modes)**: Axial, tangential, and oblique modes
- **Standing Waves**: Frequencies where standing waves occur along each dimension of the room

Understanding these acoustic phenomena is crucial for proper room treatment, studio design, and optimizing listening environments.


## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js and npm (for development)

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/room-acoustics-calculator.git
```

2. Navigate to the project directory:
```
cd room-acoustics-calculator
```

3. Install dependencies:
```
npm install
```

4. Start the development server:
```
npm start
```

5. Open your browser and navigate to:
```
http://localhost:8080
```

## Usage

1. **Select Calculation Mode**:
   - Choose between "Risonanza Armonica" (Resonant Frequencies) or "Onde Stazionarie" (Standing Waves)

2. **Enter Room Dimensions**:
   - Input the length, width, and height of your room in meters

3. **Select Sound Speed**:
   - Choose from presets based on air temperature or enter a custom value

4. **Choose Number of Modes**:
   - Select how many modes to calculate and display

5. **Calculate**:
   - Click the "Calcola" button to perform calculations

6. **Analyze Results**:
   - View the calculated frequencies in both the tables and visualization chart
   - Use the collapsible sections to focus on specific frequency ranges
   - Note the numbered indicators that correspond between the table and chart

## Technical Details

### Resonant Frequencies

The calculator uses the following formula to determine room modes:

```
f(p,q,r) = (c/2) * √[(p/L)² + (q/W)² + (r/H)²]
```

Where:
- `f` is the frequency in Hz
- `c` is the speed of sound in m/s
- `p`, `q`, and `r` are the mode indices
- `L`, `W`, and `H` are the room dimensions in meters

Modes are categorized as:
- **Axial**: One non-zero index (e.g., (1,0,0))
- **Tangential**: Two non-zero indices (e.g., (1,1,0))
- **Oblique**: Three non-zero indices (e.g., (1,1,1))

### Standing Waves

Standing waves are calculated for each dimension using:

```
f = (n * c) / (2 * d)
```

Where:
- `f` is the frequency in Hz
- `n` is the mode number
- `c` is the speed of sound in m/s
- `d` is the dimension length in meters


## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- This calculator is designed for educational and professional use in acoustic analysis
- Special thanks to all contributors and the acoustic engineering community