import * as PIXI from 'pixi.js';
import Config from '@/com/util/Config';
import { ResourceManager } from '../core/resourceManager';
import gsap from 'gsap/all';

export class Eop extends PIXI.Container {
	private mDimmed: PIXI.Graphics;
	private mSpine: PIXI.spine.Spine;
	private mSnd: {};

	constructor() {
		super();
	}
	async onInit() {
		await this.createObject();
		await this.createSound();

		this.mSpine.state.addListener({
			event: (entry, event) => {
				if (this.mSnd[event.data.name]) {
					this.mSnd[event.data.name].play();
				}
			},
		});
	}

	createObject(): Promise<void> {
		return new Promise<void>(resolve => {
			this.mDimmed = new PIXI.Graphics();
			this.mDimmed.beginFill(0x000000, 1);
			this.mDimmed.drawRect(0, 0, Config.width, Config.height - 64);
			this.mDimmed.beginFill();
			this.mDimmed.alpha = 0;
			this.mDimmed.interactive = true;

			this.mSpine = new PIXI.spine.Spine(
				ResourceManager.Handle.getCommon('eop.json').spineData,
			);
			this.mSpine.position.set(Config.width / 2, Config.height / 2);
			this.mSpine.visible = false;
			this.addChild(this.mDimmed, this.mSpine);
			resolve();
		});
	}

	createSound(): Promise<void> {
		return new Promise<void>(resolve => {
			this.mSnd = {};
			this.mSnd['sound/awesome'] = ResourceManager.Handle.getCommon(
				'awesome.wav',
			).sound;
			this.mSnd['sound/goodjob'] = ResourceManager.Handle.getCommon(
				'goodjob.wav',
			).sound;
			this.mSnd['sound/greatwork'] = ResourceManager.Handle.getCommon(
				'greatwork.wav',
			).sound;
			this.mSnd['sound/superduper'] = ResourceManager.Handle.getCommon(
				'superduper.wav',
			).sound;
			this.mSnd['sound/thumbsup'] = ResourceManager.Handle.getCommon(
				'thumbsup.wav',
			).sound;
			this.mSnd['sound/welldone'] = ResourceManager.Handle.getCommon(
				'welldone.wav',
			).sound;
			resolve();
		});
	}

	start(): Promise<void> {
		return new Promise<void>(resolve => {
			gsap
				.to(this.mDimmed, { alpha: 0.8, duration: 0.5 })
				.eventCallback('onComplete', () => {
					this.mSpine.visible = true;
					this.mSpine.state.setAnimation(
						0,
						`eop${Math.ceil(Math.random() * 6)}`,
						false,
					);
					gsap.delayedCall(3, () => {
						this.mSpine.state.clearListeners();
						resolve();
					});
				});
		});
	}
}
