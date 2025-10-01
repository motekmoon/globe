#!/usr/bin/env python3
"""
Audio Analysis Tool - Extract Frequency and Amplitude Data from WAV Files
For DJ HEL1X Globe Project
"""

import numpy as np
import librosa
import matplotlib.pyplot as plt
import scipy.fft
from scipy.signal import find_peaks
import json
import os
from typing import Dict, List, Tuple, Optional

class AudioAnalyzer:
    def __init__(self, sample_rate: int = 22050):
        """
        Initialize the audio analyzer
        
        Args:
            sample_rate: Target sample rate for audio processing
        """
        self.sample_rate = sample_rate
        
    def load_audio(self, file_path: str) -> Tuple[np.ndarray, int]:
        """
        Load audio file and return audio data and sample rate
        
        Args:
            file_path: Path to the WAV file
            
        Returns:
            Tuple of (audio_data, sample_rate)
        """
        try:
            audio_data, sr = librosa.load(file_path, sr=self.sample_rate)
            print(f"Loaded audio: {len(audio_data)} samples at {sr} Hz")
            print(f"Duration: {len(audio_data)/sr:.2f} seconds")
            return audio_data, sr
        except Exception as e:
            print(f"Error loading audio file: {e}")
            return None, None
    
    def extract_amplitude_data(self, audio_data: np.ndarray) -> Dict:
        """
        Extract amplitude-related data from audio
        
        Args:
            audio_data: Audio signal data
            
        Returns:
            Dictionary containing amplitude analysis
        """
        # Basic amplitude statistics
        amplitude_stats = {
            'max_amplitude': float(np.max(np.abs(audio_data))),
            'min_amplitude': float(np.min(audio_data)),
            'mean_amplitude': float(np.mean(np.abs(audio_data))),
            'rms_amplitude': float(np.sqrt(np.mean(audio_data**2))),
            'peak_to_peak': float(np.max(audio_data) - np.min(audio_data))
        }
        
        # Amplitude envelope (smoothed amplitude over time)
        amplitude_envelope = np.abs(audio_data)
        
        # Find peaks in amplitude
        peaks, properties = find_peaks(amplitude_envelope, height=np.mean(amplitude_envelope))
        
        return {
            'statistics': amplitude_stats,
            'envelope': amplitude_envelope.tolist(),
            'peaks': {
                'indices': peaks.tolist(),
                'amplitudes': amplitude_envelope[peaks].tolist(),
                'count': len(peaks)
            }
        }
    
    def extract_frequency_data(self, audio_data: np.ndarray, sample_rate: int) -> Dict:
        """
        Extract frequency-related data from audio
        
        Args:
            audio_data: Audio signal data
            sample_rate: Sample rate of the audio
            
        Returns:
            Dictionary containing frequency analysis
        """
        # FFT to get frequency spectrum
        fft = np.fft.fft(audio_data)
        freqs = np.fft.fftfreq(len(fft), 1/sample_rate)
        
        # Only take positive frequencies
        positive_freqs = freqs[:len(freqs)//2]
        magnitude = np.abs(fft[:len(fft)//2])
        
        # Find dominant frequencies
        peak_indices, _ = find_peaks(magnitude, height=np.mean(magnitude))
        dominant_freqs = positive_freqs[peak_indices]
        dominant_magnitudes = magnitude[peak_indices]
        
        # Sort by magnitude to get top frequencies
        sorted_indices = np.argsort(dominant_magnitudes)[::-1]
        top_frequencies = dominant_freqs[sorted_indices[:10]]  # Top 10 frequencies
        top_magnitudes = dominant_magnitudes[sorted_indices[:10]]
        
        # Spectral centroid (brightness of sound)
        spectral_centroid = np.sum(positive_freqs * magnitude) / np.sum(magnitude)
        
        # Zero crossing rate (roughness/noisiness)
        zero_crossings = librosa.feature.zero_crossing_rate(audio_data)
        
        return {
            'frequencies': positive_freqs.tolist(),
            'magnitudes': magnitude.tolist(),
            'dominant_frequencies': {
                'frequencies': dominant_freqs.tolist(),
                'magnitudes': dominant_magnitudes.tolist(),
                'count': len(dominant_freqs)
            },
            'top_frequencies': {
                'frequencies': top_frequencies.tolist(),
                'magnitudes': top_magnitudes.tolist()
            },
            'spectral_centroid': float(spectral_centroid),
            'zero_crossing_rate': {
                'mean': float(np.mean(zero_crossings)),
                'values': zero_crossings.flatten().tolist()
            }
        }
    
    def extract_mfcc_features(self, audio_data: np.ndarray, sample_rate: int) -> Dict:
        """
        Extract MFCC (Mel-frequency cepstral coefficients) features
        
        Args:
            audio_data: Audio signal data
            sample_rate: Sample rate of the audio
            
        Returns:
            Dictionary containing MFCC features
        """
        mfccs = librosa.feature.mfcc(y=audio_data, sr=sample_rate, n_mfcc=13)
        
        return {
            'mfcc_coefficients': mfccs.tolist(),
            'mfcc_means': np.mean(mfccs, axis=1).tolist(),
            'mfcc_stds': np.std(mfccs, axis=1).tolist()
        }
    
    def analyze_audio(self, file_path: str) -> Dict:
        """
        Complete audio analysis of a WAV file
        
        Args:
            file_path: Path to the WAV file
            
        Returns:
            Dictionary containing all analysis results
        """
        print(f"Analyzing audio file: {file_path}")
        
        # Load audio
        audio_data, sample_rate = self.load_audio(file_path)
        if audio_data is None:
            return None
        
        # Extract all features
        analysis = {
            'file_info': {
                'file_path': file_path,
                'sample_rate': sample_rate,
                'duration': len(audio_data) / sample_rate,
                'samples': len(audio_data)
            },
            'amplitude_analysis': self.extract_amplitude_data(audio_data),
            'frequency_analysis': self.extract_frequency_data(audio_data, sample_rate),
            'mfcc_features': self.extract_mfcc_features(audio_data, sample_rate)
        }
        
        return analysis
    
    def save_analysis(self, analysis: Dict, output_path: str):
        """
        Save analysis results to JSON file
        
        Args:
            analysis: Analysis results dictionary
            output_path: Path to save the JSON file
        """
        with open(output_path, 'w') as f:
            json.dump(analysis, f, indent=2)
        print(f"Analysis saved to: {output_path}")
    
    def create_visualizations(self, analysis: Dict, output_dir: str = "audio_analysis_plots"):
        """
        Create visualization plots for the analysis
        
        Args:
            analysis: Analysis results dictionary
            output_dir: Directory to save plots
        """
        os.makedirs(output_dir, exist_ok=True)
        
        # Load audio for visualization
        audio_data, sample_rate = self.load_audio(analysis['file_info']['file_path'])
        
        # 1. Waveform plot
        plt.figure(figsize=(12, 6))
        time_axis = np.linspace(0, len(audio_data)/sample_rate, len(audio_data))
        plt.plot(time_axis, audio_data)
        plt.title('Audio Waveform')
        plt.xlabel('Time (seconds)')
        plt.ylabel('Amplitude')
        plt.grid(True)
        plt.savefig(f"{output_dir}/waveform.png", dpi=300, bbox_inches='tight')
        plt.close()
        
        # 2. Frequency spectrum
        plt.figure(figsize=(12, 6))
        freqs = analysis['frequency_analysis']['frequencies']
        magnitudes = analysis['frequency_analysis']['magnitudes']
        plt.plot(freqs, magnitudes)
        plt.title('Frequency Spectrum')
        plt.xlabel('Frequency (Hz)')
        plt.ylabel('Magnitude')
        plt.xlim(0, 5000)  # Focus on audible range
        plt.grid(True)
        plt.savefig(f"{output_dir}/frequency_spectrum.png", dpi=300, bbox_inches='tight')
        plt.close()
        
        # 3. Amplitude envelope
        plt.figure(figsize=(12, 6))
        envelope = analysis['amplitude_analysis']['envelope']
        time_axis = np.linspace(0, len(envelope)/sample_rate, len(envelope))
        plt.plot(time_axis, envelope)
        plt.title('Amplitude Envelope')
        plt.xlabel('Time (seconds)')
        plt.ylabel('Amplitude')
        plt.grid(True)
        plt.savefig(f"{output_dir}/amplitude_envelope.png", dpi=300, bbox_inches='tight')
        plt.close()
        
        # 4. MFCC heatmap
        plt.figure(figsize=(12, 8))
        mfccs = np.array(analysis['mfcc_features']['mfcc_coefficients'])
        plt.imshow(mfccs, aspect='auto', origin='lower')
        plt.title('MFCC Features')
        plt.xlabel('Time Frames')
        plt.ylabel('MFCC Coefficients')
        plt.colorbar()
        plt.savefig(f"{output_dir}/mfcc_heatmap.png", dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"Visualizations saved to: {output_dir}/")

def main():
    """
    Example usage of the AudioAnalyzer
    """
    # Initialize analyzer
    analyzer = AudioAnalyzer()
    
    # Example usage - replace with your WAV file path
    wav_file = "sample_audio.wav"  # Replace with your WAV file path
    
    if not os.path.exists(wav_file):
        print(f"Please provide a valid WAV file path. Current path: {wav_file}")
        print("Usage: python audio_analyzer.py <path_to_wav_file>")
        return
    
    # Analyze the audio
    analysis = analyzer.analyze_audio(wav_file)
    
    if analysis:
        # Save analysis results
        analyzer.save_analysis(analysis, "audio_analysis_results.json")
        
        # Create visualizations
        analyzer.create_visualizations(analysis)
        
        # Print summary
        print("\n=== ANALYSIS SUMMARY ===")
        print(f"File: {analysis['file_info']['file_path']}")
        print(f"Duration: {analysis['file_info']['duration']:.2f} seconds")
        print(f"Sample Rate: {analysis['file_info']['sample_rate']} Hz")
        print(f"Max Amplitude: {analysis['amplitude_analysis']['statistics']['max_amplitude']:.4f}")
        print(f"RMS Amplitude: {analysis['amplitude_analysis']['statistics']['rms_amplitude']:.4f}")
        print(f"Spectral Centroid: {analysis['frequency_analysis']['spectral_centroid']:.2f} Hz")
        print(f"Dominant Frequencies: {len(analysis['frequency_analysis']['dominant_frequencies']['frequencies'])}")
        
        # Print top frequencies
        top_freqs = analysis['frequency_analysis']['top_frequencies']
        print("\nTop 5 Frequencies:")
        for i, (freq, mag) in enumerate(zip(top_freqs['frequencies'][:5], top_freqs['magnitudes'][:5])):
            print(f"  {i+1}. {freq:.2f} Hz (magnitude: {mag:.2f})")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        # If WAV file path provided as argument
        wav_file = sys.argv[1]
        analyzer = AudioAnalyzer()
        analysis = analyzer.analyze_audio(wav_file)
        if analysis:
            analyzer.save_analysis(analysis, f"{os.path.splitext(wav_file)[0]}_analysis.json")
            analyzer.create_visualizations(analysis, f"{os.path.splitext(wav_file)[0]}_plots")
    else:
        main()




