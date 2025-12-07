/**
 * SoundManager - Centralized sound management
 */
class SoundManager {
    constructor() {
        this.scene = null;
        this.sounds = {};
        this.music = null;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.7;
        this.voiceVolume = 0.8;
        this.muted = false;
    }

    init(scene) {
        this.scene = scene;
    }

    // Play sound effect
    playSFX(key, volume = this.sfxVolume) {
        if (this.muted || !this.scene) return;
        
        try {
            const sound = this.scene.sound.add(key, { volume });
            sound.play();
            return sound;
        } catch (error) {
            console.warn(`Failed to play sound: ${key}`, error);
        }
    }

    // Play background music (looping)
    playMusic(key, volume = this.musicVolume) {
        if (this.muted || !this.scene) return;
        
        // Stop current music
        this.stopMusic();
        
        try {
            this.music = this.scene.sound.add(key, {
                volume,
                loop: true
            });
            this.music.play();
            return this.music;
        } catch (error) {
            console.warn(`Failed to play music: ${key}`, error);
        }
    }

    // Stop current music
    stopMusic() {
        if (this.music) {
            this.music.stop();
            this.music = null;
        }
    }

    // Play voice-over
    playVoice(key, volume = this.voiceVolume) {
        if (this.muted || !this.scene) return;
        
        try {
            const voice = this.scene.sound.add(key, { volume });
            voice.play();
            return voice;
        } catch (error) {
            console.warn(`Failed to play voice: ${key}`, error);
        }
    }

    // Toggle mute
    toggleMute() {
        this.muted = !this.muted;
        if (this.scene) {
            this.scene.sound.mute = this.muted;
        }
        return this.muted;
    }

    // Set volumes
    setMusicVolume(volume) {
        this.musicVolume = volume;
        if (this.music) {
            this.music.setVolume(volume);
        }
    }

    setSFXVolume(volume) {
        this.sfxVolume = volume;
    }

    setVoiceVolume(volume) {
        this.voiceVolume = volume;
    }
}

export default new SoundManager();
