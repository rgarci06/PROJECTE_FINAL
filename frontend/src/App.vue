<template>
  <div class="flex min-h-screen flex-col">
    <!-- Sidebar -->
    <div class="flex flex-1">
      <Navbar />
      <!-- Main content -->
      <main class="flex-1 p-8 overflow-auto">
        <router-view></router-view>
      </main>
    </div>
    <!-- Player bar -->
    <PlayerBar />
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';
import PlayerBar from './components/PlayerBar.vue';

export default {
  name: 'App',
  components: { Navbar, PlayerBar },
};
</script>