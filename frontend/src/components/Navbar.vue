<template>
  <nav class="w-64 bg-spotify-dark p-6 flex flex-col shadow-lg">
    <h1 class="text-3xl font-bold text-white mb-10">Music App</h1>
    <router-link
      to="/songs"
      class="flex items-center text-lg text-spotify-gray hover:text-white mb-6 py-2 px-4 rounded-lg hover:bg-spotify-black"
      active-class="text-white bg-spotify-black"
    >
      <svg class="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
      </svg>
      Songs
    </router-link>
    <router-link
      to="/songs/new"
      class="flex items-center text-lg text-spotify-gray hover:text-white py-2 px-4 rounded-lg hover:bg-spotify-black"
      active-class="text-white bg-spotify-black"
    >
      <svg class="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
      </svg>
      Add Song
    </router-link>
  </nav>
</template>

<script>
export default {
  name: 'Navbar',
};
</script>