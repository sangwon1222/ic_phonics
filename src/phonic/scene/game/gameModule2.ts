import * as PIXI from 'pixi.js';
import { ResourceManager } from '@/phonic/core/resourceManager';
import gsap from 'gsap/all';
import { GameModule } from './gameModule';
import { gameData } from '@/phonic/core/resource/product/gameData';
import { shuffleArray } from '@/com/util/Util';
import { Game } from './game';
import Config from '@/com/util/Config';
import { isIOS } from '@/phonic/utill/gameUtil';
import { StarBar } from '@/phonic/widget/star';
import { Eop } from '@/phonic/widget/eop';
import pixiSound from 'pixi-sound';
import { PhonicsApp } from '@/phonic/core/app';

export class Bag extends PIXI.Sprite {
	private mQuizImg: PIXI.Sprite;
	get quizImg(): PIXI.Sprite {
		return this.mQuizImg;
	}

	private mCompleteText: PIXI.Text;
	get text(): string {
		return this.mText;
	}

	private mEndInteraction: boolean;

	// 가방이 활성화되는 공간에 있을때에 대한 플래그
	// ex> 오른쪽에서 나타날때 이미지가 안보이면 비활성화. => ableSpaceFlag=true
	// ex> 왼쪽으로 들어갈때 이미지가 안보이면 비활성화.=> ableSpaceFlag=true
	private mAbleSpaceFlag: boolean;
	get ableSpaceFlag() {
		return this.mAbleSpaceFlag;
	}
	set ableSpaceFlag(v: boolean) {
		this.mAbleSpaceFlag = v;
	}

	private quizTexture: string;
	private mText: string;
	private mVariationIdx: number;

	constructor(quizTexture: string, text: string, variationIdx: number) {
		super();
		this.quizTexture = quizTexture;
		this.mText = text;
		this.mVariationIdx = variationIdx;
		this.mAbleSpaceFlag = true;

		this.texture = ResourceManager.Handle.getCommon(
			`game2_carrier${this.mVariationIdx}.png`,
		).texture;
		this.mQuizImg = new PIXI.Sprite();
		this.mQuizImg.texture = ResourceManager.Handle.getProduct(
			quizTexture,
		).texture;
		this.mQuizImg.anchor.set(0.5);
		this.mQuizImg.position.set(6, 24);

		let font_size = 40;
		this.mText.length >= 7 ? (font_size = 40) : (font_size = 60);

		this.mCompleteText = new PIXI.Text(this.mText, {
			fill: 0x333333,
			fontSize: font_size,
			fontFamily: 'minigate Bold ver2',
			padding: 10,
		});

		this.addChild(this.mQuizImg, this.mCompleteText);

		this.mCompleteText.anchor.set(0.5, 0);
		this.mCompleteText.position.set(6, -6);
		this.mCompleteText.scale.x = 0;

		this.anchor.set(0.5);

		this.mEndInteraction = false;

		this.interactive = true;
		this.buttonMode = true;

		this.on('pointertap', () => {
			this.onPointertap();
		});
	}

	async reset(quizText: string) {
		gsap.killTweensOf(this.mQuizImg);
		gsap.killTweensOf(this.mQuizImg.scale);

		this.mCompleteText.text = quizText;
		quizText.length >= 7
			? (this.mCompleteText.style.fontSize = 40)
			: (this.mCompleteText.style.fontSize = 60);
		this.mCompleteText.anchor.set(0.5, 0);
		this.mCompleteText.scale.x = 0;

		this.mEndInteraction = false;
		this.tint = 0xffffff;
		this.mQuizImg.tint = 0xffffff;
		await this.showQuizImg(false);
		this.mQuizImg.texture = ResourceManager.Handle.getProduct(
			`${quizText}.png`,
		).texture;

		this.mText = quizText;

		await this.showQuizImg(true);
		this.mQuizImg.scale.set(1, 1);
		this.mQuizImg.angle = 0;

		this.interactive = true;
		this.buttonMode = true;

		//클릭 가능 반경 밖이면 비활성화
		if (this.x < 76 || this.x > 1134) {
			this.ableSpaceFlag = false;
			this.disable();
		}
	}

	// 가방속 퀴즈이미지가 360도 돌면서 사라지고 나타난다.
	private showQuizImg(flag: boolean): Promise<void> {
		return new Promise<void>(resolve => {
			if (flag) {
				gsap.to(this.mQuizImg, { angle: 0, duration: 0.5 });
				gsap
					.to(this.mQuizImg.scale, { x: 1, y: 1, duration: 0.5 })
					.eventCallback('onComplete', () => {
						this.interactive = true;

						resolve();
					});
			} else {
				this.interactive = false;
				gsap.to(this.mQuizImg, { angle: 360, duration: 0.5 });
				gsap
					.to(this.mQuizImg.scale, { x: 0, y: 0, duration: 0.5 })
					.eventCallback('onComplete', () => {
						resolve();
					});
			}
		});
	}

	onPointertap() {
		//
	}

	waitingInteractive(flag: boolean) {
		if (!this.mEndInteraction) {
			this.interactive = flag;
			this.buttonMode = flag;
		}
	}

	correctMotion(): Promise<void> {
		return new Promise<void>(resolve => {
			let snd = ResourceManager.Handle.getCommon(
				`${Config.subjectNum}_${this.mText}.mp3`,
			).sound;

			gsap
				.to(this.scale, { x: 1.1, y: 1.1, duration: 0.25 })
				.repeat(3)
				.yoyo(true)
				.eventCallback('onComplete', () => {
					snd.play();
					gsap
						.to(this.mQuizImg.scale, {
							x: 0,
							duration: snd.duration / 4,
						})
						.eventCallback('onComplete', () => {
							gsap.to(this.mCompleteText.scale, {
								x: 1,
								duration: snd.duration / 4,
							});
						});
					gsap.delayedCall(snd.duration, () => {
						snd = null;
						resolve();
					});
				});
		});
	}

	wrongMotion(): Promise<void> {
		return new Promise<void>(resolve => {
			ResourceManager.Handle.getCommon('phonics_wrong.mp3').sound.play();
			this.tint = 0x6c6c6c;
			this.mQuizImg.tint = 0x6c6c6c;

			// console.log(this.mVariationIdx);
			// if (this.mVariationIdx == 2) {
			gsap
				.to(this, { y: this.y + 10, duration: 0.25 })
				.repeat(3)
				.yoyo(true);
			// }

			gsap
				.to(this.scale, { x: 0.9, y: 0.9, duration: 0.25 })
				.repeat(3)
				.yoyo(true)
				.eventCallback('onComplete', () => {
					gsap.delayedCall(0.25, () => {
						this.tint = 0xffffff;
						this.mQuizImg.tint = 0xffffff;
						resolve();
					});
				});
		});
	}

	disable() {
		this.tint = 0x6c6c6c;
		this.mQuizImg.tint = 0x6c6c6c;
	}
	able() {
		this.tint = 0xffffff;
		this.mQuizImg.tint = 0xffffff;
	}
}

export class Game2 extends GameModule {
	private mConveyor: PIXI.Container;
	private mLineAry: Array<PIXI.Sprite>;
	private mBagAry: Array<Bag>;
	private mQuizBoard: PIXI.Sprite;
	private mQuizBoardText: PIXI.Text;

	private mQuizData: Array<string>;

	// module2 안의 4스텝(star)을 풀어야 outro로 이동
	private mModuleStep: number;
	private mStarBar: StarBar;

	private mSpeed: number;

	private mEop: Eop;

	private mVariationIdx: number;

	constructor() {
		super('game2');
	}

	async onInit() {
		this.removeChildren();
		!isIOS() ? (window['bgm'].volume = 1) : null;
		Config.currentMode = 2;
		Config.currentIdx = 1;

		const variationCount = 3;
		this.mVariationIdx = Math.ceil(Math.random() * variationCount);

		console.groupCollapsed(`[ ${this.moduleName} ] 베리에이션 인덱스 `);
		console.log(
			`[%c now: ${this.mVariationIdx}`,
			'color: red; font-weight:800;',
			`]/ total: ${variationCount} `,
		);
		console.groupEnd();

		await pixiSound.resumeAll();
		if (window['ticker']) gsap.ticker.remove(window['ticker']);
		this.removeChildren();
		this.mEop = null;
		this.mStarBar = null;
		this.mConveyor = null;
		this.mQuizData = [];
		this.mBagAry = [];
		this.mModuleStep = 0;
		this.mSpeed = 0;

		const bg = new PIXI.Sprite(
			ResourceManager.Handle.getCommon(
				`game2_bg${this.mVariationIdx}.png`,
			).texture,
		);
		this.addChild(bg);
		this.sortableChildren = true;
	}

	async onStart() {
		await PhonicsApp.Handle.controller.settingGuideSnd('guide/game_2.mp3');

		await this.createConveyor();
		await this.createBag();
		await this.createStar();
		await this.createQuizBoard();

		await PhonicsApp.Handle.controller.startGuide();
		await this.boardShow(true);
		await this.startGameEvent();

		/**
		 * test
		 * 박스 아래 컨베이어 다리부분을 클릭한 상태로 왼쪽으로 드래그하면
		 * 컨베이어 속도가 빨라진다.
		 * 버그 체크할 때, 주석 풀면 작동합니다.
		 * */
		// let clickFlag = false;
		// let initX = 0;
		// const fastBtn = new PIXI.Graphics();
		// fastBtn.beginFill(0x00ff00, 1);
		// fastBtn.drawRect(this.mConveyor.x, this.mConveyor.y, Config.width, 100);
		// fastBtn.endFill();
		// fastBtn.alpha = 0;
		// fastBtn.interactive = true;
		// this.addChild(fastBtn);
		// fastBtn.interactive = true;
		// fastBtn
		// 	.on('pointerdown', (evt: PIXI.InteractionEvent) => {
		// 		clickFlag = true;
		// 		initX = evt.data.global.x;
		// 	})
		// 	.on('pointermove', (evt: PIXI.InteractionEvent) => {
		// 		if (!clickFlag) {
		// 			return;
		// 		}
		//  	const permittedRange = 300
		// 		const current = evt.data.global.x;
		// 		Math.abs(current - initX) > permittedRange
		// 			? (this.mSpeed = 20)
		// 			: (this.mSpeed = 1);
		// 	})
		// 	.on('pointerup', () => {
		// 		clickFlag = false;
		// 		this.mSpeed = 1;
		// 	})
		// 	.on('pointerout', () => {
		// 		clickFlag = false;
		// 		this.mSpeed = 1;
		// 	});

		/**test */
	} //==================컨베이어==================================

	// 컨베이어 생성 및 모션(ticker)생성
	private createConveyor(): Promise<void> {
		return new Promise<void>(resolve => {
			// 컨베이어 & 마스크 생성
			this.mConveyor = new PIXI.Container();
			this.mLineAry = [];

			for (let i = 0; i < 2; i++) {
				const conveyorLine = new PIXI.Sprite(
					ResourceManager.Handle.getCommon(
						`game2_conveyor_line${this.mVariationIdx}.png`,
					).texture,
				);
				this.mConveyor.addChild(conveyorLine);
				conveyorLine.x = i * (conveyorLine.width + 60);
				this.mLineAry.push(conveyorLine);
			}

			// this.mConveyor.mask = mask;
			this.mConveyor.pivot.set(0, this.mConveyor.height / 2);
			this.mConveyor.position.set(30, 494);

			// 컨베이어 발
			const foot = new PIXI.Sprite(
				ResourceManager.Handle.getCommon(
					`game2_front_support${this.mVariationIdx}.png`,
				).texture,
			);
			foot.position.set(90, 508);

			// 컨베이어 출구
			const door = new PIXI.Sprite(
				ResourceManager.Handle.getCommon(
					`game2_trick${this.mVariationIdx}.png`,
				).texture,
			);
			door.interactive = true;
			door.position.set(0, 260);

			this.sortableChildren = true;
			door.zIndex = 3;

			this.addChild(this.mConveyor, foot, door);
			this.mSpeed = 1;
			window['ticker'] = () => {
				{
					// ==========컨베이어 바닥 모션 이미지 이동==========
					this.mLineAry[0].x < -1200
						? (this.mLineAry[0].x =
								this.mLineAry[1].x + this.mLineAry[1].width + 60)
						: (this.mLineAry[0].x -= this.mSpeed);

					this.mLineAry[1].x < -1200
						? (this.mLineAry[1].x =
								this.mLineAry[0].x + this.mLineAry[0].width + 60)
						: (this.mLineAry[1].x -= this.mSpeed);
					// ==========컨베이어 바닥 모션 이미지 이동==========

					// ==========가방 이동 ↙
					for (const bag of this.mBagAry) {
						// ==========컨베이어 출구로 나가면 다시 오른쪽에서 시작하도록==========
						if (bag.x <= -90) {
							bag.x = Config.width + bag.width / 2;
						} else {
							bag.x -= this.mSpeed;
						}

						// 클릭 가능 반경 밖이면 딤드
						if (bag.x < 76 || bag.x > 1134) {
							if (bag.ableSpaceFlag) {
								bag.ableSpaceFlag = false;
								bag.disable();
							}
						} else {
							if (!bag.ableSpaceFlag) {
								bag.ableSpaceFlag = true;
								bag.able();
							}
						}
					}
					// ==========컨베이어 출구로 나가면 다시 오른쪽에서 시작하도록==========
				}
			};

			// 컨베이어 가동 모션
			gsap.ticker.add(window['ticker']);
			resolve();
		});
	}

	//==================가방 (정오답 함수)==================================
	private createBag(): Promise<void> {
		return new Promise<void>(resolve => {
			const bagCount = 4;

			const data = gameData[`day${Config.subjectNum}`][`list`];

			this.mQuizData = shuffleArray(data.slice(0));
			const randomBagText = shuffleArray(data.slice(0));

			// let offsetX = Config.width;
			let offsetX = 160;
			for (let i = 0; i < bagCount; i++) {
				const bag = new Bag(
					`${randomBagText[i % 4]}.png`,
					randomBagText[i % 4],
					this.mVariationIdx,
				);

				this.mBagAry.push(bag);
				this.addChild(bag);
				bag.zIndex = 2;

				bag.position.set(offsetX, 400);
				offsetX += bag.width + 100;
			}
			resolve();
		});
	}

	async correct() {
		const data = shuffleArray(this.mQuizData.slice(0));

		for (let i = 0; i < this.mBagAry.length; i++) {
			this.mBagAry[i].reset(data[i]);
		}
		await this.next();
	}

	waitingInteractive(flag: boolean): Promise<void> {
		return new Promise<void>(resolve => {
			for (const bag of this.mBagAry) {
				bag.waitingInteractive(flag);
			}
			resolve();
		});
	}

	//==================진행바(별스텝)==================================
	// 진행바(별스텝) 생성
	async createStar() {
		this.mStarBar = new StarBar(4);
		this.mStarBar.position.set(Config.width - 30, 30);
		await this.mStarBar.onInit();
		this.addChild(this.mStarBar);
	}

	//==================퀴즈보드==================================
	// 퀴즈보드 , 텍스트 생성
	createQuizBoard(): Promise<void> {
		return new Promise<void>(resolve => {
			window['txt_snd'] = ResourceManager.Handle.getCommon(
				`${Config.subjectNum}_${this.mQuizData[this.mModuleStep]}.mp3`,
			).sound;

			this.mQuizBoard = new PIXI.Sprite(
				ResourceManager.Handle.getCommon(
					`game2_board${this.mVariationIdx}.png`,
				).texture,
			);
			this.mQuizBoard.anchor.set(0.5);
			this.mQuizBoard.position.set(Config.width / 2, -this.mQuizBoard.height);
			this.addChild(this.mQuizBoard);

			this.mQuizBoardText = new PIXI.Text(
				`${this.mQuizData[this.mModuleStep]}`,
				{
					fill: 0x333333,
					fontSize: 60,
					fontFamily: 'minigate Bold ver2',
					padding: 10,
				},
			);
			this.mQuizBoardText.roundPixels = true;
			this.mQuizBoardText.pivot.set(
				this.mQuizBoardText.width / 2,
				this.mQuizBoardText.height / 2,
			);
			this.mQuizBoardText.x = -10;
			this.mQuizBoard.addChild(this.mQuizBoardText);

			this.mQuizBoard.interactive = true;
			this.mQuizBoard.buttonMode = true;
			this.mQuizBoard.on('pointertap', () => {
				if (window['txt_snd']) {
					window['txt_snd'].pause();
					window['txt_snd'].play();
				}
			});
			resolve();
		});
	}

	boardShow(flag: boolean): Promise<void> {
		return new Promise<void>(resolve => {
			if (flag) {
				gsap
					.to(this.mQuizBoard, {
						y: this.mQuizBoard.height / 2,
						duration: 0.5,
						ease: 'bounce',
					})
					.eventCallback('onComplete', () => {
						if (window['txt_snd']) {
							window['txt_snd'].play();
						}
						resolve();
					});
			} else {
				gsap
					.to(this.mQuizBoard, {
						y: -this.mQuizBoard.height,
						duration: 0.5,
					})
					.eventCallback('onComplete', () => {
						resolve();
					});
			}
		});
	}

	private startGameEvent(): Promise<void> {
		return new Promise<void>(resolve => {
			for (const bag of this.mBagAry) {
				bag.onPointertap = async () => {
					if (!bag.ableSpaceFlag) {
						return;
					}
					await this.waitingInteractive(false);
					this.mSpeed = 0;
					if (this.mQuizData[this.mModuleStep] == bag.text) {
						await bag.correctMotion();
						await this.correct();
					} else {
						await bag.wrongMotion();
					}
					this.mSpeed = 1;
					await this.waitingInteractive(true);
				};
				resolve();
			}
		});
	}

	//==================다음 퀴즈==================================
	async next() {
		this.mStarBar.onStar(this.mModuleStep);
		this.mModuleStep += 1;

		await this.boardShow(false);
		if (this.mQuizData[this.mModuleStep]) {
			window['txt_snd'] = ResourceManager.Handle.getCommon(
				`${Config.subjectNum}_${this.mQuizData[this.mModuleStep]}.mp3`,
			).sound;
			this.mQuizBoardText.text = this.mQuizData[this.mModuleStep];
			this.mQuizBoardText.pivot.set(
				this.mQuizBoardText.width / 2,
				this.mQuizBoardText.height / 2,
			);
			await this.boardShow(true);
		} else {
			await this.endGame();
		}
	}

	async endGame() {
		if (this.mEop) {
			return;
		}
		gsap.ticker.remove(window['ticker']);
		await this.endMotion();
		await (this.parent.parent as Game).endGame();
	}

	async endMotion() {
		for (let i = 0; i < this.mBagAry.length; i++) {
			gsap.to(this.mBagAry[i], { x: -300, duration: 0.5 });
		}
		(this.parent.parent as Game).controller.outro();
		this.mEop = new Eop();
		this.mEop.zIndex = 20;
		this.addChild(this.mEop);
		await this.mEop.onInit();
		await this.mEop.start();
	}

	async deleteMemory() {
		if (window['ticker']) {
			gsap.ticker.remove(window['ticker']);
		}
		window['ticker'] = null;

		this.removeChildren();
		this.mConveyor = null;
		this.mLineAry = null;
		this.mBagAry = null;
		this.mQuizBoard = null;
		this.mQuizBoardText = null;
		this.mQuizData = null;
		this.mModuleStep = null;
		this.mStarBar = null;
		this.mSpeed = null;
		this.mEop = null;
		this.mVariationIdx = null;
	}
}
