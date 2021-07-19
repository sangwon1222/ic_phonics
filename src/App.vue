<template>
	<div id="app" ref="app">
		<router-view />
	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Config from './com/util/Config';
import * as Util from './com/util/Util';

let app = null;

@Component({
	components: {},
})
export default class App extends Vue {
	private fullFlag = false;
	private mobilecolume = false;

	async created() {
		// console.log(new Date().toString());
		if (window['video']) {
			window['video'].pause();
			window['video'] = null;
		}

		switch (Config.getInitVariable.subj_viw_nm) {
			case '알파벳':
				this.goAlphabet();
				break;
			case '파닉스리딩':
				this.goPhonicsReading();
				break;
			case '파닉스':
				this.goPhonics();
				break;
			case '사이트워드':
				this.goSightWords();
				break;
			default:
				this.goAlphabet();
		}
	}
	async mounted() {
		//
	}

	//getInitVariables 호출을 나타낸다.
	async getInitInfo() {
		if (window['Android']) {
			// const tData = window['Android'].getInitVariables();
			const tData = await window['Android'].getInitVariables();
			// console.log(JSON.stringify(tData));
			Util.jsonToProperty(tData, Config.getInitVariable);
			// console.log(JSON.stringify(Config.getInitVariable));
		}
	}

	goAlphabet() {
		this.$router.replace('/alphabet');
	}
	goPhonics() {
		this.$router.replace('/phonics');
	}
	goPhonicsReading() {
		this.$router.replace('/phonicsreading');
	}
	goSightWords() {
		this.$router.replace('/sightwords');
	}
}
</script>

<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	width: 100vw;
	height: 100vh;
	background-color: #000000;
	box-sizing: border-box;
}
canvas {
	height: 100%;
}
html,
body {
	padding: 0;
	margin: 0;
}
</style>
