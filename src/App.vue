<template>
	<div id="app" ref="app">
		<!-- <canvas id="canvas" ref="canvas"></canvas> -->
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
	async created() {
		console.log(new Date().toString());
		if (window['video']) {
			window['video'].pause();
			window['video'] = null;
		}
		await this.getInitInfo();

		switch (Config.getInitVariable.subj_viw_nm) {
			case '알파벳':
				this.goAlphabet();
				break;
			case '파닉스리딩':
				this.goPhonics();
				break;
			case '파닉스':
				this.goPhonic();
				break;
			case '사이트워드':
				this.goSightWords();
				break;
			default:
				this.goAlphabet();
		}
	}
	async mounted() {
		// app = new Alphabet(this.$refs.canvas as HTMLCanvasElement);
		// window.addEventListener('resize', () => {
		// 	this.reclacScreen(this.$refs.canvas as HTMLCanvasElement);
		// });
		// this.reclacScreen(this.$refs.canvas as HTMLCanvasElement);
	}

	//getInitVariables 호출을 나타낸다.
	async getInitInfo() {
		if (window['Android']) {
			const tData = await window['Android'].getInitVariables();
			Util.jsonToProperty(tData, Config.getInitVariable);
			window['$eco'] ? (Config.isHomeLearn = window['$eco'].isHomeLearn) : null;
		}
	}

	goAlphabet() {
		this.$router.replace('/alphabet');
	}
	goPhonics() {
		this.$router.replace('/phonics');
	}
	goPhonic() {
		this.$router.replace('/phonic');
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
