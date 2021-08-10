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

	onStar(): Promise<void> {
		return new Promise<void>(resolve => {
			if (!this.mGainStarSnd.paused) {
				this.mGainStarSnd.pause();
			}
			let star = new PIXI.Sprite(this.mOn);
			this.addChild(star);
			star.anchor.set(0.5);
			star.alpha = 0;

			gsap
				.to(star, { alpha: 1, duration: 0.5 })
				.eventCallback('onComplete', () => {
					this.mGainStarSnd.play();
					this.texture = this.mOn;
					this.removeChild(star);
					star = null;
					resolve();
				});
		});
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

	async onStar(step: number) {
		if (step < this.mTotal) {
			await this.mStarAry[step].onStar();
		}
	}
}
