import Vue from 'vue';
import App from './App.vue';
import router from './router';
import '@/assets/global.scss';

Vue.config.productionTip = false;

const XCaliper: any = window['XCaliper'];
const user: any = window['user'];
const intent: any = window['intent'];
const sendBroad: any = window['sendBroad'];
const _check: any = window['_check'];
// var xcaliperSend: any = window['xcaliperSend'];

declare global {
	interface Window {
		onBackPressed: Function;
		onPause: Function;
		onResume: Function;
	}
}

new Vue({
	router,
	render: h => h(App),
}).$mount('#app');
