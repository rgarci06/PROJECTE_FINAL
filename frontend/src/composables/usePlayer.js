import { ref, watch, onBeforeUnmount } from 'vue';

export function usePlayer() {
  const currentSong = ref({});
  const isPlaying = ref(false);
  const audio = ref(null);
  const currentTime = ref(0);
  const duration = ref(0);
  let isSeeking = false;

  const setupAudioEvents = () => {
    if (!audio.value) return;

    audio.value.addEventListener('loadedmetadata', () => {
      duration.value = audio.value.duration;
    });

    audio.value.addEventListener('timeupdate', () => {
      if (!isSeeking) currentTime.value = audio.value.currentTime;
    });

    audio.value.addEventListener('ended', () => {
      isPlaying.value = false;
    });

    audio.value.addEventListener('error', (error) => {
      console.error('Error de audio:', error);
      resetPlayerState();
    });
  };

  const resetPlayerState = () => {
    isPlaying.value = false;
    currentTime.value = 0;
    duration.value = 0;
    currentSong.value = {};
  };

  watch(() => currentSong.value?.filePath, (newPath) => {
    if (!newPath) return;

    if (audio.value) {
      audio.value.pause();
      audio.value.removeAttribute('src');
    }

    audio.value = new Audio(newPath);
    setupAudioEvents();

    audio.value.play()
      .then(() => isPlaying.value = true)
      .catch(error => console.log('Esperando interacción:', error.message));
  });

  const playSong = (song) => {
    if (!song?.filePath) return;
    currentSong.value = JSON.parse(JSON.stringify(song));
  };

  const togglePlay = () => {
    if (!audio.value) return;
    isPlaying.value ? audio.value.pause() : audio.value.play();
    isPlaying.value = !isPlaying.value;
  };

  const seek = (time) => {
    if (!audio.value) return;
    isSeeking = true;
    audio.value.currentTime = Number(time);
    setTimeout(() => isSeeking = false, 100);
  };

  onBeforeUnmount(() => {
    if (audio.value) {
      audio.value.pause();
      audio.value = null;
    }
    resetPlayerState();
  });

  return {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    playSong,
    togglePlay,
    seek
  };
}