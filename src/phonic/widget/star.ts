import gsap from 'gsap/all';
import * as PIXI from 'pixi.js';
import { ResourceManager } from '../core/resourceManager';

export class Star extends PIXI.Sprite {
	private mOn: PIXI.Texture;
	private mOff: PIXI.Texture;
	private mGainStarSnd: PIXI.sound.Sound;
	constructor() {
		super();
		this.mOn = ResourceManager.Handle.getCommon('star_on.png').texture;
		this.mOff = ResourceManager.Handle.getCommon('star_off.png').texture;

		this.texture = this.mOff;
		this.anchor.set(0.5);

		this.mGainStarSnd = ResourceManager.Handle.getCommon('gain_star.mp3').sound;
	}
	onStar() {
		// gsap
		// 	.to(this, { alpha: 0, duration: 0.25 })
		// 	.eventCallback('onComplete', () => {
		if (!this.mGainStarSnd.paused) {
			this.mGainStarSnd.pause();
		}
		this.mGainStarSnd.play();
		this.texture = this.mOn;
		// 	gsap.to(this, { alpha: 1, duration: 0.25 });
		// });
	}
}

export class StarBar extends PIXI.Sprite {
	private mStarAry: Array<Star>;
	constructor(private mTotal: number) {
		super();
		this.texture = ResourceManager.Handle.getCommon('star_bg.png').texture;
	}

	async onInit() {
		await this.createStar();
	}

	createStar(): Promise<void> {
		return new Promise<void>(resolve => {
			// const starBG = new PIXI.Sprite(
			// 	ResourceManager.Handle.getCommon('star_bg.png').texture,
			// );
			// this.addChild(starBG);

			this.mStarAry = [];

			let offsetX = 26;
			for (let i = 0; i < this.mTotal; i++) {
				const star = new Star();
				this.addChild(star);
				if (offsetX == 26) offsetX = 26 - this.width;
				star.position.set(offsetX, this.height / 2);
				offsetX += star.width + 8;
				this.mStarAry.push(star);
			}
			this.anchor.set(1, 0);

			this.alpha = 0;

			gsap
				.to(this, { alpha: 1, duration: 0.5 })
				.eventCallback('onComplete', () => {
					resolve();
				});
		});
	}

	onStar(step: number) {
		if (step < this.mTotal) {
			this.mStarAry[step].onStar();
		}
	}
}
