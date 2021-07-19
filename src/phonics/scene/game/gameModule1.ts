import * as PIXI from 'pixi.js';
import config from '@/com/util/Config';
import { ResourceManager } from '@/phonics/core/resourceManager';
import gsap, { Power0 } from 'gsap/all';
import { GameModule } from './gameModule';
import { gameData } from '@/phonics/core/resource/product/gameData';
import { shuffleArray } from '@/com/util/Util';
import { Game } from './game';
import { Btn } from '@/phonics/widget/btn';
import { debugLine } from '@/phonics/utill/gameUtil';
import Config from '@/com/util/Config';
import { Star, StarBar } from '@/phonics/widget/star';
import pixiSound from 'pixi-sound';
import { Eop } from '@/phonics/widget/eop';

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

	constructor(
		private mIdx: number,
		private mQuizText: { text: string; isCorrect: boolean },
		private mVariationIdx: number,
	) {
		super();
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
			ResourceManager.Handle.getCommon(
				`${Config.subjectNum}_${this.mQuizText.text}.mp3`,
			).sound.play();
			this.mState = false;

			this.mQuizText.isCorrect = false;
			const duration = 0.25;
			gsap
				.to(this.scale, { x: 0, duration: duration })
				.eventCallback('onComplete', () => {
					this.removeChildren();
					this.addChild(this.mPixiText);
					this.texture = this.mCorrectTexture;
					gsap
						.to(this.scale, { x: 1, duration: duration })
						.delay(duration)
						.eventCallback('onComplete', () => {
							resolve();
						});
				});
		});
	}

	// 오답일때 모션
	wrong(): Promise<void> {
		return new Promise<void>(resolve => {
			ResourceManager.Handle.getCommon('game_wrong.mp3').sound.play();
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

	// 클릭했을때, overwhite
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

	// 시간초과 함수
	private mTimeOver: any;

	private mVariationIdx: number;

	private mCompleteFlag: boolean;
	get completeFlag(): boolean {
		return this.mCompleteFlag;
	}

	private mEop: Eop;

	constructor() {
		super('game1');
	}

	async onInit() {
		(this.parent.parent as Game).controller.reset();
		this.mCompleteFlag = false;
		Config.currentMode = 2;
		Config.currentIdx = 0;
		await pixiSound.resumeAll();

		this.mVariationIdx = Math.ceil(Math.random() * 3);
		console.log(
			`%c GAME1 => ${this.mVariationIdx}번째 베리에이션`,
			'border:2px red solid;',
		);

		const images = [];
		for (let i = 1; i <= 8; i++) {
			const file = `game1_ex${this.mVariationIdx}_answer_box_${i}.png`;
			images.push(file);
		}
		for (let i = 1; i <= 8; i++) {
			const file = `game1_ex${this.mVariationIdx}_box_${i}.png`;
			images.push(file);
		}

		images.push(`game1_bg${this.mVariationIdx}.png`);
		images.push(`game1_gauge${this.mVariationIdx}_ship.png`);

		await ResourceManager.Handle.loadCommonResource({ images: images });
		if (this.mAffordance) {
			this.mAffordance.kill();
		}
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

		const bg = new PIXI.Sprite(
			ResourceManager.Handle.getCommon(
				`game1_bg${this.mVariationIdx}.png`,
			).texture,
		);
		this.addChild(bg);
	}

	async onStart() {
		this.mSpeakerBtn = new Btn('speacker_btn_on.png', 'speacker_btn_off.png');
		this.mSpeakerBtn.position.set(config.width / 2, 80);

		const snd = ResourceManager.Handle.getCommon(
			`title/${gameData[`day${Config.subjectNum}`].title}.mp3`,
		).sound;

		this.mSpeakerBtn.onPointerTap = async () => {
			this.mSpeakerBtn.interact(false);
			snd.play();
			gsap.delayedCall(snd.duration, () => {
				this.mSpeakerBtn.interact(true);
			});
		};
		this.addChild(this.mSpeakerBtn);

		// 카드생성
		await this.createExamCard();
		// 각 카드 위치 지정
		await this.setCardPos();
		// 카드 클릭했을때,
		await this.registCardEvent();
		// 스텝(별) 생성
		await this.createStar();

		// 로켓 생성 및 시간설정
		await this.createRocket();
		await this.cardInteraction(true);
		this.startRocket();

		this.affordanceCorrect();
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
	nextStar() {
		this.mStarBar.onStar(this.mModuleStep);
		this.mModuleStep += 1;
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
				.to(this.mRocketStage, { alpha: 1, duration: 0.25 })
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
				const timeover = gsap.timeline({ repeat: 3, ease: Power0.easeNone });
				timeover.to(this.mRocket, { angle: -15, duration: 0.2 });
				timeover.to(this.mRocket, { angle: 15, duration: 0.2 });
				timeover.to(this.mRocket, { angle: 0, duration: 0.2 });

				// gsap.to(this.mRocket, { angle: -10, duration: 0.25 });
				// gsap.to(this.mRocket, { angle: 10, duration: 0.25 }).delay(0.25);
				// gsap.to(this.mRocket, { angle: 0, duration: 0.25 }).delay(0.5);

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
				const total = this.mExamAry.length;
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
				// 4초 후에도 카드 클릭이 없으면 어포던스실행
				this.affordanceCorrect();

				// 카드 클릭하면 로켓 일시정지
				this.resumeRocketTime(false);

				this.cardInteraction(false);

				if (box.isCorrect) {
					this.nextStar();
					await box.correct();
				} else {
					this.shakeCorrectCard();
					await box.wrong();
				}

				await this.checkEndGame();

				this.cardInteraction(true);

				// 카드 클릭하면 로켓 재시작
				this.resumeRocketTime(true);
			};
		}
	}

	// 모든 카드 활성화/ 비활성화
	cardInteraction(flag: boolean) {
		for (const card of this.mExamAry) {
			// if (card.state) {
			card.interactive = flag;
			card.buttonMode = flag;
			// } else {
			// 	card.interactive = false;
			// 	card.buttonMode = false;
			// }
		}
	}

	// -----------------------------------------------------------어포던스
	private shakeCorrectCard(): Promise<void> {
		return new Promise<void>(resolve => {
			for (const correct of this.mCorrectCardAry) {
				if (correct.state) {
					const timeline = gsap.timeline({});
					timeline.to(correct, { angle: 15, duration: 0.15 });
					timeline.to(correct, { angle: -15, duration: 0.15 });
					timeline.to(correct, { angle: 0, duration: 0.15 });
				}
			}
			gsap.delayedCall(0.5, () => {
				resolve();
			});
		});
	}

	// 4초 주기로 아무 클릭없으면 정답 흔들림
	private async affordanceCorrect() {
		await this.resetAffor();

		this.mAffordance = gsap.delayedCall(4, async () => {
			this.mAfforSnd.play();
			await this.shakeCorrectCard();
			this.affordanceCorrect();
		});
	}

	private async resetAffor() {
		if (this.mAffordance) {
			this.mAffordance.kill();
		}
		this.mAffordance = null;
		await this.resetCardMotion();
	}

	private resetCardMotion() {
		for (const correct of this.mCorrectCardAry) {
			gsap.killTweensOf(correct);
			correct.angle = 0;
		}
	}

	private destroyAffor(): Promise<void> {
		return new Promise<void>(resolve => {
			if (this.mAffordance) {
				this.mAffordance.kill();
			}
			this.mAffordance = null;
			this.mAfforSnd = null;
			this.affordanceCorrect = () => null;
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

	async createTimeOverPop() {
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
			this.mEndDimmed = null;
			await this.onInit();
			await this.onStart();
		});
	}

	//게임 끝
	async endGame(timeOver?: boolean) {
		(this.parent.parent as Game).controller.outro();

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
			if (!Config.isFreeStudy) {
				(this.parent.parent as Game).prevNextBtn.onClickNext = async () => {
					(this.parent.parent as Game).clickNext();
				};
			}
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
	}
}