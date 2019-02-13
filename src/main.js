import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./generate-dummy-data";

Vue.config.productionTip = false;

store.dispatch('loadComponents')
store.dispatch('loadFrames')
store.dispatch('loadStories')

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
