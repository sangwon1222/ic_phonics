<template>
	<div class="siteWord">
		<canvas id="canvas" ref="canvas" />
		<!-- <button @click="goAlphabet">goAlphabet</button> -->
	</div>
</template>

<script lang="ts" scoped>
import { Component, Vue } from 'vue-property-decorator';
import { SightWordsApp } from '@/sightwords/SightWordsApp';

@Component({
	components: {},
})
export default class SiteWord extends Vue {
	$refs: {
		canvas: HTMLCanvasElement;
	};
	async mounted() {
		// window.onkeydown = evt => {
		// 	this.tabKeyCheck(evt);
		// };
		new SightWordsApp(this.$refs.canvas);

		window.addEventListener('resize', async () => {
			await this.reclacScreen();
		});
		await this.reclacScreen();
	}

	reclacScreen(): Promise<void> {
		return new Promise<void>(resolve => {
			const w = window.innerWidth;
			const h = window.innerHeight;
			if (w > h * 1.7) {
				document.body
					.getElementsByTagName('canvas')[0]
					.setAttribute('style', `width: calc(1.7 * ${h}px ); height:100%;`);
			} else {
				document.body
					.getElementsByTagName('canvas')[0]
					.setAttribute('style', `width:100%;height:calc( ${w}px / 1.7 )`);
			}
			resolve();
		});
	}

	// tabKeyCheck(evt: any) {
	// 	// console.error(evt.key);
	// 	if (evt.key == 'Tab') {
	// 		setTimeout(() => {
	// 			const errChilds = document.getElementsByTagName('div');
	// 			for (const tVal of errChilds) {
	// 				const tStartIdx = tVal.outerHTML.indexOf('<div style');
	// 				const tEndIdx = tVal.outerHTML.indexOf('z-index: 2');
	// 				if (tStartIdx == 0 && tEndIdx > 0) {
	// 					// if (
	// 					// 	tVal.outerHTML ===
	// 					// 	'<div style="width: 1280px; height: 752px; position: absolute; top: 0px; left: 0px; z-index: 2;"></div>'
	// 					// ) {
	// 					tVal.parentNode.removeChild(tVal);
	// 				}
	// 			}
	// 		}, 1000);
	// 	}
	// }
	// goAlphabet() {
	// 	this.$router.push('/alphabet');
	// }
}
</script>

<style lang="scss" scoped>
.siteWord {
	position: relative;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;

	#canvas {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
}
</style>
