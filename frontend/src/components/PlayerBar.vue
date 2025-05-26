<template>
  <div 
    v-if="currentSong.filePath"
    class="fixed bottom-0 left-0 right-0 bg-spotify-dark p-4 flex items-center justify-between shadow-lg"
  >
    <!-- Song Info -->
    <div class="flex items-center w-1/3">
      <div class="ml-4 min-w-[160px]">
        <p class="text-sm font-medium truncate">{{ currentSong.title || 'Título desconocido' }}</p>
        <p class="text-xs text-spotify-gray truncate">{{ currentSong.artist || 'Artista desconocido' }}</p>
      </div>
    </div>

    <!-- Controls -->
    <div class="flex flex-col items-center w-1/3">
      <div class="flex items-center gap-4">
        <button
          @click="togglePlay"
          class="bg-spotify-green text-black rounded-full p-3 hover:bg-green-500 transition-all"
        >
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path v-if="!isPlaying" d="M8 5v14l11-7z"/>
            <path v-if="isPlaying" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </button>
      </div>

      <!-- Progress Bar -->
      <div class="w-full mt-2">
        <input
          type="range"
          :value="currentTime"
          :max="duration"
          @input="seek($event.target.value)"
          class="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          :style="progressStyle"
        />
        <div class="flex justify-between text-xs text-spotify-gray mt-1">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>
    </div>

    <!-- Volume -->
    <div class="w-1/3 flex justify-end items-center pr-4">
      <div class="flex items-center gap-2 w-32">
        <input
          type="range"
          v-model="volume"
          min="0"
          max="1"
          step="0.1"
          class="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { usePlayer } from '../composables/usePlayer';

const { currentSong, isPlaying, currentTime, duration, togglePlay, seek } = usePlayer();
const volume = ref(1);

watch(volume, (newValue) => {
  if (window.audioElement) window.audioElement.volume = newValue;
});

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const progressStyle = computed(() => ({
  background: `linear-gradient(to right, #1DB954 ${(currentTime / duration) * 100}%, #535353 ${(currentTime / duration) * 100}%)`
}));
</script>

<style scoped>
input[type="range"]::-webkit-slider-thumb {
  width: 14px;
  height: 14px;
  background: #1DB954;
  border-radius: 50%;
  -webkit-appearance: none;
}

input[type="range"]::-moz-range-thumb {
  width: 14px;
  height: 14px;
  background: #1DB954;
  border-radius: 50%;
  border: none;
}
</style>