type SoundType = 'success' | 'notification' | 'error' | 'click' | 'distribute';

interface SoundSettings {
  enabled: boolean;
  volume: number;
  sounds: {
    success: boolean;
    notification: boolean;
    error: boolean;
    click: boolean;
    distribute: boolean;
  };
}

const defaultSettings: SoundSettings = {
  enabled: true,
  volume: 0.5,
  sounds: {
    success: true,
    notification: true,
    error: true,
    click: true,
    distribute: true,
  },
};

let audioContext: AudioContext | null = null;
let settings: SoundSettings = { ...defaultSettings };

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', attack = 0.01, decay = 0.1) {
  if (!settings.enabled) return;
  
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    const now = ctx.currentTime;
    const volume = settings.volume * 0.3;
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + attack);
    gainNode.gain.linearRampToValueAtTime(volume * 0.7, now + attack + decay);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);
    
    oscillator.start(now);
    oscillator.stop(now + duration);
  } catch (e) {
    console.warn('Audio playback failed:', e);
  }
}

function playChord(frequencies: number[], duration: number, type: OscillatorType = 'sine') {
  frequencies.forEach((freq, i) => {
    setTimeout(() => playTone(freq, duration, type), i * 50);
  });
}

export const sounds = {
  success: () => {
    if (!settings.sounds.success) return;
    playChord([523.25, 659.25, 783.99], 0.3, 'sine');
  },
  
  notification: () => {
    if (!settings.sounds.notification) return;
    playTone(880, 0.15, 'sine');
    setTimeout(() => playTone(1108.73, 0.15, 'sine'), 100);
  },
  
  error: () => {
    if (!settings.sounds.error) return;
    playTone(200, 0.3, 'sawtooth', 0.01, 0.05);
  },
  
  click: () => {
    if (!settings.sounds.click) return;
    playTone(1000, 0.05, 'square', 0.001, 0.01);
  },
  
  distribute: () => {
    if (!settings.sounds.distribute) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'sine'), i * 100);
    });
  },
};

export function playSound(type: SoundType) {
  sounds[type]?.();
}

export function getSoundSettings(): SoundSettings {
  return { ...settings };
}

export function updateSoundSettings(newSettings: Partial<SoundSettings>) {
  settings = { ...settings, ...newSettings };
  localStorage.setItem('pumplogic_sound_settings', JSON.stringify(settings));
}

export function updateIndividualSound(soundType: keyof SoundSettings['sounds'], enabled: boolean) {
  settings.sounds[soundType] = enabled;
  localStorage.setItem('pumplogic_sound_settings', JSON.stringify(settings));
}

export function loadSoundSettings() {
  try {
    const saved = localStorage.getItem('pumplogic_sound_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      settings = { ...defaultSettings, ...parsed, sounds: { ...defaultSettings.sounds, ...parsed.sounds } };
    }
  } catch (e) {
    console.warn('Failed to load sound settings:', e);
  }
}

loadSoundSettings();
