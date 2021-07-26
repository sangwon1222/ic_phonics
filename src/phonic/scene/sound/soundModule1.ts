import * as PIXI from 'pixi.js';
import Config from '@/com/util/Config';
import { ResourceManager } from '@/phonic/core/resourceManager';
import { SoundModule } from './soundModule';
import { gameData } from '@/phonic/core/resource/product/gameData';
import gsap, { Linear, MorphSVGPlugin, Power0, TweenMax } from 'gsap/all';
import { debugLine, shuffleArray } from '@/phonic/utill/gameUtil';
import { Sound } from './sound';
import { Tween } from 'jquery';
import pixiSound from 'pixi-sound';
import { StarBar } from '@/phonic/widget/star';
import { Eop } from '@/phonic/widget/eop';
import { PhonicsApp } from '@/phonic/core/app';

// 글자의 파도를 꽉채우면 나오는 완성카드
export class CompleteCard extends PIXI.Container {
	private mTxtArray: Array<PIXI.Text>;

	private mTxtStage: PIXI.Container;
	private mImgStage: PIXI.Container;

	constructor(private mWord: string) {
		super();
	}

	// 변수 초기화 및 재설정
	async onInit() {
		this.mTxtArray = [];
		this.mTxtStage = new PIXI.Container();
		this.mImgStage = new PIXI.Container();
		this.addChild(this.mTxtStage, this.mImgStage);
		await this.createText();
		await this.createImg();
		this.mTxtStage.scale.set(1);
		this.mImgStage.scale.set(1);
		this.mTxtStage.visible = false;
		this.mImgStage.visible = false;
	}

	// 이미지 카드와 단어의 등장 [모션 위주 코드]
	show(): Promise<void> {
		return new Promise<void>(resolve => {
			let wordSnd = ResourceManager.Handle.getCommon(
				`${Config.subjectNum}_${this.mWord}.mp3`,
			).sound;

			this.mImgStage.scale.set(0);
			this.mImgStage.visible = true;
			this.mTxtStage.scale.set(0);
			this.mTxtStage.visible = true;

			gsap.to(this.mImgStage.scale, {
				x: 1,
				y: 1,
				duration: 0.5,
				ease: 'bounce',
			});

			gsap
				.to(this.mTxtStage.scale, {
					x: 1,
					y: 1,
					duration: 0.5,
					ease: 'bounce',
				})
				.eventCallback('onComplete', () => {
					wordSnd.play();
					gsap.delayedCall(wordSnd.duration + 0.5, () => {
						wordSnd = null;
						resolve();
					});
				});
		});
	}

	// 단어 텍스트를 만든다.
	createText() {
		/**해당 음가만 노란색으로 칠해주는 코드 */
		let offsetX = 0;
		const title = gameData[`day${Config.subjectNum}`].title;
		let titleLength = 0;
		for (const syllable of this.mWord) {
			let color = 0x000000;

			if (titleLength !== title.length) {
				for (const studySyllable of title) {
					if (syllable == studySyllable) {
						color = 0xffe110;
						titleLength += 1;
						break;
					}
				}
			}
			const txt = new PIXI.Text(syllable, {
				fontFamily: 'minigate Bold ver2',
				padding: 40,
				fontSize: 220,
				fill: color,
			});
			txt.x = offsetX;
			offsetX += txt.width;
			this.mTxtStage.addChild(txt);
			this.mTxtArray.push(txt);
		}
		/**해당 음가만 노란색으로 칠해주는 코드 */

		this.mTxtStage.pivot.set(
			this.mTxtStage.width / 2,
			this.mTxtStage.height / 2,
		);
		this.mTxtStage.position.set(Config.width / 2 + 20 + 30, 480);
	}

	// 단어 이미지카드를 만든다.
	createImg() {
		const whiteBG = new PIXI.Graphics();
		whiteBG.beginFill(0xffffff, 1);
		whiteBG.drawRoundedRect(0, 0, 400, 280, 26);
		whiteBG.endFill();
		this.mImgStage.addChild(whiteBG);

		const img = new PIXI.Sprite(
			ResourceManager.Handle.getProduct(`${this.mWord}.png`).texture,
		);
		img.anchor.set(0.5);
		img.position.set(whiteBG.width / 2, whiteBG.height / 2);
		whiteBG.addChild(img);
		this.mImgStage.pivot.set(
			this.mImgStage.width / 2,
			this.mImgStage.height / 2,
		);
		this.mImgStage.position.set(Config.width / 2, 180);
	}

	// 카드가 나오고 사운드가 끝나면 사라지는 코드 [모션 위주]
	endMotion(): Promise<void> {
		return new Promise<void>(resolve => {
			gsap.to(this.mTxtStage.scale, { x: 0, y: 0, duration: 0.5 });
			gsap
				.to(this.mImgStage.scale, { x: 0, y: 0, duration: 0.5 })
				.eventCallback('onComplete', () => {
					resolve();
				});
		});
	}

	// 메모리 초기화
	end() {
		this.removeChildren();
		this.mTxtArray = [];
		this.mTxtStage = null;
		this.mImgStage = null;
	}
}

// 글자안에서 출렁이는 파도 효과
export class Wave extends PIXI.Container {
	private mCircleAry: Array<PIXI.Graphics>;
	private mWaveAry: Array<PIXI.Sprite>;
	constructor() {
		super();

		this.startMotion();
	}

	// 물결치는 이미지 두장 겹쳐서 물결모션
	startMotion() {
		this.mWaveAry = [];
		this.mCircleAry = [];

		const color = [0xffe110, 0xeace00, 0xd9c001];
		const radius = 150;

		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 5; j++) {
				const circle = new PIXI.Graphics();
				circle.beginFill(0xffffff, 1);
				circle.drawCircle(0, 0, radius);
				circle.endFill();
				circle.tint = color[0];
				this.mCircleAry.push(circle);
				circle.position.set(j * (radius * 1.5), i * radius + radius);
				circle.visible = false;
				this.addChild(circle);
			}
		}

		for (let i = 0; i < 2; i++) {
			const wave = new PIXI.Sprite(
				ResourceManager.Handle.getCommon('wave.png').texture,
			);

			let moveX = 0;
			let moveY = 0;
			if (i == 0) {
				// 뒤 물결 파도
				wave.tint = 0xffd800;
				// wave.x = 20;
				moveX = wave.x + 60;
				moveY = wave.y;
			} else {
				// 앞 물결 파도
				wave.tint = 0xffe100;
				// wave.x = -20;
				moveX = wave.x - 60;
				moveY = wave.y + 20;
			}
			gsap
				.to(wave, {
					x: moveX,
					duration: 1,
					ease: Power0.easeNone,
				})
				.repeat(-1)
				.yoyo(true);
			gsap
				.to(wave, {
					y: moveY,
					duration: i + 1,
					ease: Power0.easeNone,
				})
				.repeat(-1)
				.yoyo(true);
			this.addChild(wave);
			this.mWaveAry.push(wave);
		}
	}

	// 물결이미지 빼고 글자안에서 원 커지고 없어지는 모션
	hide(): Promise<void> {
		return new Promise<void>(resolve => {
			for (const wave of this.mWaveAry) {
				gsap.killTweensOf(wave);
				this.removeChild(wave);
				wave.destroy();
			}
			this.mWaveAry = [];

			for (let i = 0; i < this.mCircleAry.length; i++) {
				this.mCircleAry[i].visible = true;
				gsap
					.to(this.mCircleAry[i].scale, { x: 0, y: 0, duration: 0.5 })
					.eventCallback('onComplete', () => {
						gsap.killTweensOf(this.mCircleAry[i]);
						if (i == this.mCircleAry.length - 1) {
							resolve();
						}
					});
			}
		});
	}

	// 글자 안에서 원 커지면서 색채우기
	show(): Promise<void> {
		return new Promise<void>(resolve => {
			for (let i = 0; i < this.mCircleAry.length; i++) {
				gsap
					.to(this.mCircleAry[i].scale, { x: 1, y: 1, duration: 0.5 })
					.eventCallback('onComplete', () => {
						gsap.killTweensOf(this.mCircleAry[i]);
						this.mCircleAry[i].destroy();
						this.mCircleAry[i] = null;
						if (i == this.mCircleAry.length - 1) {
							this.mCircleAry = [];
							this.destroy();
							resolve();
						}
					});
			}
		});
	}
}

// wave를 실행 및 조작한다.
export class QuizTxt extends PIXI.Sprite {
	// 알파벳의 흰바탕/ 옐로우바탕
	private mTxtBg: PIXI.Sprite;
	// 색칠할 파도 그래픽
	private mWave: Wave;
	private mStartY: number;
	private mEndY: number;

	constructor(private mText: string) {
		super();
	}

	// 데이터 초기화 및 재설정
	async onInit() {
		this.removeChildren();
		this.sortableChildren = true;

		await this.createTxt();
		await this.createWaveGraphic();
	}

	// 글자이미지 생성

	// 알파벳 라인 이미지
	// 파도 이미지
	// 흰바탕 글자 이미지
	private createTxt(): Promise<void> {
		return new Promise<void>(resolve => {
			// 알파벳 흰바탕 이미지 ↙
			this.texture = ResourceManager.Handle.getCommon(
				`title/${Config.subjectNum}_${this.mText}_bg.png`,
			).texture;

			// 알파벳 라인 이미지 ↙
			this.mTxtBg = new PIXI.Sprite(
				ResourceManager.Handle.getCommon(
					`title/${Config.subjectNum}_${this.mText}_line.png`,
				).texture,
			);
			this.mTxtBg.anchor.set(0.5);

			this.anchor.set(0.5);
			/**
			 * anchor가 이미지 가운데이기 때문에
			 * startY는 이미지높이의 반만큼 내려주고
			 * endY는 이미지높이의 반만큼 올려준다.
			 */
			this.mStartY = this.mTxtBg.height / 2;
			this.mEndY = -this.mTxtBg.height / 2;

			this.mTxtBg.zIndex = 3;

			this.addChild(this.mTxtBg);

			resolve();
		});
	}

	// 글자 안의 파도(new Wave)를 생성
	private createWaveGraphic(): Promise<void> {
		return new Promise<void>(resolve => {
			this.mWave = new Wave();

			this.mWave.position.set(-this.mWave.width / 2, this.mStartY);

			const mask = new PIXI.Sprite(
				ResourceManager.Handle.getCommon(
					`title/${Config.subjectNum}_${this.mText}.png`,
				).texture,
			);
			mask.anchor.set(0.5);
			this.mWave.mask = mask;

			this.addChild(mask, this.mWave);
			resolve();
		});
	}

	// 클릭하면 파도를 위로 올리고, 끝나면 end처리
	startEvent() {
		this.interactive = true;
		this.buttonMode = true;

		let flag = false;
		this.on('pointertap', () => {
			(this.parent.parent as Sound1).affor();
			if (flag) {
				return;
			}
			flag = true;

			const moveValue = this.mTxtBg.height / 4;

			// ResourceManager.Handle.getCommon('snd_finger.mp3').sound.play();
			ResourceManager.Handle.getCommon('sound_letter_up.mp3').sound.play();
			gsap
				.to(this.mWave, { y: this.mWave.y - moveValue, duration: 0.5 })
				.eventCallback('onComplete', async () => {
					if (this.mWave.y <= this.mEndY) {
						this.mWave.y = this.mEndY;
						this.interactive = false;
						this.buttonMode = false;
						flag = true;

						// 파도 없어지는 모션
						await this.endMotion();
					} else {
						this.interactive = true;
						this.buttonMode = true;
						flag = false;
					}
				});
		});
	}

	// 파도 없어지는 모션
	async endMotion() {
		ResourceManager.Handle.getCommon('snd_finish.mp3').sound.play();
		// 물결이미지 빼고 원넣고 마스크안에서 원없어지는 모션
		await this.mWave.hide();
		await this.mWave.show();
		this.mTxtBg.texture = ResourceManager.Handle.getCommon(
			`title/${Config.subjectNum}_${this.mText}.png`,
		).texture;
		gsap
			.to(this.scale, { x: 1.1, y: 1.1, duration: 0.5, ease: 'bounce' })
			.eventCallback('onComplete', async () => {
				await (this.parent.parent as Sound1).showCard();
				this.removeChildren();
				this.mTxtBg = null;
				this.mWave = null;
				this.mStartY = null;
				this.mEndY = null;
			});
	}
}

export class Sound1 extends SoundModule {
	private mStage: PIXI.Container;
	private mQuizTxt: QuizTxt;

	private mCompleteCard: CompleteCard;

	private mAffor: PIXI.Sprite;
	private mAfforDelay: any;
	private mAfforAni: gsap.core.Timeline;

	private mWordAry: Array<string>;
	private mWord: string;
	private mStarStep: number;

	private mStarBar: StarBar;

	constructor() {
		super('sound1');
	}
	async onInit() {
		Config.currentMode = 1;
		Config.currentIdx = 0;

		this.removeChildren();
		this.sortableChildren = true;

		await pixiSound.resumeAll();

		this.mWordAry = [];
		this.mStarStep = 0;
		this.mWordAry = shuffleArray(gameData[`day${Config.subjectNum}`].list);
		this.mWord = gameData[`day${Config.subjectNum}`].list[this.mStarStep];

		const snd = [];
		const img = [];
		for (const quiz of this.mWordAry) {
			snd.push(`${Config.subjectNum}_${quiz}.mp3`);
			img.push(`${quiz}.png`);
		}
		await ResourceManager.Handle.loadCommonResource({
			sounds: snd,
		});
		await ResourceManager.Handle.loadProductResource({
			images: img,
		});

		const bg = new PIXI.Sprite(
			ResourceManager.Handle.getCommon('sound1_bg.png').texture,
		);
		this.mStarBar = new StarBar(4);
		this.mStarBar.position.set(Config.width - 30, 30);

		this.mStage = new PIXI.Container();
		this.mStage.sortableChildren = true;

		this.addChild(bg, this.mStarBar, this.mStage);
		await this.mStarBar.onInit();
	}

	async onStart() {
		await this.resetQuizData('start');

		await PhonicsApp.Handle.controller.settingGuideSnd(
			ResourceManager.Handle.getCommon('guide/sound_2.mp3').sound,
		);
		await PhonicsApp.Handle.controller.startGuide();

		this.mQuizTxt.startEvent();
		this.showAffor();
	}

	async resetQuizData(mode?: string) {
		this.mStage.removeChildren();

		await this.createTxt();
		await this.mQuizTxt.onInit();
		// this.mQuizTxt.startEvent();

		await this.createAffor();
		if (mode != 'start') {
			this.mQuizTxt.startEvent();
			this.showAffor();
		}

		this.mCompleteCard = new CompleteCard(this.mWord);
		this.mStage.addChild(this.mCompleteCard);

		await this.mCompleteCard.onInit();
	}

	// 글자 생성 , 클릭스파인 생성
	private createTxt(): Promise<void> {
		return new Promise<void>(resolve => {
			const title = gameData[`day${Config.subjectNum}`].title;
			if (this.mQuizTxt) {
				this.mQuizTxt.removeChildren();
				this.mQuizTxt = null;
			}
			this.mQuizTxt = new QuizTxt(title);
			this.mQuizTxt.position.set(this.width / 2, this.height / 2 - 30);

			const clickEffect = new PIXI.spine.Spine(
				ResourceManager.Handle.getCommon('sound_effect.json').spineData,
			);
			clickEffect.state.setAnimation(
				0,
				`${Config.subjectNum}_${title}_ani`,
				false,
			);

			clickEffect.zIndex = 3;
			clickEffect.visible = false;

			this.mQuizTxt.scale.set(0);
			this.mStage.addChild(this.mQuizTxt, clickEffect);

			gsap
				.to(this.mQuizTxt.scale, { x: 1, y: 1, duration: 0.5 })
				.eventCallback('onComplete', () => {
					this.interactive = true;
					let hideFuction = null;
					this.on('pointertap', (evt: PIXI.InteractionEvent) => {
						if (hideFuction) {
							hideFuction.kill();
							hideFuction = null;
						}
						clickEffect.position.set(evt.data.global.x, evt.data.global.y - 64);
						clickEffect.visible = true;
						clickEffect.state.setAnimation(
							0,
							`${Config.subjectNum}_${title}_ani`,
							false,
						);
						hideFuction = gsap.delayedCall(1, () => {
							clickEffect.visible = false;
						});
					});
				});
			resolve();
		});
	}

	// 어포던스 생성 , 실행
	createAffor(): Promise<void> {
		return new Promise<void>(resolve => {
			this.mAffor = new PIXI.Sprite(
				ResourceManager.Handle.getCommon('click.png').texture,
			);
			this.mAffor.scale.set(2);
			this.mAffor.alpha = 0;
			this.mAffor.anchor.set(0.5);
			this.mAffor.position.set(this.mQuizTxt.x, this.mQuizTxt.y);
			this.mAffor.visible = false;

			this.mStage.addChild(this.mAffor);
			resolve();
		});
	}

	async affor() {
		if (!this.mAffor) return;
		await this.resetAffor();

		this.mAfforDelay = gsap.delayedCall(4, () => {
			this.showAffor();
		});
	}

	showAffor() {
		if (!this.mAffor) return;
		this.mAffor.visible = true;

		this.mAfforAni = gsap.timeline({ repeat: -1, repeatDelay: 4 });
		this.mAfforAni.to(this.mAffor.scale, {
			x: 2,
			y: 2,
			duration: 0,
			ease: Power0.easeNone,
		});
		this.mAfforAni.to(this.mAffor, {
			alpha: 1,
			duration: 0,
			ease: Power0.easeNone,
		});
		this.mAfforAni.to(this.mAffor.scale, {
			x: 1,
			y: 1,
			duration: 0.5,
			ease: Power0.easeNone,
		});
		this.mAfforAni.to(this.mAffor, {
			alpha: 0,
			duration: 0.5,
			ease: Power0.easeNone,
		});
	}

	resetAffor(): Promise<void> {
		return new Promise<void>(resolve => {
			if (this.mAfforAni) {
				this.mAfforAni.kill();
				this.mAfforAni = null;
			}
			if (this.mAfforDelay) {
				this.mAfforDelay.kill();
				this.mAfforDelay = null;
			}
			if (this.mAffor) {
				this.mAffor.visible = false;
			}
			resolve();
		});
	}

	destroyAffor(): Promise<void> {
		return new Promise<void>(resolve => {
			if (this.mAfforAni) {
				this.mAfforAni.kill();
				this.mAfforAni = null;
			}
			if (this.mAfforDelay) {
				this.mAfforDelay.kill();
				this.mAfforDelay = null;
			}
			if (this.mAffor) {
				this.mStage.removeChild(this.mAffor);
				this.mAffor = null;
			}
			resolve();
		});
	}

	// QuizTxt =>startEvent()=> endMotion() 에 등록된 함수에서 실행
	async showCard(): Promise<void> {
		return new Promise<void>(resolve => {
			this.destroyAffor();

			window['currentAlphabet'].play();

			gsap.to(this.mQuizTxt.scale, {
				x: 0,
				y: 0,
				duration: window['currentAlphabet'].duration,
			});
			gsap
				.to(this.mQuizTxt, {
					x: Config.width / 2,
					y: Config.height / 2,
					duration: 0.5,
				})
				.delay(window['currentAlphabet'].duration)
				.eventCallback('onComplete', async () => {
					this.mStage.removeChild(this.mQuizTxt);
					this.mQuizTxt = null;
					await this.mCompleteCard.show();
					await this.next();
					resolve();
				});
		});
	}

	// 모듈1의  다음 별스텝
	async next() {
		await this.mStarBar.onStar(this.mStarStep);
		this.mStarStep += 1;
		const nextWord = gameData[`day${Config.subjectNum}`].list[this.mStarStep];
		if (nextWord) {
			this.mWord = gameData[`day${Config.subjectNum}`].list[this.mStarStep];
			await this.mCompleteCard.endMotion();
			// await gsap.globalTimeline.clear();
			await this.destroyAffor();
			this.mCompleteCard.scale.set(1);
			await this.resetQuizData();
		} else {
			await this.endMotion();
		}
	}

	// 두번째 모듈로 넘어가기 딤드되고 다음버튼 깜빡
	async endMotion() {
		await (this.parent.parent as Sound).controller.outro();

		const sound = this.parent.parent as Sound;
		await this.endGame();
		await sound.prevNextBtn.unLock();
	}

	async endGame() {
		const eop = new Eop();
		eop.zIndex = 20;
		this.addChild(eop);
		await eop.onInit();
		await eop.start();

		await (this.parent.parent as Sound).completedLabel();
	}

	async deleteMemory() {
		await gsap.globalTimeline.clear();
		this.removeChildren();
		this.mStage = null;
		this.mQuizTxt = null;
		this.mCompleteCard = null;
		// this.mClickSpine = null;
		this.mAffor = null;
		this.mAfforDelay = null;
		this.mAfforAni = null;
		this.mWordAry = null;
		this.mWord = null;
		this.mStarStep = null;
		this.mStarBar = null;
		await this.destroyAffor();
	}
}
