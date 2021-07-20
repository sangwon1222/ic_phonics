import gsap from 'gsap/all';
import * as PIXI from 'pixi.js';
window.PIXI = PIXI;
import config from '../../com/util/config';
import { ResourceManager } from './resourceManager';

export class Loading extends PIXI.Container {
	// private mDotGroup: Array<PIXI.Graphics>;
	constructor() {
		super();
	}

	async onInit() {
		const bg = new PIXI.Graphics();
		bg.beginFill(0x333333, 0.8);
		bg.drawRect(0, 0, config.width, config.height);
		bg.endFill();
		this.addChild(bg);
		bg.alpha = 0;
		bg.interactive = true;
		gsap.to(bg, { alpha: 1, duration: 0.5 }).eventCallback('onComplete', () => {
			this.start();
		});
	}

	start() {
		const spine = new PIXI.spine.Spine(
			ResourceManager.Handle.getProduct(
				`loadingbar0${Math.ceil(Math.random() * 5)}.json`,
			).spineData,
		);
		this.addChild(spine);
		spine.state.setAnimation(0, 'loadingLoopAni', true);
	}

	// start() {
	// 	this.mDotGroup = [];
	// 	const x = [config.width / 2 - 50, config.width / 2, config.width / 2 + 50];
	// 	for (let i = 0; i < 3; i++) {
	// 		const dot = new PIXI.Graphics();
	// 		dot.beginFill(0xffffff, 1);
	// 		dot.drawCircle(0, 0, 10);
	// 		dot.endFill();
	// 		dot.pivot.set(dot.width / 2, dot.height / 2);
	// 		dot.position.set(x[i], config.height / 2);
	// 		this.addChild(dot);
	// 		this.mDotGroup.push(dot);
	// 		const timeline = gsap.timeline({ repeat: -1 });
	// 		if (i == 0) {
	// 			timeline.to(dot, { y: dot.y - 60, duration: 0.5 });
	// 			timeline.to(dot, { y: dot.y, duration: 0.5, ease: 'bounce' });
	// 			timeline.to(dot, { y: dot.y, duration: 1 });
	// 		}
	// 		if (i == 1) {
	// 			timeline.to(dot, { y: dot.y, duration: 0.5 });
	// 			timeline.to(dot, { y: dot.y - 60, duration: 0.5 });
	// 			timeline.to(dot, { y: dot.y, duration: 0.5, ease: 'bounce' });
	// 			timeline.to(dot, { y: dot.y, duration: 0.5 });
	// 		}
	// 		if (i == 2) {
	// 			timeline.to(dot, { y: dot.y, duration: 1 });
	// 			timeline.to(dot, { y: dot.y - 60, duration: 0.5 });
	// 			timeline.to(dot, { y: dot.y, duration: 0.5, ease: 'bounce' });
	// 		}
	// 	}
	// }

	onEnd() {
		// if (this.mDotGroup) {
		// 	for (const dot of this.mDotGroup) {
		// 		gsap.killTweensOf(dot);
		// 	}
		// }
		this.removeChildren();
	}
}
