#!/usr/bin/env python3
"""
Simple example of using the AudioAnalyzer to extract frequency and amplitude data
For DJ HEL1X Globe Project
"""

from audio_analyzer import AudioAnalyzer
import os

def analyze_wav_file(wav_file_path: str):
    """
    Analyze a WAV file and extract frequency and amplitude data
    
    Args:
        wav_file_path: Path to the WAV file to analyze
    """
    print(f"Analyzing WAV file: {wav_file_path}")
    
    # Initialize the analyzer
    analyzer = AudioAnalyzer()
    
    # Perform complete analysis
    analysis = analyzer.analyze_audio(wav_file_path)
    
    if analysis is None:
        print("Failed to analyze the audio file.")
        return
    
    # Extract key data
    file_info = analysis['file_info']
    amplitude_data = analysis['amplitude_analysis']
    frequency_data = analysis['frequency_analysis']
    
    print("\n" + "="*50)
    print("AUDIO ANALYSIS RESULTS")
    print("="*50)
    
    # File information
    print(f"\n📁 File Information:")
    print(f"   Path: {file_info['file_path']}")
    print(f"   Duration: {file_info['duration']:.2f} seconds")
    print(f"   Sample Rate: {file_info['sample_rate']} Hz")
    print(f"   Total Samples: {file_info['samples']:,}")
    
    # Amplitude analysis
    print(f"\n📊 Amplitude Analysis:")
    amp_stats = amplitude_data['statistics']
    print(f"   Max Amplitude: {amp_stats['max_amplitude']:.4f}")
    print(f"   Min Amplitude: {amp_stats['min_amplitude']:.4f}")
    print(f"   Mean Amplitude: {amp_stats['mean_amplitude']:.4f}")
    print(f"   RMS Amplitude: {amp_stats['rms_amplitude']:.4f}")
    print(f"   Peak-to-Peak: {amp_stats['peak_to_peak']:.4f}")
    print(f"   Amplitude Peaks Found: {amplitude_data['peaks']['count']}")
    
    # Frequency analysis
    print(f"\n🎵 Frequency Analysis:")
    print(f"   Spectral Centroid: {frequency_data['spectral_centroid']:.2f} Hz")
    print(f"   Dominant Frequencies: {frequency_data['dominant_frequencies']['count']}")
    print(f"   Zero Crossing Rate: {frequency_data['zero_crossing_rate']['mean']:.4f}")
    
    # Top frequencies
    top_freqs = frequency_data['top_frequencies']
    print(f"\n🔝 Top 10 Frequencies:")
    for i, (freq, mag) in enumerate(zip(top_freqs['frequencies'], top_freqs['magnitudes'])):
        print(f"   {i+1:2d}. {freq:8.2f} Hz (magnitude: {mag:8.2f})")
    
    # Save detailed results
    output_file = f"{os.path.splitext(wav_file_path)[0]}_analysis.json"
    analyzer.save_analysis(analysis, output_file)
    print(f"\n💾 Detailed analysis saved to: {output_file}")
    
    # Create visualizations
    plot_dir = f"{os.path.splitext(wav_file_path)[0]}_plots"
    analyzer.create_visualizations(analysis, plot_dir)
    print(f"📈 Visualizations saved to: {plot_dir}/")
    
    return analysis

def quick_frequency_amplitude_extract(wav_file_path: str):
    """
    Quick extraction of just frequency and amplitude data without full analysis
    
    Args:
        wav_file_path: Path to the WAV file
        
    Returns:
        Dictionary with frequency and amplitude arrays
    """
    import numpy as np
    
    analyzer = AudioAnalyzer()
    audio_data, sample_rate = analyzer.load_audio(wav_file_path)
    
    if audio_data is None:
        return None
    
    # Extract frequency data
    fft = np.fft.fft(audio_data)
    freqs = np.fft.fftfreq(len(fft), 1/sample_rate)
    positive_freqs = freqs[:len(freqs)//2]
    magnitude = np.abs(fft[:len(fft)//2])
    
    # Extract amplitude data
    amplitude_envelope = np.abs(audio_data)
    
    return {
        'frequencies': positive_freqs.tolist(),
        'magnitudes': magnitude.tolist(),
        'amplitudes': amplitude_envelope.tolist(),
        'sample_rate': sample_rate,
        'duration': len(audio_data) / sample_rate
    }

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python audio_analysis_example.py <path_to_wav_file>")
        print("\nExample:")
        print("  python audio_analysis_example.py sample.wav")
        sys.exit(1)
    
    wav_file = sys.argv[1]
    
    if not os.path.exists(wav_file):
        print(f"Error: File '{wav_file}' not found.")
        sys.exit(1)
    
    if not wav_file.lower().endswith('.wav'):
        print(f"Warning: '{wav_file}' doesn't appear to be a WAV file.")
    
    # Perform analysis
    try:
        analysis = analyze_wav_file(wav_file)
        print("\n✅ Analysis completed successfully!")
    except Exception as e:
        print(f"\n❌ Error during analysis: {e}")
        print("\nMake sure you have installed the required dependencies:")
        print("pip install -r requirements_audio.txt")




