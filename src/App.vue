<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { mapActions } from "vuex";
export default {
  name: "App",
  methods: {
    ...mapActions(["initcInvTree"]),
  },
  mounted() {
    var _beforeUnload_time = 0,
      _gap_time = 0;
    window.onunload = () => {
      _gap_time = new Date().getTime() - _beforeUnload_time;

      if (_gap_time <= 5) {
        window.localStorage.setItem("token", "");
        window.localStorage.setItem("tagNaveList", "");
      }
    };
    window.onbeforeunload = () => {
      _beforeUnload_time = new Date().getTime();
    };
  },
};
</script>

<style lang="less">
.size {
  width: 100%;
  height: 100%;
}
html,
body {
  .size;
  overflow: hidden;
  margin: 0;
  padding: 0;
}
#app {
  .size;
}
</style>
