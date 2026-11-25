// Tiny WebAudio synth: every sound is an oscillator envelope, no audio files.
// The context is created on the first user gesture (browsers block audio before
// that); M toggles mute. Nothing here is needed for the screenshot scenes.
export function createAudio() {
  let context = null;
  let muted = false;

  function ensure() {
    if (context === null) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        context = new AC();
      } catch {
        return null;
      }
    }
    if (context.state === 'suspended') context.resume().catch(() => {});
    return context;
  }

  function tone(freq, dur, type, gain, when = 0, slideTo = 0) {
    if (muted) return;
    const ctx = ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo > 0) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(amp).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  return {
    unlock() {
      ensure();
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    get muted() {
      return muted;
    },
    add() {
      tone(620, 0.07, 'triangle', 0.12);
      tone(930, 0.05, 'triangle', 0.07, 0.02);
    },
    trash() {
      tone(300, 0.12, 'sawtooth', 0.06, 0, 140);
    },
    serve() {
      tone(523, 0.1, 'triangle', 0.14);
      tone(659, 0.1, 'triangle', 0.14, 0.09);
      tone(784, 0.18, 'triangle', 0.16, 0.18);
    },
    bad() {
      tone(180, 0.22, 'sawtooth', 0.1, 0, 110);
    },
    expire() {
      tone(392, 0.12, 'square', 0.07);
      tone(311, 0.2, 'square', 0.07, 0.12);
    },
    tick() {
      tone(1150, 0.04, 'square', 0.05);
    },
    level() {
      tone(523, 0.09, 'triangle', 0.13);
      tone(659, 0.09, 'triangle', 0.13, 0.08);
      tone(784, 0.09, 'triangle', 0.13, 0.16);
      tone(1047, 0.22, 'triangle', 0.15, 0.24);
    },
    over() {
      tone(392, 0.16, 'triangle', 0.13);
      tone(330, 0.16, 'triangle', 0.13, 0.15);
      tone(262, 0.34, 'triangle', 0.13, 0.3);
    },
  };
}
