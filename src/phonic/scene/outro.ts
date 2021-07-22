import gsap, { Power0 } from 'gsap/all';
import { PhonicsApp } from '../core/app';
import { ResourceManager } from '../core/resourceManager';
import { SceneBase } from '../core/sceneBase';
import config from '../../com/util/Config';

export class Outro extends SceneBase {
	private mCha: PIXI.Sprite;
	private mStarAry: Array<PIXI.Sprite>;

	constructor() {
		super('outro');
	}
	async onInit() {
		PhonicsApp.Handle.controllerVisible(false);
	}

	async onStart() {
		await this.createBG();
		await this.createTxt();
		await this.createStar();
		await this.createCha();
		await this.playOutro();
	}

	private createBG(): Promise<void> {
		return new Promise<void>(resolve => {
			const bg = new PIXI.Graphics();
			bg.beginFill(0x0080db, 1);
			bg.drawRect(0, 0, config.width, config.height);
			bg.endFill();
			bg.alpha = 0;

			const close = new PIXI.Sprite(
				ResourceManager.Handle.getCommon('close_btn.png').texture,
			);
			close.anchor.set(0.5);
			close.position.set(config.width - 50, 50);
			close.interactive = true;
			close.on('pointertap', () => {
				window.close();
			});
			this.addChild(bg, close);
			gsap
				.to(bg, { alpha: 1, duration: 0.5 })
				.eventCallback('onComplete', () => {
					resolve();
				});
		});
	}

	private createTxt(): Promise<void> {
		return new Promise<void>(resolve => {
			const txt = new PIXI.Text(`See you next time!`, {
				fontFamily: 'minigate Bold ver2',
				fontSize: 126,
				fill: 0xffffff,
				padding: 20,
			});
			txt.roundPixels = true;
			txt.pivot.set(txt.width / 2, txt.height / 2);
			txt.position.set(config.width / 2, 192);
			this.addChild(txt);
			txt.alpha = 0;
			gsap
				.to(txt, { alpha: 1, duration: 0.5 })
				.eventCallback('onComplete', () => {
					resolve();
				});
		});
	}

	private createCha(): Promise<void> {
		return new Promise<void>(resolve => {
			this.mCha = new PIXI.Sprite(
				ResourceManager.Handle.getCommon('outro_cha.png').texture,
			);
			this.mCha.anchor.set(0.5);
			this.mCha.scale.set(0);
			this.mCha.position.set(config.width / 2, 476);
			this.addChild(this.mCha);

			resolve();
		});
	}

	private createStar(): Promise<void> {
		return new Promise<void>(resolve => {
			this.mStarAry = [];

			for (let i = 0; i < 6; i++) {
				const star = new PIXI.Sprite(
					ResourceManager.Handle.getCommon('outro_star.png').texture,
				);
				star.scale.set(0, 0);
				star.anchor.set(0.5);
				star.position.set(config.width / 2, 476);
				this.addChild(star);
				this.mStarAry.push(star);
			}
			resolve();
		});
	}

	private playOutro(): Promise<void> {
		return new Promise<void>(resolve => {
			gsap.to(this.mCha.scale, { x: 1, y: 1, duration: 0.8, ease: 'back' });
			const starPos = [
				{ x: config.width / 2, y: 476 }, // 큰별
				{ x: config.width / 2 - 260, y: 476 + 90 }, // 맨 왼쪽 별부터
				{ x: config.width / 2 - 140, y: 476 - 120 },
				{ x: config.width / 2 + 60, y: 476 - 180 },
				{ x: config.width / 2 + 170, y: 476 - 100 },
				{ x: config.width / 2 + 170, y: 476 + 100 }, // 맨 오른쪽 별까지
			];

			const scale = [1, 0.2, 0.15, 0.1, 0.19, 0.1];

			const angle = [0, 10, -6, 2, 30, -10];

			for (let i = 0; i < scale.length; i++) {
				gsap.to(this.mStarAry[i].scale, {
					x: scale[i],
					y: scale[i],
					duration: 0.5,
				});

				gsap.to(this.mStarAry[i], {
					x: starPos[i].x,
					y: starPos[i].y,
					duration: 1,
				});
				this.mStarAry[i].angle = angle[i];

				if (i == scale.length - 1) {
					let outroSfx = ResourceManager.Handle.getCommon('outro_sfx.mp3')
						.sound;
					outroSfx.play();
					gsap.delayedCall(outroSfx.duration + 1, () => {
						outroSfx = null;
						resolve();
					});
				}
			}
		});
	}
}
