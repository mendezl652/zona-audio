// Real-time Web Audio API Synthesizer Engine for Musical Instruments
// Generates authentic instrument tones, chords, drums, and harmonic sweeps locally

class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private isPlaying: boolean = false;
  private activeTimeouts: NodeJS.Timeout[] = [];
  private currentDemoType: string | null = null;
  private onEndCallback: (() => void) | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public stop() {
    this.activeTimeouts.forEach(clearTimeout);
    this.activeTimeouts = [];
    if (this.ctx && this.ctx.state !== "closed") {
      // do not close ctx, but suspend or let nodes naturally finish
    }
    this.isPlaying = false;
    this.currentDemoType = null;
    if (this.onEndCallback) {
      this.onEndCallback();
      this.onEndCallback = null;
    }
  }

  public playSample(type: string, durationSeconds: number = 5, onEnd?: () => void) {
    this.stop();
    this.initContext();
    if (!this.ctx || !this.analyser) return;

    this.isPlaying = true;
    this.currentDemoType = type;
    this.onEndCallback = onEnd || null;

    const ctx = this.ctx;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.7, ctx.currentTime);
    masterGain.connect(this.analyser);
    this.analyser.connect(ctx.destination);

    switch (type) {
      case "guitar_rock":
        this.playRockGuitar(ctx, masterGain);
        break;
      case "guitar_acoustic":
        this.playAcousticGuitar(ctx, masterGain);
        break;
      case "synth_pad":
        this.playSynthPad(ctx, masterGain);
        break;
      case "synth_lead":
        this.playSynthLead(ctx, masterGain);
        break;
      case "drums_groove":
        this.playDrumGroove(ctx, masterGain);
        break;
      case "drums_latin":
        this.playLatinPercussion(ctx, masterGain);
        break;
      case "mic_warmth":
        this.playMicrophoneWarmth(ctx, masterGain);
        break;
      case "dj_drop":
        this.playDJDrop(ctx, masterGain);
        break;
      default:
        this.playSynthPad(ctx, masterGain);
    }

    const timer = setTimeout(() => {
      this.stop();
    }, durationSeconds * 1000);
    this.activeTimeouts.push(timer);
  }

  // 1. Rock Guitar: Heavy power chord with distortion curve and cabinet lowpass
  private playRockGuitar(ctx: AudioContext, dest: AudioNode) {
    const distortion = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1;
      curve[i] = (Math.PI + 4) * x / (Math.PI + 4 * Math.abs(x));
    }
    distortion.curve = curve;
    distortion.oversample = "4x";

    const cabFilter = ctx.createBiquadFilter();
    cabFilter.type = "lowpass";
    cabFilter.frequency.setValueAtTime(3200, ctx.currentTime);

    distortion.connect(cabFilter);
    cabFilter.connect(dest);

    // Chords: E5 (E2, B2, E3), then G5, then A5
    const riffs = [
      { time: 0, freqs: [82.41, 123.47, 164.81], len: 1.2 },
      { time: 1.3, freqs: [98.00, 146.83, 196.00], len: 1.0 },
      { time: 2.4, freqs: [110.00, 164.81, 220.00], len: 2.0 },
    ];

    riffs.forEach(({ time, freqs, len }) => {
      const startTime = ctx.currentTime + time;
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq + (idx * 0.4), startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.25, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + len);

        osc.connect(gain);
        gain.connect(distortion);

        osc.start(startTime);
        osc.stop(startTime + len);
      });
    });
  }

  // 2. Acoustic Guitar: Arpeggiated fingerpicking with rich resonant overtones
  private playAcousticGuitar(ctx: AudioContext, dest: AudioNode) {
    const notes = [
      { f: 164.81, t: 0.0 }, // E3
      { f: 220.00, t: 0.4 }, // A3
      { f: 261.63, t: 0.8 }, // C4
      { f: 329.63, t: 1.2 }, // E4
      { f: 392.00, t: 1.6 }, // G4
      { f: 440.00, t: 2.2 }, // A4
      { f: 329.63, t: 2.8 },
      { f: 261.63, t: 3.4 },
    ];

    notes.forEach(({ f, t }) => {
      const startTime = ctx.currentTime + t;
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2400, startTime);
      filter.frequency.exponentialRampToValueAtTime(600, startTime + 1.2);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, startTime);

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(f * 2, startTime); // upper octave chime

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.28, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.4);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(startTime);
      osc2.start(startTime);
      osc.stop(startTime + 1.5);
      osc2.stop(startTime + 1.5);
    });
  }

  // 3. Synth Pad: Lush 80s analog chorus chords with slow dynamic filter sweep
  private playSynthPad(ctx: AudioContext, dest: AudioNode) {
    const chords = [
      { t: 0, notes: [174.61, 220.00, 261.63, 329.63] }, // Fmaj7
      { t: 2.4, notes: [196.00, 246.94, 293.66, 392.00] } // Gsus
    ];

    chords.forEach(({ t, notes }) => {
      const startTime = ctx.currentTime + t;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.Q.setValueAtTime(4, startTime);
      filter.frequency.setValueAtTime(600, startTime);
      filter.frequency.exponentialRampToValueAtTime(2600, startTime + 1.2);
      filter.frequency.exponentialRampToValueAtTime(800, startTime + 2.3);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 2.5);

      filter.connect(gain);
      gain.connect(dest);

      notes.forEach((freq) => {
        [-3, 0, 3].forEach((detune) => {
          const osc = ctx.createOscillator();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, startTime);
          osc.detune.setValueAtTime(detune * 4, startTime);
          osc.connect(filter);
          osc.start(startTime);
          osc.stop(startTime + 2.6);
        });
      });
    });
  }

  // 4. Synth Lead: Nord-style bright polyphonic arpeggiation with delay echo
  private playSynthLead(ctx: AudioContext, dest: AudioNode) {
    const arp = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 659.25, 523.25];
    const step = 0.25;

    for (let cycle = 0; cycle < 2; cycle++) {
      arp.forEach((freq, idx) => {
        const startTime = ctx.currentTime + (cycle * arp.length * step) + (idx * step);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = "square";
        osc.frequency.setValueAtTime(freq, startTime);

        filter.type = "bandpass";
        filter.frequency.setValueAtTime(freq * 1.5, startTime);
        filter.Q.setValueAtTime(3, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.18, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + step * 1.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        osc.start(startTime);
        osc.stop(startTime + step * 1.6);
      });
    }
  }

  // 5. Drum Groove: Punchy kick, snappy snare pop, and crisp hi-hat pattern
  private playDrumGroove(ctx: AudioContext, dest: AudioNode) {
    const beatLen = 0.45;
    const totalBars = 3;

    for (let bar = 0; bar < totalBars; bar++) {
      const barStart = ctx.currentTime + bar * (beatLen * 4);

      // Kick on 1 and 3
      [0, 2].forEach((beat) => {
        const t = barStart + beat * beatLen;
        const kickOsc = ctx.createOscillator();
        const kickGain = ctx.createGain();
        kickOsc.frequency.setValueAtTime(150, t);
        kickOsc.frequency.exponentialRampToValueAtTime(38, t + 0.12);

        kickGain.gain.setValueAtTime(0.8, t);
        kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

        kickOsc.connect(kickGain);
        kickGain.connect(dest);
        kickOsc.start(t);
        kickOsc.stop(t + 0.3);
      });

      // Snare on 2 and 4
      [1, 3].forEach((beat) => {
        const t = barStart + beat * beatLen;
        this.triggerSnare(ctx, dest, t);
      });

      // Hi-Hats on every eighth note
      for (let eighth = 0; eighth < 8; eighth++) {
        const t = barStart + eighth * (beatLen / 2);
        this.triggerHiHat(ctx, dest, t, eighth % 2 === 0 ? 0.08 : 0.04);
      }
    }
  }

  private triggerSnare(ctx: AudioContext, dest: AudioNode, time: number) {
    // Noise buffer
    const bufferSize = ctx.sampleRate * 0.18;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.setValueAtTime(900, time);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.45, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(dest);

    // Snare body tone
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.frequency.setValueAtTime(200, time);
    osc.frequency.exponentialRampToValueAtTime(120, time + 0.08);
    oscGain.gain.setValueAtTime(0.3, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    osc.connect(oscGain);
    oscGain.connect(dest);

    noise.start(time);
    noise.stop(time + 0.18);
    osc.start(time);
    osc.stop(time + 0.15);
  }

  private triggerHiHat(ctx: AudioContext, dest: AudioNode, time: number, vol: number) {
    const bufferSize = ctx.sampleRate * 0.04;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(7000, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    noise.start(time);
    noise.stop(time + 0.05);
  }

  // 6. Latin Percussion: Authentic Conga Tumbao pattern (Slap, Open, Bass)
  private playLatinPercussion(ctx: AudioContext, dest: AudioNode) {
    const strokes = [
      { t: 0.0, type: "bass", f: 98 },
      { t: 0.28, type: "heel", f: 140 },
      { t: 0.56, type: "slap", f: 380 },
      { t: 0.84, type: "open", f: 220 },
      { t: 1.12, type: "bass", f: 98 },
      { t: 1.40, type: "slap", f: 380 },
      { t: 1.68, type: "open", f: 220 },
      { t: 1.96, type: "open", f: 246 },
      { t: 2.24, type: "slap", f: 380 },
      { t: 2.52, type: "open", f: 220 },
    ];

    strokes.forEach(({ t, type, f }) => {
      const startTime = ctx.currentTime + t;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === "slap") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, startTime);
        osc.frequency.exponentialRampToValueAtTime(160, startTime + 0.08);
        gain.gain.setValueAtTime(0.6, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.09);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, startTime);
        osc.frequency.exponentialRampToValueAtTime(f * 0.85, startTime + 0.2);
        gain.gain.setValueAtTime(0.45, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);
      }

      osc.connect(gain);
      gain.connect(dest);
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  // 7. Microphone Studio Warmth: Broadcast voiceover acoustic test tone
  private playMicrophoneWarmth(ctx: AudioContext, dest: AudioNode) {
    const notes = [
      { f: 220, t: 0 },
      { f: 277.18, t: 0.6 },
      { f: 329.63, t: 1.2 },
      { f: 440, t: 1.8 }
    ];

    notes.forEach(({ f, t }) => {
      const startTime = ctx.currentTime + t;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(f, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(startTime);
      osc.stop(startTime + 0.9);
    });
  }

  // 8. DJ Drop: Deep sub glide + filter riser
  private playDJDrop(ctx: AudioContext, dest: AudioNode) {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(32, t + 1.8);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.5);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 2.6);
  }
}

// Singleton instance
export const audioEngine = typeof window !== "undefined" ? new AudioEngine() : (null as unknown as AudioEngine);
