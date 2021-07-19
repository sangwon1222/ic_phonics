import gsap from 'gsap/all';
import { PhonicsApp } from '../core/app';
import { ResourceManager } from '../core/resourceManager';
import { SceneBase } from '../core/sceneBase';
import config from '../../com/util/Config';
import { shuffleArray } from '../utill/gameUtil';
import { gameData } from '../core/resource/product/gameData';
import Config from '../../com/util/Config';
import { Eop } from '../widget/eop';
import { App } from '@/com/core/App';

const chaPos = [
	{ x: 110, y: 444 },
	{ x: 308, y: 514 },
	{ x: 518, y: 554 },
	{ x: 764, y: 570 },
	{ x: 958, y: 494 },
	{ x: 1129, y: 440 },
];
const shadowPos = [
	{ x: 146, y: 510 },
	{ x: 308, y: 604 },
	{ x: 518, y: 682 },
	{ x: 764, y: 682 },
	{ x: 966, y: 606 },
	{ x: 1136, y: 520 },
];

export class Intro extends SceneBase {
	private mTitle: PIXI.Sprite;

	private mCharacterAry: Array<PIXI.Sprite>;
	private mShadowAry: Array<PIXI.Sprite>;
	constructor() {
		super('intro');
	}
	async onInit() {
		// const eop = new PIXI.spine.Spine(
		// 	ResourceManager.Handle.getCommon('eop.json').spineData,
		// );
		// this.addChild(eop);
		// eop.state.setAnimation(0, `eop3`, false);
		// eop.position.set(Config.width / 2, Config.height / 2);
		await ResourceManager.Handle.loadCommonResource({
			sounds: ['title/' + gameData[`day${Config.subjectNum}`].title + '.mp3'],
		});
		window['currentAlphabet'] = ResourceManager.Handle.getCommon(
			'title/' + gameData[`day${Config.subjectNum}`].title + `.mp3`,
		).sound;

		PhonicsApp.Handle.controllerVisible(false);

		await this.createBG();
		await this.createTxt();
		await this.createCha();

		window.onkeydown = async (evt: KeyboardEvent) => {
			if (evt.key == '+') {
				if (this.sceneName == 'intro') {
					await this.goScene('chant');
					window.onkeydown = () => null;
				} else {
					window.onkeydown = () => null;
				}
			}
		};
	}

	async onStart() {
		const bgm = ResourceManager.Handle.getCommon('intro_bgm.mp3').sound;
		bgm.play();
		bgm.volume = 0;
		gsap.to(bgm, { volume: 1, duration: 4 });

		gsap.delayedCall(bgm.duration, async () => {
			await this.goScene('chant');
		});
		await this.playChaMotion();
		this.clickCha();
		await this.readAlphabet();
		this.clickAlphabet();
	}

	// 생성 함수============================================
	private createBG(): Promise<void> {
		return new Promise<void>(resolve => {
			const bg = new PIXI.Graphics();
			bg.beginFill(0x0080db, 1);
			bg.drawRect(0, 0, config.width, config.height);
			bg.endFill();
			bg.alpha = 0;
			this.addChild(bg);
			gsap
				.to(bg, { alpha: 1, duration: 0.5 })
				.eventCallback('onComplete', () => {
					resolve();
				});
		});
	}

	private createTxt(): Promise<void> {
		return new Promise<void>(resolve => {
			const phonicsText = new PIXI.Text('phonics', {
				fontFamily: 'minigate Bold ver2',
				fontSize: 64,
				fill: 0x023c65,
				padding: 20,
			});
			phonicsText.roundPixels = true;
			phonicsText.pivot.set(phonicsText.width / 2, phonicsText.height / 2);
			phonicsText.position.set(config.width / 2, 128);
			phonicsText.alpha = 0;

			const title = gameData[`day${Config.subjectNum}`].title;
			this.mTitle = new PIXI.Text(title, {
				fontFamily: 'minigate Bold ver2',
				fontSize: 126,
				fill: 0xffffff,
				padding: 20,
			});
			this.mTitle.pivot.set(this.mTitle.width / 2, this.mTitle.height / 2);
			this.mTitle.roundPixels = true;
			this.mTitle.position.set(config.width / 2, 290);
			this.mTitle.scale.set(6);
			this.mTitle.alpha = 0;

			this.addChild(phonicsText, this.mTitle);

			gsap.to(phonicsText, { alpha: 1, duration: 0.25 });
			gsap.to(this.mTitle, { alpha: 1, duration: 0.25 }).delay(0.3);
			gsap.to(this.mTitle.scale, { x: 1, y: 1, duration: 0.25 }).delay(0.25);
			resolve();
		});
	}

	private createCha(): Promise<void> {
		return new Promise<void>(resolve => {
			this.mCharacterAry = [];
			this.mShadowAry = [];

			for (let i = 1; i <= 6; i++) {
				const shadow = new PIXI.Sprite(
					ResourceManager.Handle.getCommon(`intro_cha${i}_shadow.png`).texture,
				);
				this.addChild(shadow);
				shadow.position.set(shadowPos[i - 1].x, shadowPos[i - 1].y);
				shadow.anchor.set(0.5);
				shadow.scale.set(0);
				shadow.alpha = 0;
				this.mShadowAry.push(shadow);
			}
			for (let i = 1; i <= 6; i++) {
				const cha = new PIXI.Sprite(
					ResourceManager.Handle.getCommon(`intro_cha${i}.png`).texture,
				);
				this.addChild(cha);
				cha.alpha = 0;
				cha.anchor.set(0.5);
				cha.position.set(chaPos[i - 1].x, chaPos[i - 1].y - 200);
				this.mCharacterAry.push(cha);
			}
			resolve();
		});
	}

	// 실행 함수============================================
	private readAlphabet(): Promise<void> {
		return new Promise<void>(resolve => {
			let titleSnd = ResourceManager.Handle.getCommon('title_phonics.mp3')
				.sound;
			titleSnd.play();
			gsap.delayedCall(titleSnd.duration, () => {
				titleSnd = null;
				window['currentAlphabet'].play();
				gsap
					.to(this.mTitle.scale, { x: 1.2, y: 1.2, ease: 'back' })
					.yoyo(true)
					.repeat(1)
					.eventCallback('onComplete', () => {
						resolve();
					});
			});
		});
	}

	// 캐릭터 위에서 떨어지는 모션/
	private playChaMotion(): Promise<void> {
		return new Promise<void>(resolve => {
			const rAry = [0, 1, 2, 3, 4, 5];
			const random = shuffleArray(rAry);

			for (let i = 0; i < 6; i++) {
				const index = random[i];
				gsap
					.to(this.mCharacterAry[index], {
						alpha: 1,
						y: chaPos[index].y,
						duration: 0.5,
						ease: 'bounce',
					})
					.delay(i / 2)
					.eventCallback('onComplete', () => {
						i == 5 ? resolve() : null;
					});
			}
			for (let i = 0; i < 6; i++) {
				const index = random[i];
				gsap
					.to(this.mShadowAry[index].scale, {
						x: 1,
						y: 1,
						duration: 0.8,
						ease: 'bounce',
					})
					.delay(i / 2);

				gsap
					.to(this.mShadowAry[index], {
						alpha: 1,
						duration: 0.5,
						ease: 'bounce',
					})
					.delay(i / 2 - 0.2);
			}
		});
	}

	private clickAlphabet() {
		this.mTitle.interactive = true;
		this.mTitle.buttonMode = true;
		this.mTitle.on('pointertap', async () => {
			window['clickSnd'].play();
			this.mTitle.interactive = false;
			this.mTitle.buttonMode = false;
			await this.readAlphabet();
			this.mTitle.interactive = true;
			this.mTitle.buttonMode = true;
		});
	}

	private clickCha() {
		for (let i = 1; i <= 6; i++) {
			const cha = this.mCharacterAry[i - 1];
			cha.interactive = true;
			cha.buttonMode = true;

			cha.on('pointertap', () => {
				window['clickSnd'].play();
				gsap.killTweensOf(cha);
				gsap.killTweensOf(this.mShadowAry[i - 1].scale);

				cha.y = chaPos[i - 1].y;
				this.mShadowAry[i - 1].scale.set(1);

				cha.interactive = false;
				cha.buttonMode = false;
				gsap
					.to(cha, { y: cha.y - 100, duration: 0.5 })
					.yoyo(true)
					.repeat(1)
					.eventCallback('onComplete', () => {
						cha.interactive = true;
						cha.buttonMode = true;
					});
				gsap
					.to(this.mShadowAry[i - 1].scale, { x: 0.6, y: 0.6, duration: 0.5 })
					.yoyo(true)
					.repeat(1);
			});
		}
	}
}