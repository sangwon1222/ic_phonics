import * as PIXI from 'pixi.js';
import config from '@/com/util/Config';
import { ResourceManager } from '@/phonic/core/resourceManager';
import gsap, { Power0 } from 'gsap/all';
import { GameModule } from './gameModule';
import { gameData } from '@/phonic/core/resource/product/gameData';
import { shuffleArray } from '@/com/util/Util';
import { Game } from './game';
import { Btn } from '@/phonic/widget/btn';
import { isIOS } from '@/phonic/utill/gameUtil';
import Config from '@/com/util/Config';
import { StarBar } from '@/phonic/widget/star';
import pixiSound from 'pixi-sound';
import { Eop } from '@/phonic/widget/eop';
import { PhonicsApp } from '@/phonic/core/app';

// 0x995bd9
const variation = [0xff8baf, 0xb56340, 0x73be46];
const gaugeColor = [0xffde00, 0x00baff, 0xff8800];
export class ExamCard extends PIXI.Sprite {
	private mNormal: PIXI.Texture;
	private mCorrectTexture: PIXI.Texture;

	private mQuizImg: PIXI.Sprite;
	get quizImg(): PIXI.Sprite {
		return this.mQuizImg;
	}
	get isCorrect(): boolean {
		return this.mQuizText.isCorrect;
	}

	private mPixiText: PIXI.Text;
	get text(): string {
		return this.mQuizText.text;
	}

	// 푼 카드인지 아직 안푼 카드인지
	private mState: boolean;
	get state(): boolean {
		return this.mState;
	}

	private mIdx: number;
	private mQuizText: { text: string; isCorrect: boolean };
	private mVariationIdx: number;

	constructor(
		idx: number,
		quizText: { text: string; isCorrect: boolean },
		variationIdx: number,
	) {
		super();
		this.mIdx = idx;
		this.mQuizText = quizText;
		this.mVariationIdx = variationIdx;
		this.mState = true;

		this.createBg();
		this.createText();

		this.on('pointertap', async () => {
			await this.onPointerTap();
		});
	}

	// quiz이미지 + 안의 하얀배경 생성
	createBg() {
		this.mNormal = ResourceManager.Handle.getCommon(
			`game1_ex${this.mVariationIdx}_box_${this.mIdx}.png`,
		).texture;

		this.mCorrectTexture = ResourceManager.Handle.getCommon(
			`game1_ex${this.mVariationIdx}_answer_box_${this.mIdx}.png`,
		).texture;

		this.texture = this.mNormal;

		this.anchor.set(0.5);

		const mask = new PIXI.Sprite(
			ResourceManager.Handle.getCommon(`game1_inner_box.png`).texture,
		);
		mask.anchor.set(0.5);

		this.mQuizImg = new PIXI.Sprite(
			ResourceManager.Handle.getProduct(`${this.mQuizText.text}.png`).texture,
		);
		this.mQuizImg.scale.set(0.9);
		this.mQuizImg.anchor.set(0.5);
		this.mQuizImg.position.set(0, -6);
		this.mQuizImg.mask = mask;

		this.addChild(this.mQuizImg, mask);
	}

	// 정답 맞추면 퀴즈이미지 사라지고 나올 텍스트
	createText() {
		this.mPixiText = new PIXI.Text(`${this.mQuizText.text}`, {
			fill: variation[this.mVariationIdx - 1],
			fontSize: 36,
			fontFamily: 'minigate Bold ver2',
			padding: 10,
		});
		this.mPixiText.pivot.set(
			this.mPixiText.width / 2,
			this.mPixiText.height / 2,
		);
		this.mPixiText.x += 2;
		this.mPixiText.y -= 4;
		this.mPixiText.roundPixels = true;
	}

	// 정답일때 모션
	correct(): Promise<void> {
		return new Promise<void>(resolve => {
			// 정답 효과 사운드 ex(띵동)
			ResourceManager.Handle.getCommon(`phonics_correct.mp3`).sound.play();
			this.mState = false;

			let wordSnd = ResourceManager.Handle.getCommon(
				`${Config.subjectNum}_${this.mQuizText.text}.mp3`,
			).sound;

			this.mQuizText.isCorrect = false;
			const duration = 0.25;
			gsap
				.to(this.scale, { x: 0, duration: duration })
				.eventCallback('onComplete', () => {
					wordSnd.play();

					this.removeChildren();
					this.addChild(this.mPixiText);
					this.texture = this.mCorrectTexture;
					gsap
						.to(this.scale, { x: 1, duration: duration })
						.delay(duration)
						.eventCallback('onComplete', () => {
							gsap.delayedCall(wordSnd.duration, () => {
								wordSnd = null;
								resolve();
							});
						});
				});
		});
	}

	// 오답일때 모션
	wrong(): Promise<void> {
		return new Promise<void>(resolve => {
			ResourceManager.Handle.getCommon('phonics_wrong.mp3').sound.play();
			this.mState = false;

			gsap.killTweensOf(this);
			this.angle = 0;
			const dimmedColor = 0x6c6c6c;
			this.tint = dimmedColor;
			this.mQuizImg.tint = dimmedColor;
			// this.mQuizImg.alpha = 0.6;
			gsap.to(this.scale, { x: 0.9, y: 0.9, duration: 0.25 });
			gsap
				.to(this.scale, { x: 1, y: 1, duration: 0.25 })
				.delay(0.5)
				.eventCallback('onComplete', () => {
					this.tint = 0xffffff;
					this.mQuizImg.tint = 0xffffff;
					// this.mQuizImg.alpha = 1;
					resolve();
				});
		});
	}

	// 클릭했을때, override
	async onPointerTap() {
		//
	}
}

export class Game1 extends GameModule {
	private mExamAry: Array<ExamCard>;
	// ExamBox 중 정답카드만 담아둔다. for affordance
	private mCorrectCardAry: Array<ExamCard>;
	private mEndGameFlag: boolean;
	private mSpeakerBtn: Btn;

	private mRocketStage: PIXI.Container;
	private mRocket: PIXI.Sprite;
	private mRocketMask: PIXI.Sprite;

	// 게임 끝나고 딤드와 다시하기 버튼 나오는 화면
	private mEndDimmed: PIXI.Graphics;

	// module1 안의 4스텝(star)을 풀어야 module2로 이동
	private mModuleStep: number;
	private mStarBar: StarBar;

	// 어포던스 반복 함수
	private mAffordance: gsap.core.Tween;
	private mAfforSnd: PIXI.sound.Sound;
	private mAfforHand: PIXI.Sprite;

	// 시간초과 함수
	private mTimeOver: any;

	private mVariationIdx: number;

	private mCompleteFlag: boolean;
	get completeFlag(): boolean {
		return this.mCompleteFlag;
	}

	private mEop: Eop;
	private mIsPlayingGuide: boolean;

	constructor() {
		super('game1');
	}

	async onInit() {
		!isIOS() ? (window['bgm'].volume = 1) : null;
		this.mCompleteFlag = false;
		Config.currentMode = 2;
		Config.currentIdx = 0;
		await pixiSound.resumeAll();

		const variationCount = 3;
		this.mVariationIdx = Math.ceil(Math.random() * variationCount);

		console.groupCollapsed(`[ ${this.moduleName} ] 베리에이션 인덱스 `);
		console.log(
			`[%c now: ${this.mVariationIdx}`,
			'color: red; font-weight:800;',
			`]/ total: ${variationCount} `,
		);
		console.groupEnd();

		// 퀴즈 보기박스 갯수
		const quizBoxCount = 8;

		const images = [];
		for (let i = 1; i <= quizBoxCount; i++) {
			const file = `game1_ex${this.mVariationIdx}_answer_box_${i}.png`;
			images.push(file);
		}
		for (let i = 1; i <= quizBoxCount; i++) {
			const file = `game1_ex${this.mVariationIdx}_box_${i}.png`;
			images.push(file);
		}

		images.push(`game1_bg${this.mVariationIdx}.png`);
		images.push(`game1_gauge${this.mVariationIdx}_ship.png`);

		await ResourceManager.Handle.loadCommonResource({ images: images });
		this.mAffordance ? this.mAffordance.kill() : null;

		this.mAfforSnd = ResourceManager.Handle.getCommon(
			'scaffolding_sfx.mp3',
		).sound;

		this.removeChildren();
		this.mEop = null;
		this.mAffordance = null;
		this.mModuleStep = 0;
		this.mExamAry = [];
		this.mCorrectCardAry = [];
		this.mStarBar = null;
		this.mEndDimmed = null;
		this.mRocketStage = null;
		this.mRocket = null;
		this.mRocketMask = null;
		this.mAfforHand = null;

		const bg = new PIXI.Sprite(
			ResourceManager.Handle.getCommon(
				`game1_bg${this.mVariationIdx}.png`,
			).texture,
		);
		this.mSpeakerBtn = new Btn('speacker_btn_on.png', 'speacker_btn_off.png');
		this.mSpeakerBtn.position.set(config.width / 2, 80);
		this.addChild(bg, this.mSpeakerBtn);

		// 카드생성
		await this.createExamCard();
		// 각 카드 위치 지정
		this.setCardPos();
		// 카드 클릭했을때,
		await this.registCardEvent();
		// 스텝(별) 생성
		await this.createStar();

		// 로켓 생성 및 시간설정
		await this.createRocket();
		this.mSpeakerBtn.interact(false);
		this.mSpeakerBtn.onPointerTap = async () => {
			await this.afforFuction('click');
		};

		window['rocket_timer'] = async (flag: boolean) => {
			if (!this.mRocket || !this.mRocketMask) {
				window['rocket_timer'] = () => null;
				return;
			}

			await this.resetAffor();
			this.mIsPlayingGuide = true;

			const rocket = gsap.getTweensOf(this.mRocket)[0];
			const rocketMask = gsap.getTweensOf(this.mRocketMask)[0];
			if (flag) {
				rocket ? rocket.resume() : null;
				rocketMask ? rocketMask.resume() : null;
				this.mIsPlayingGuide = false;
				await this.registAffordance();
			} else {
				rocket ? rocket.pause() : null;
				rocketMask ? rocketMask.pause() : null;
			}
		};
	}

	async onStart() {
		await PhonicsApp.Handle.controller.settingGuideSnd('guide/game_1.mp3');
		await PhonicsApp.Handle.controller.startGuide();
		await this.speakerAffor();

		await this.cardInteraction(true);
		this.mSpeakerBtn.interact(true);
		this.startRocket();

		await this.registAffordance();
	}

	// -----------------------------------------------------------진행바(별스텝)
	// 진행바(별스텝) 생성
	async createStar() {
		this.mStarBar = new StarBar(4);
		this.mStarBar.position.set(Config.width - 30, 30);
		await this.mStarBar.onInit();
		this.addChild(this.mStarBar);
	}

	// 다음스텝(별)으로
	async nextStar() {
		await this.mStarBar.onStar(this.mModuleStep);
		this.mModuleStep += 1;
		const correctLength = gameData[`day${config.subjectNum}`][`list`].length;
		this.mModuleStep >= correctLength ? null : await this.afforFuction('click');
	}
	// -----------------------------------------------------------로켓
	// 로켓 생성
	createRocket(): Promise<void> {
		return new Promise<void>(resolve => {
			// 로켓이 들어가는 컨테이너
			this.mRocketStage = new PIXI.Container();
			this.addChild(this.mRocketStage);

			// 로켓의 하얀 배경
			const rocketBG = new PIXI.Sprite(
				ResourceManager.Handle.getCommon(`game1_gauge_bg.png`).texture,
			);
			rocketBG.anchor.set(0.5, 1);

			// 로켓의 노란배경 마스크
			this.mRocketMask = new PIXI.Sprite(
				ResourceManager.Handle.getCommon(
					`game1_gauge_bg.png`,
					// `game1_gauge1_line.png`,
				).texture,
			);
			this.mRocketMask.anchor.set(0.5, 1);
			this.mRocketMask.y = this.mRocketMask.height - 20;

			// 로켓의 노란배경
			const rocketYellowBG = new PIXI.Sprite(
				ResourceManager.Handle.getCommon(
					// `game1_gauge${this.mVariationIdx}_line.png`,
					`game1_gauge_bg.png`,
				).texture,
			);
			rocketYellowBG.tint = gaugeColor[this.mVariationIdx - 1];
			rocketYellowBG.anchor.set(0.5, 1);
			rocketYellowBG.mask = this.mRocketMask;

			// 로켓
			this.mRocket = new PIXI.Sprite(
				ResourceManager.Handle.getCommon(
					`game1_gauge${this.mVariationIdx}_ship.png`,
				).texture,
			);
			this.mRocket.anchor.set(0.5);
			this.mRocket.position.set(-2, -20);

			this.mRocketStage.addChild(
				rocketBG,
				rocketYellowBG,
				this.mRocketMask,
				this.mRocket,
			);
			this.mRocketStage.position.set(
				Config.width - 30 - this.mRocketStage.width / 2,
				400 + 200,
			);

			this.mRocketStage.alpha = 0;
			gsap
				.to(this.mRocketStage, {
					alpha: 1,
					duration: 0.25,
				})
				.eventCallback('onComplete', () => {
					resolve();
				});
		});
	}

	// 로켓 시간설정
	startRocket() {
		gsap.to(this.mRocket, {
			y: -400,
			duration: 20,
			ease: Power0.easeNone,
		});

		gsap
			.to(this.mRocketMask, {
				y: 0,
				duration: 20,
				ease: Power0.easeNone,
			})
			.eventCallback('onComplete', () => {
				gsap.killTweensOf(this.mRocket);
				gsap.killTweensOf(this.mRocketMask);
				const timeover = gsap.timeline({
					repeat: 3,
					ease: Power0.easeNone,
				});
				timeover
					.to(this.mRocket, { angle: -15, duration: 0.2 })
					.to(this.mRocket, { angle: 15, duration: 0.2 })
					.to(this.mRocket, { angle: 0, duration: 0.2 });

				this.mTimeOver = gsap.delayedCall(1, async () => {
					await this.endGame(true);
				});
			});
	}

	// 로켓타임 멈추거나 재시작
	resumeRocketTime(flag: boolean) {
		if (flag) {
			if (gsap.getTweensOf(this.mRocket)[0])
				gsap.getTweensOf(this.mRocket)[0].resume();
			if (gsap.getTweensOf(this.mRocketMask)[0])
				gsap.getTweensOf(this.mRocketMask)[0].resume();
		} else {
			if (gsap.getTweensOf(this.mRocket)[0])
				gsap.getTweensOf(this.mRocket)[0].pause();
			if (gsap.getTweensOf(this.mRocketMask)[0])
				gsap.getTweensOf(this.mRocketMask)[0].pause();
		}
	}

	// -----------------------------------------------------------카드

	// 카드생성
	createExamCard(): Promise<void> {
		return new Promise<void>(resolve => {
			this.mExamAry = [];
			this.mCorrectCardAry = [];
			this.sortableChildren = true;
			const correctData = gameData[`day${config.subjectNum}`][`list`];
			const wrongData = gameData[`day${config.subjectNum}`][`wrong`];

			const a = [
				{ text: correctData[0], isCorrect: true },
				{ text: correctData[1], isCorrect: true },
				{ text: correctData[2], isCorrect: true },
				{ text: correctData[3], isCorrect: true },

				{ text: wrongData[0], isCorrect: false },
				{ text: wrongData[1], isCorrect: false },
				{ text: wrongData[2], isCorrect: false },
				{ text: wrongData[3], isCorrect: false },
			];

			const list = shuffleArray(a);
			for (let i = 0; i < list.length; i++) {
				const card = new ExamCard(i + 1, list[i], this.mVariationIdx);
				this.addChild(card);
				card.zIndex = 9 - i;
				card.position.set(config.width / 2, config.height / 2);
				this.mExamAry.push(card);
				list[i].isCorrect ? this.mCorrectCardAry.push(card) : null;
			}
			resolve();
		});
	}

	// 각 카드 위치 지정
	setCardPos(): Promise<void> {
		return new Promise<void>(resolve => {
			const cardX = [274, 520, 766, 1010];
			const cardY = [332 - 64, 570 - 64];

			let yIndex = 0;
			for (let i = 0; i < this.mExamAry.length; i++) {
				const box = this.mExamAry[i];
				i >= 4 ? (yIndex = 1) : null;
				gsap
					.to(box, {
						x: cardX[i % 4],
						y: cardY[yIndex],
						duration: 0.5,
					})
					.delay(i / 10)
					.eventCallback('onComplete', async () => {
						i == this.mExamAry.length - 1 ? resolve() : null;
					});
			}
		});
	}

	// 카드 클릭했을때,
	private async registCardEvent() {
		for (const box of this.mExamAry) {
			box.onPointerTap = async () => {
				if (this.mAfforSnd) {
					this.mAfforSnd.stop();
				}
				for (const card of this.mCorrectCardAry) {
					gsap.killTweensOf(card);
					card.angle = 0;
				}
				await this.resetAffor();
				this.cardInteraction(false);
				this.mSpeakerBtn.interact(false);

				// 카드 클릭하면 로켓 일시정지
				this.resumeRocketTime(false);

				if (box.isCorrect) {
					await box.correct();
					await this.nextStar();
				} else {
					this.shakeCorrectCard();
					await box.wrong();
				}

				await this.checkEndGame();
				this.cardInteraction(true);

				// 카드 클릭하면 로켓 재시작
				this.resumeRocketTime(true);

				// 4초 후에도 카드 클릭이 없으면 어포던스실행
				await this.registAffordance();
				this.mSpeakerBtn.interact(true);
			};
		}
	}

	// 모든 카드 활성화/ 비활성화
	cardInteraction(flag: boolean) {
		for (const card of this.mExamAry) {
			card.interactive = flag;
			card.buttonMode = flag;
		}
	}

	// 4초 주기로 아무 클릭없으면 정답 흔들림
	private async registAffordance() {
		await this.resetAffor();

		this.mAffordance = gsap.delayedCall(4, async () => {
			await this.afforFuction();
		});
	}

	// 어포던스가 실행될때 ,
	private async afforFuction(mode?: string) {
		this.mSpeakerBtn.interact(false);
		this.resumeRocketTime(false);
		await this.resetAffor();
		mode ? await this.speakerAffor(mode) : await this.speakerAffor();
		this.mSpeakerBtn.interact(true);

		if (this.mIsPlayingGuide) {
			return;
		}
		this.resumeRocketTime(true);
		await this.shakeCorrectCard();
		await this.registAffordance();
	}

	// 스피커 위에 손올려두고 사운드 재생
	speakerAffor(mode?: string): Promise<void> {
		return new Promise<void>(resolve => {
			// 클릭 어포던스 이미지 생성
			if (this.mAfforHand) {
				this.removeChild(this.mAfforHand);
				this.mAfforHand = null;
			}
			if (mode != 'click') {
				this.mAfforHand = new PIXI.Sprite(
					ResourceManager.Handle.getCommon('click.png').texture,
				);
				this.addChild(this.mAfforHand);
				this.mAfforHand.anchor.set(0.5);
				this.mAfforHand.position.set(this.mSpeakerBtn.x, this.mSpeakerBtn.y);
				gsap
					.to(this.mAfforHand.scale, {
						x: 0.8,
						y: 0.8,
						duration: 0.5,
						ease: Power0.easeNone,
					})
					.repeat(-1)
					.yoyo(true);
			}

			if (window['currentAlphabet']) {
				window['currentAlphabet'].play();
				gsap.delayedCall(window['currentAlphabet'].duration, () => {
					if (this.mAfforHand) {
						gsap.killTweensOf(this.mAfforHand);
						this.removeChild(this.mAfforHand);
						this.mAfforHand = null;
					}
					resolve();
				});
			} else {
				resolve();
			}
		});
	}

	// 4초주기로 정답카드를 흔들어 주는 모션 코드
	private shakeCorrectCard(): Promise<void> {
		return new Promise<void>(resolve => {
			for (const correct of this.mCorrectCardAry) {
				if (correct.state) {
					const timeline = gsap.timeline({});
					timeline
						.to(correct, { angle: 15, duration: 0.15 })
						.to(correct, { angle: -15, duration: 0.15 })
						.to(correct, { angle: 0, duration: 0.15 });
				}
			}
			let duration = 0.5;
			if (this.mAfforSnd) {
				this.mAfforSnd.play();
				duration = this.mAfforSnd.duration + 0.5;
			}
			gsap.delayedCall(duration, () => {
				resolve();
			});
		});
	}

	// 4초 이전에 클릭이 있으면 어포던스함수 초기화
	private async resetAffor() {
		this.mAffordance ? this.mAffordance.kill() : null;
		this.mAffordance = null;
		await this.resetCardMotion();
	}

	// 흔들리는 도중에 모션이 취소 됐을시, 카드각도 초기화
	private resetCardMotion(): Promise<void> {
		return new Promise<void>(resolve => {
			for (const card of this.mExamAry) {
				gsap.killTweensOf(card);
				card.angle = 0;
			}
			resolve();
		});
	}

	// 어포던스 종료 및 삭제
	private destroyAffor(): Promise<void> {
		return new Promise<void>(resolve => {
			if (this.mAffordance) {
				this.mAffordance.kill();
			}
			this.mAffordance = null;
			this.mAfforSnd = null;
			this.registAffordance = () => null;
			resolve();
		});
	}

	// -----------------------------------------------------------게임 진행함수

	// 카드 중에 정답카드 다 골랐는지 확인
	private checkBox(): Promise<void> {
		return new Promise<void>(resolve => {
			this.mEndGameFlag = true;
			for (const box of this.mExamAry) {
				if (box.isCorrect) this.mEndGameFlag = false;
			}
			resolve();
		});
	}

	// 4장의 카드를 다 맞추면 this.mEndGameFlag==true
	private async checkEndGame() {
		await this.checkBox();
		this.mEndGameFlag ? await this.endGame() : null;
	}

	async createTimeOverPop(): Promise<void> {
		return new Promise<void>(resolve => {
			const end = new PIXI.Container();
			end.zIndex = 20;
			this.addChild(end);

			this.mEndDimmed = new PIXI.Graphics();
			this.mEndDimmed.beginFill(0x000000, 1);
			this.mEndDimmed.drawRect(0, 0, Config.width, Config.height);
			this.mEndDimmed.endFill();
			this.mEndDimmed.alpha = 0;

			this.mEndDimmed.interactive = true;
			end.addChild(this.mEndDimmed);
			gsap.to(this.mEndDimmed, { alpha: 0.8, duration: 0.5 });
			const againImg = new PIXI.Sprite(
				ResourceManager.Handle.getCommon('again_img.png').texture,
			);
			againImg.anchor.set(0.5);
			againImg.position.set(Config.width / 2, Config.height / 2 - 64 - 30);
			againImg.alpha = 0;
			gsap.to(againImg, { alpha: 1, duration: 0.5 });
			gsap.to(againImg.scale, { x: 0, y: 0, duration: 0 }).delay(0.5);
			gsap.to(againImg.scale, { x: 1, y: 1, duration: 0.25 }).delay(0.5);

			const againBtn = new PIXI.Sprite(
				ResourceManager.Handle.getCommon('again_btn.png').texture,
			);
			againBtn.anchor.set(0.5);
			againBtn.position.set(Config.width / 2, Config.height / 2 + 180);

			end.addChild(againImg, againBtn);

			againBtn.interactive = true;
			againBtn.buttonMode = true;
			againBtn.once('pointertap', async () => {
				await this.deleteMemory();
				this.mEndDimmed = null;
				await this.onInit();
				await this.onStart();
				resolve();
			});
		});
	}

	//게임 끝
	async endGame(timeOver?: boolean) {
		await (this.parent.parent as Game).controller.outro();

		if (this.mTimeOver) {
			this.mTimeOver.kill();
			this.mTimeOver = null;
		}
		if (this.mEop) {
			return;
		}
		gsap.killTweensOf(this.mRocket);
		gsap.killTweensOf(this.mRocketMask);
		await this.destroyAffor();

		if (timeOver) {
			await this.createTimeOverPop();
		} else {
			await (this.parent.parent as Game).completedLabel();
			this.mEop = new Eop();
			this.mEop.zIndex = 20;
			this.addChild(this.mEop);
			await this.mEop.onInit();
			await this.mEop.start();
			await (this.parent.parent as Game).prevNextBtn.unLock();
		}
	}

	async deleteMemory() {
		if (this.mTimeOver) {
			this.mTimeOver.kill();
			this.mTimeOver = null;
		}
		gsap.killTweensOf(this.mRocket);
		gsap.killTweensOf(this.mRocketMask);
		await this.destroyAffor();

		if (window['ticker']) {
			gsap.ticker.remove(window['ticker']);
		}
		window['ticker'] = null;

		this.removeChildren();
		this.mExamAry = null;
		this.mCorrectCardAry = null;
		this.mEndGameFlag = null;
		this.mSpeakerBtn = null;

		this.mRocketStage = null;
		this.mRocket = null;
		this.mRocketMask = null;
		this.mEndDimmed = null;
		this.mModuleStep = null;
		this.mStarBar = null;
		this.mAffordance = null;
		this.mAfforSnd = null;
		this.mTimeOver = null;
		this.mVariationIdx = null;
		this.mCompleteFlag = null;
	}
}
