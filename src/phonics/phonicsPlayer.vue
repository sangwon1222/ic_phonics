<template>
	<div id="phonics">
		<button
			id="closeBtn"
			class="fullBtn"
			v-if="this.fullFlag && this.mobilecolume"
			@click="_closeFullScreen"
		/>
		<button
			id="goFullBtn"
			class="fullBtn"
			v-if="!this.fullFlag && this.mobilecolume"
			@click="_goFullScreen"
		/>
		<canvas id="canvas" />

		<div id="guideRotate" v-if="this.mobilecolume">
			<p id="guideText">
				가로모드에 최적화 되어 있습니다.
			</p>
			<img
				src="@/assets/phone.png"
				id="phone"
				alt="세로모드일때, 가로유도 폰이미지"
			/>
		</div>
	</div>
</template>

<script lang="ts" scoped>
import { Component, Vue } from 'vue-property-decorator';
import { PhonicsApp } from '@/phonics/core/app';
import * as PIXI from 'pixi.js';
window.PIXI = PIXI;
@Component({
	components: {},
})
export default class App extends Vue {
	private App: PhonicsApp;
	private fullFlag = false;
	private mobilecolume = false;
	async created() {
		//
	}
	async mounted() {
		window['phonics_resize'] = () => this.resizeApp();
		window.addEventListener('resize', window['phonics_resize']);
		this.resizeApp();

		this.App = new PhonicsApp(
			document.getElementById('canvas') as HTMLCanvasElement,
			'home',
			// 'intro',
			// 'chant',
			// 'sound',
			// 'game',
		);
		// sessionStorage.setItem('start', 'start');
		await this.App.onInit();
		this.App.goFullScreen = async () => {
			await this._goFullScreen();
		};
	}

	destroyed() {
		window.removeEventListener('resize', window['phonics_resize']);
		window['phonics_resize'] = () => null;
	}

	private resizeApp() {
		const app = document.getElementById('phonics');

		app.setAttribute('style', 'width:100%; height:100%;');
		const w = app.clientWidth;
		const h = app.clientHeight;

		const canvas = document.getElementById('canvas');
		if (w / h > 1.6) {
			// 가로가 넓어서 높이 100%일때
			canvas.setAttribute('style', `width: ${h * 1.6}px; height: ${h}px;`);
		} else {
			// 세로가 넓어서 너비가 100%일때
			canvas.setAttribute('style', `width: ${w}px; height: ${w / 1.6}px;`);
		}

		if (h - 100 > w) {
			// 세로로 볼때,
			this.mobilecolume = true;
		} else {
			// 가로로 볼때,
			this.mobilecolume = false;
		}
	}

	async _goFullScreen() {
		if (!document.fullscreenElement) {
			if (this.$el.requestFullscreen) {
				this.$el.requestFullscreen(); // W3C spec
			} else if ((this.$el as any).mozRequestFullScreen) {
				(this.$el as any).mozRequestFullScreen(); // Firefox
			} else if ((this.$el as any).webkitRequestFullscreen) {
				(this.$el as any).webkitRequestFullscreen(); // Safari
			} else if ((this.$el as any).msRequestFullscreen) {
				(this.$el as any).msRequestFullscreen(); // IE/Edge
			}
			this.fullFlag = true;
		}
	}

	async _closeFullScreen() {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if ((document as any).mozCancelFullScreen) {
			(document as any).mozCancelFullScreen();
		} else if ((document as any).webkitExitFullscreen) {
			(document as any).webkitExitFullscreen();
		}
		this.fullFlag = false;
	}
}
</script>

<style lang="scss" scoped>
#phonics {
	/**ios에서 확대 터치 막기 */
	touch-action: pan-y;
	/**ios에서 확대 터치 막기 */
	overflow: hidden;
	position: fixed;
	width: 100%;
	height: 100%;
	top: 0;
	left: 0;
	box-sizing: border-box;
	background-color: #000;
	.fullBtn {
		position: absolute;
		top: 10px;
		right: 10px;
		width: 50px;
		height: 50px;
		border: 4px #fff solid;
		border-radius: 50px;
	}
	#goFullBtn {
		background: #000;
		&::before,
		&::after {
			content: '';
			display: block;
			position: absolute;
			top: 50%;
			left: 50%;
			width: 0;
			height: 0;
			transform: translate(-50%, -50%);
		}

		&::before {
			border: 2px #fff solid;
			animation: goFullMotion forwards 0.5s 0.5s;
		}
		&::after {
			background: #000;
			animation: goFullMotion forwards 0.5s 1s;
			transform: translate(-50%, -50%) rotate(-45deg);
		}
		@keyframes goFullMotion {
			to {
				width: 20px;
				height: 20px;
			}
		}
	}
	#closeBtn {
		&::before,
		&::after {
			content: '';
			display: block;
			position: absolute;
			top: 50%;
			left: 50%;
			width: 4px;
			height: 0;
			transform: translate(-50%, -50%);
			background: #fff;
		}
		&::before {
			animation: closebtnMotion1 forwards 0.5s 0.5s;
		}
		&::after {
			animation: closebtnMotion2 forwards 0.5s 0.5s;
		}
		@keyframes closebtnMotion1 {
			50% {
				height: 20px;
			}
			100% {
				height: 20px;
				transform: translate(-50%, -50%) rotate(45deg);
			}
		}
		@keyframes closebtnMotion2 {
			50% {
				height: 20px;
			}
			100% {
				height: 20px;
				transform: translate(-50%, -50%) rotate(-45deg);
			}
		}
	}

	#canvas {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 1280px;
		height: 800px;
		/* border: 2px white solid;
		box-sizing: border-box; */
	}

	#guideRotate {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: absolute;
		bottom: -20px;
		left: 50%;
		width: 248px;
		transform: translate(-50%, -50%);
		#guideText {
			display: block;
			color: #fff;
			width: 100%;
			text-align: center;
		}
		#phone {
			margin-top: 20px;
			width: 40px;
			transform-origin: center bottom;
			animation: rotateMotion 1.5s infinite;
		}
		@keyframes rotateMotion {
			0% {
				transform-origin: center bottom;
				transform: rotate(0deg);
			}
			100% {
				transform-origin: center bottom;
				transform: rotate(90deg);
			}
		}
	}
}
</style>
