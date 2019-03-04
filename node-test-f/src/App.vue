<template>
  <div id="app">
    <List msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import List from './components/list.vue';

export default {
  name: 'app',
  components: {
    List,
  },
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  padding: 20px;
}
</style>
