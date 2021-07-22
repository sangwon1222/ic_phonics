import * as PIXI from 'pixi.js';
import { SceneBase } from '../../core/sceneBase';
import { ResourceManager } from '@/phonic/core/resourceManager';
import gsap from 'gsap/all';
import { gameData } from '@/phonic/core/resource/product/gameData';
import Config from '@/com/util/Config';
import { Btn } from '@/phonic/widget/btn';
import { SoundModule } from './soundModule';
import { Sound1 } from './soundModule1';
import { Sound2 } from './soundModule2';
import { Eop } from '@/phonic/widget/eop';
import pixiSound from 'pixi-sound';
import { PhonicsApp } from '@/phonic/core/app';

// 씬 아래부분 숫자 scene index
export class ProgressBar extends PIXI.Container {
	private mStepAry: Array<Btn>;

	constructor(private mTotalStep: number) {
		super();
	}

	async onInit() {
		await this.createObject();
	}

	// 숫자 스텝 이미지를 만든다.
	createObject(): Promise<void> {
		return new Promise<void>(resolve => {
			this.mStepAry = [];

			let offsetX = 0;
			for (let i = 0; i < this.mTotalStep; i++) {
				const step = new Btn(
					`num${(i % 2) + 1}_off.png`,
					`num${(i % 2) + 1}_on.png`,
				);
				step.idx = i;
				i == 0 ? step.interact(false) : step.interact(true);
				this.addChild(step);
				this.mStepAry.push(step);

				step.x = offsetX + step.width / 2;

				offsetX += step.width + 20;

				// 스텝을 클릭했을때,
				// step.onPointerTap = async () => {
				// 	await (this.parent as Sound).changeModule(step.idx);
				// };
			}

			this.pivot.set(this.width / 2, this.height / 2);
			resolve();
		});
	}

	// 진행바의 숫자를  클릭한 모듈의 step숫자로 변경
	async changeStep() {
		for (const step of this.mStepAry) {
			(this.parent as Sound).currentGameIdx == step.idx
				? await step.interact(false)
				: await step.interact(true);
		}
	}

	async disableStep() {
		for (const step of this.mStepAry) {
			await step.interact(false);
		}
	}
}

export class Sound extends SceneBase {
	private mStage: PIXI.Container;

	private mSoundModule: Array<SoundModule>;
	private mCurrentGameIdx: number;
	set currentGameIdx(v: number) {
		this.mCurrentGameIdx = v;
	}
	get currentGameIdx(): number {
		return this.mCurrentGameIdx;
	}

	private mProgressBar: ProgressBar;

	private mEop: Eop;

	constructor() {
		super('sound');
	}
	async onInit() {
		await PhonicsApp.Handle.loddingFlag(true);

		/**
		 * 로딩시에 씬이동을 하면 버그에러가 생길 수 있어서
		 * 로딩 중에는 씬이동을 막아둔다.
		 */
		this.prevNextBtn.onClickPrev = async () => null;
		this.prevNextBtn.onClickNext = async () => null;

		Config.currentMode = 1;

		await this.resetBtn();

		if (window['ticker']) gsap.ticker.remove(window['ticker']);

		const title = gameData[`day${Config.subjectNum}`].title;
		await ResourceManager.Handle.loadCommonResource({
			images: [
				`title/${Config.subjectNum}_${title}.png`,
				`title/${Config.subjectNum}_${title}_bg.png`,
				`title/${Config.subjectNum}_${title}_line.png`,
			],
		});

		this.removeChildren();
		this.mEop = null;
		this.mCurrentGameIdx = 0;
		this.mSoundModule = [];

		if (!Config.isFreeStudy) {
			const completedData = this.controller.studyed[1].completed.module1;
			if (!completedData) {
				this.prevNextBtn.disableBtn('next');
			}
		}

		this.prevNextBtn.onClickPrev = async () => {
			if (!flag) return;
			await this.prevModule();
		};

		let flag = true;
		this.prevNextBtn.onClickNext = async () => {
			if (!flag) return;
			await this.clickNext();
			flag = true;
		};
	}

	//자유모드일때 / 학습모드일때, 분기쳐서 처리
	async clickNext() {
		//자유모드
		if (Config.isFreeStudy) {
			if (this.mSoundModule[this.mCurrentGameIdx + 1]) {
				await this.nextModule();
				this.blintBtn(false);
			} else {
				this.mCurrentGameIdx = 0;
				await this.goScene('game');
			}
		} else {
			//학습모드
			const data = this.controller.studyed[1];
			console.groupCollapsed(data.label);
			console.log(data.completed);
			console.groupEnd();

			if (this.mCurrentGameIdx == 0) {
				if (this.controller.studyed[1].completed.module1) {
					// await this.nextModule(true);
					await this.nextModule();
					// this.blintBtn(false);
				}
			} else {
				if (this.controller.studyed[1].completed.module2) {
					await this.goScene('game');
					this.mCurrentGameIdx = 0;
				}
			}
		}
	}

	async onStart() {
		this.removeChildren();
		await this.createDimmed();
		await this.createObject();

		// 게임 모듈 진행순서 나타내는  진행바
		this.mProgressBar = new ProgressBar(2);
		this.mProgressBar.position.set(Config.width / 2, Config.height - 10);
		await this.mProgressBar.onInit();

		this.addChild(this.mStage, this.mProgressBar);

		this.mSoundModule.push(new Sound1());
		this.mSoundModule.push(new Sound2());

		this.mStage.addChild(this.mSoundModule[this.mCurrentGameIdx]);

		await this.mSoundModule[this.mCurrentGameIdx].onInit();
		await PhonicsApp.Handle.loddingFlag(false);
		await this.mSoundModule[this.mCurrentGameIdx].onStart();
	}

	createObject(): Promise<void> {
		return new Promise<void>(resolve => {
			this.mStage = new PIXI.Container();
			this.addChild(this.mStage);
			this.mStage.y = 64;

			const bg = new PIXI.Sprite(
				ResourceManager.Handle.getCommon('sound1_bg.png').texture,
			);
			this.mStage.addChild(bg);
			resolve();
		});
	}

	// 선택한 idx의 모듈로 이동
	// async changeModule(idx: number) {
	// 	if (!Config.isFreeStudy) {
	// 		return;
	// 	}

	// 	pixiSound.stopAll();
	// 	await pixiSound.context.refresh();
	// 	await gsap.globalTimeline.clear();
	// 	await PhonicsApp.Handle.loddingFlag(true);

	// 	await this.mProgressBar.disableStep();
	// 	await PhonicsApp.Handle.controller.prevNextBtn.lock();

	// 	if (this.mEop) {
	// 		this.removeChild(this.mEop);
	// 		this.mEop = null;
	// 	}
	// 	this.mCurrentGameIdx = idx;
	// 	if (this.mCurrentGameIdx >= 2) {
	// 		await this.endGame();
	// 		return;
	// 	}
	// 	this.mStage.removeChildren();
	// 	this.mStage.addChild(this.mSoundModule[this.mCurrentGameIdx]);
	// 	await this.mProgressBar.changeStep();
	// 	await this.mSoundModule[this.mCurrentGameIdx].onInit();
	// 	await PhonicsApp.Handle.loddingFlag(false);
	// 	await this.mSoundModule[this.mCurrentGameIdx].onStart();

	// 	await PhonicsApp.Handle.controller.prevNextBtn.unLock();
	// }

	// (다음모듈) or (다음게임) 으로 이동
	async nextModule() {
		if (this.mEop) {
			this.removeChild(this.mEop);
			this.mEop = null;
		}
		if (window['ticker']) gsap.ticker.remove(window['ticker']);
		pixiSound.stopAll();
		await pixiSound.context.refresh();
		await gsap.globalTimeline.clear();

		await PhonicsApp.Handle.loddingFlag(true);
		await gsap.globalTimeline.clear();
		await this.mSoundModule[this.mCurrentGameIdx].deleteMemory();

		this.mCurrentGameIdx += 1;
		if (!this.mSoundModule[this.mCurrentGameIdx]) {
			this.mCurrentGameIdx = 0;
			await this.endGame();
			return;
		}
		await this.resetBtn();

		if (!Config.isFreeStudy) {
			const completedData = this.controller.studyed[1].completed.module2;
			if (!completedData) {
				this.prevNextBtn.disableBtn('next');
			}
		}
		this.mProgressBar.changeStep();
		this.mStage.removeChildren();
		this.mStage.addChild(this.mSoundModule[this.mCurrentGameIdx]);

		await this.mSoundModule[this.mCurrentGameIdx].onInit();
		await PhonicsApp.Handle.loddingFlag(false);
		await this.mSoundModule[this.mCurrentGameIdx].onStart();
	}

	// (이전모듈) or (이전게임) 으로 이동
	async prevModule() {
		if (this.mEop) {
			this.removeChild(this.mEop);
			this.mEop = null;
		}
		pixiSound.stopAll();
		await pixiSound.context.refresh();
		await gsap.globalTimeline.clear();

		await this.resetBtn();
		await PhonicsApp.Handle.loddingFlag(true);
		await gsap.globalTimeline.clear();
		if (window['ticker']) gsap.ticker.remove(window['ticker']);
		this.mCurrentGameIdx -= 1;
		if (this.mCurrentGameIdx < 0) {
			this.mCurrentGameIdx = 0;
			await this.goScene('chant');
			return;
		}

		if (!Config.isFreeStudy) {
			const completedData = this.controller.studyed[1].completed.module1;
			if (!completedData) {
				this.prevNextBtn.disableBtn('next');
			}
		}
		this.mProgressBar.changeStep();

		this.mStage.removeChildren();
		this.mStage.addChild(this.mSoundModule[this.mCurrentGameIdx]);

		await this.mSoundModule[this.mCurrentGameIdx].onInit();
		await PhonicsApp.Handle.loddingFlag(false);
		await this.mSoundModule[this.mCurrentGameIdx].onStart();
	}

	// 두번째 모듈 게임 끝났을 때.
	async endGame() {
		pixiSound.stopAll();
		await pixiSound.context.refresh();
		await gsap.globalTimeline.clear();

		if (window['ticker']) {
			gsap.ticker.remove(window['ticker']);
		}
		window['ticker'] = null;

		await this.completedLabel();
		this.blintBtn(true);
	}
}
