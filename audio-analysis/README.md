# Audio Analysis Tool for DJ HEL1X Globe Project

This folder contains audio analysis tools for extracting frequency and amplitude data from WAV files, specifically designed for the DJ HEL1X Globe project.

## Features

- **Frequency Analysis**: Complete frequency spectrum, dominant frequencies, spectral centroid
- **Amplitude Analysis**: RMS, peak detection, amplitude envelope
- **Advanced Features**: MFCC coefficients, zero crossing rate
- **Visualizations**: Waveform, frequency spectrum, amplitude envelope plots
- **Data Export**: JSON format for integration with other tools

## Installation

```bash
pip install -r requirements_audio.txt
```

## Usage

### Basic Analysis
```bash
python audio_analysis_example.py your_audio_file.wav
```

### Advanced Analysis
```bash
python audio_analyzer.py your_audio_file.wav
```

## Output

The tool generates:
- **JSON file** with all numerical data
- **Visualization plots** (PNG format)
- **Console output** with key statistics

## Integration with Globe Project

This audio analysis tool is designed to work alongside the interactive globe visualization, allowing you to:
- Analyze audio files and extract frequency/amplitude data
- Use the data for globe-based visualizations
- Integrate audio analysis results with the globe's data processing pipeline

## Files

- `audio_analyzer.py` - Main analysis engine
- `audio_analysis_example.py` - Simple usage examples
- `requirements_audio.txt` - Python dependencies
- `README.md` - This documentation

## Example Output

```
📊 Amplitude Analysis:
   Max Amplitude: 0.8234
   RMS Amplitude: 0.1234

🔝 Top 10 Frequencies:
    1.   440.00 Hz (magnitude:   1234.56)
    2.   880.00 Hz (magnitude:    987.65)
```

## Globe Project Integration

This tool is part of the DJ HEL1X Globe project and follows the project's architecture for data processing and visualization.




