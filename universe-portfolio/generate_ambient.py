import wave
import math
import struct
import random

SAMPLE_RATE = 44100
DURATION = 24.0  # 24 seconds seamless loop
NUM_SAMPLES = int(SAMPLE_RATE * DURATION)

# Chord frequencies for deep cosmic ambient: D minor 9 (D3, A3, F4, C5, E5)
CHORD = [146.83, 220.00, 349.23, 523.25, 659.25]

# Celestial bell chime notes (Pentatonic space scale)
BELL_NOTES = [587.33, 659.25, 880.00, 987.77, 1046.50, 1174.66, 1318.51]
# Bell triggers at specific seconds
BELL_EVENTS = [
    (1.5, 880.00), (3.8, 1046.50), (6.2, 659.25), (9.0, 1174.66),
    (12.5, 987.77), (15.0, 1318.51), (18.2, 880.00), (21.0, 1046.50)
]

print("Generating space_ambient.wav...")

frames = []
for i in range(NUM_SAMPLES):
    t = i / SAMPLE_RATE
    
    # 1. Warm breathing pad chord
    pad_val = 0.0
    for idx, f in enumerate(CHORD):
        # Subtle slow chorus/detuning
        detune = math.sin(t * 0.15 + idx) * 0.4
        # Amplitude LFO (breathing)
        lfo = 0.65 + 0.35 * math.sin(2 * math.pi * 0.08 * t + idx * 0.7)
        # Sine wave + soft 2nd harmonic
        sig = math.sin(2 * math.pi * (f + detune) * t) + 0.3 * math.sin(4 * math.pi * (f + detune) * t)
        pad_val += sig * lfo * (0.09 / len(CHORD))

    # 2. Celestial bells with exponential decay
    bell_val = 0.0
    for trigger_t, bell_f in BELL_EVENTS:
        if t >= trigger_t:
            dt = t - trigger_t
            if dt < 3.0:
                decay = math.exp(-dt * 2.2)
                bell = math.sin(2 * math.pi * bell_f * dt) + 0.25 * math.sin(2 * math.pi * bell_f * 2.75 * dt)
                bell_val += bell * decay * 0.12

    # Mix together
    mixed = (pad_val * 0.7 + bell_val * 0.5)

    # Seamless loop envelope: fade in first 0.8s, fade out last 0.8s
    if t < 0.8:
        mixed *= (t / 0.8)
    elif t > (DURATION - 0.8):
        mixed *= ((DURATION - t) / 0.8)

    # Soft limiter / clamp
    mixed = max(-0.95, min(0.95, mixed))

    # Convert to 16-bit PCM integer
    sample_int = int(mixed * 32767.0)
    
    # Stereo (left, right with slight spatial panning)
    left = int(sample_int * 0.95)
    right = int(sample_int * 0.95)
    frames.append(struct.pack('<hh', left, right))

with wave.open('assets/space_ambient.wav', 'wb') as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(SAMPLE_RATE)
    wf.writeframes(b''.join(frames))

print("Created assets/space_ambient.wav successfully!")
