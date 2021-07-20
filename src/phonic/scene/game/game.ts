import * as PIXI from 'pixi.js';
import gsap, { Power0 } from 'gsap/all';
import { SceneBase } from '../../core/sceneBase';
import { GameModule } from './gameModule';
import { Game1 } from './gameModule1';
import { Game2 } from './gameModule2';
import { Btn } from '@/phonic/widget/btn';
import Config from '../../../com/util/Config';
import { ResourceManager } from '@/phonic/core/resourceManager';
import { Eop } from '@/phonic/widget/eop';
import { gameData } from '@/phonic/core/resource/product/gameData';
import { debugLine } from '@/phonic/utill/gameUtil';
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
				// 	(this.parent as Game).changeModule(step.idx);
				// };
			}

			this.pivot.set(this.width / 2, this.height / 2);
			resolve();
		});
	}

	// 진행바의 숫자를  클릭한 모듈의 step숫자로 변경
	async changeStep() {
		for (const step of this.mStepAry) {
			(this.parent as Game).currentGameIdx == step.idx
				? await step.interact(false)
				: await step.interact(true);
		}
	}
}

export class Game extends SceneBase {
	private mStage: PIXI.Container;

	private mGameModule: Array<GameModule>;
	private mCurrentGameIdx: number;
	set currentGameIdx(v: number) {
		this.mCurrentGameIdx = v;
	}
	get currentGameIdx(): number {
		return this.mCurrentGameIdx;
	}
	private mProgressBar: ProgressBar;

	private mClickEffect: PIXI.spine.Spine;

	constructor() {
		super('game');
	}
	async onInit() {
		Config.currentMode = 2;

		// if (window['Android']) {
		// 	window['Android'].showLoading();
		// } else {
		await PhonicsApp.Handle.loddingFlag(true);
		// }

		this.prevNextBtn.onClickPrev = async () => {
			await this.prevModule();
		};

		if (Config.isFreeStudy) {
			this.prevNextBtn.onClickNext = async () => {
				this.clickNext();
			};
		} else {
			this.prevNextBtn.onClickNext = async () => null;
		}

		this.resetBtn();

		const rscList = [
			...gameData[`day${Config.subjectNum}`].list,
			...gameData[`day${Config.subjectNum}`].wrong,
		];

		const images = [];
		for (const list of rscList) {
			images.push(`${list}.png`);
		}

		const soundList = gameData[`day${Config.subjectNum}`].list;
		const sound = [];
		for (const list of soundList) {
			sound.push(`${Config.subjectNum}_${list}.mp3`);
		}

		await ResourceManager.Handle.loadProductResource({ images: images });
		await ResourceManager.Handle.loadCommonResource({ sounds: sound });

		this.mCurrentGameIdx = 0;
		this.mGameModule = [];
		this.removeChildren();
		await this.createDimmed();
	}

	async onStart() {
		await this.createDimmed();
		// 게임 모듈이 들어갈 공간
		this.mStage = new PIXI.Container();
		this.mStage.y = 64;

		// 게임 모듈 진행순서 나타내는  진행바
		this.mProgressBar = new ProgressBar(2);
		this.mProgressBar.position.set(Config.width / 2, Config.height - 10);
		await this.mProgressBar.onInit();

		this.addChild(this.mStage, this.mProgressBar);

		this.mGameModule.push(new Game1());
		this.mGameModule.push(new Game2());

		await this.controller.reset();
		this.mStage.addChild(this.mGameModule[this.mCurrentGameIdx]);

		this.interactive = true;
		this.mClickEffect = new PIXI.spine.Spine(
			ResourceManager.Handle.getCommon('click_effect.json').spineData,
		);
		this.mClickEffect.visible = false;
		this.addChild(this.mClickEffect);
		let hideFuction = null;
		this.on('pointertap', (evt: PIXI.InteractionEvent) => {
			if (hideFuction) {
				hideFuction.kill();
				hideFuction = null;
			}
			this.mClickEffect.position.set(evt.data.global.x, evt.data.global.y);
			this.mClickEffect.visible = true;
			this.mClickEffect.state.setAnimation(0, 'animation', false);

			hideFuction = gsap.delayedCall(1, () => {
				this.mClickEffect.visible = false;
			});
		});

		await this.mGameModule[this.mCurrentGameIdx].onInit();
		await PhonicsApp.Handle.loddingFlag(false);
		// if (window['Android']) {
		// 	window['Android'].hideLoading();
		// } else {
		// }
		await this.mGameModule[this.mCurrentGameIdx].onStart();
	}

	async clickNext() {
		if (this.mGameModule[this.mCurrentGameIdx + 1]) {
			await this.nextModule();
			this.blintBtn(false);
		} else {
			this.mCurrentGameIdx = 1;
			await this.endGame();
		}
	}

	// 선택한 idx의 모듈로 이동
	async changeModule(idx: number) {
		if (!Config.isFreeStudy) {
			return;
		}
		await gsap.globalTimeline.clear();

		pixiSound.stopAll();
		await pixiSound.context.refresh();

		if (window['ticker']) {
			gsap.ticker.remove(window['ticker']);
		}
		this.mCurrentGameIdx = idx;
		if (this.mCurrentGameIdx >= 2) {
			await this.endGame();
			return;
		}
		this.mProgressBar.changeStep();
		this.mStage.removeChildren();
		this.mStage.addChild(this.mGameModule[this.mCurrentGameIdx]);
		await this.mGameModule[this.mCurrentGameIdx].onInit();
		await this.mGameModule[this.mCurrentGameIdx].onStart();
		PhonicsApp.Handle.controller.reset();
		console.log(idx);
	}

	// (다음모듈) or (다음게임) 으로 이동
	async nextModule() {
		if (!Config.isFreeStudy) {
			this.prevNextBtn.onClickNext = async () => null;
		}
		await gsap.globalTimeline.clear();
		if (window['ticker']) {
			gsap.ticker.remove(window['ticker']);
		}

		pixiSound.stopAll();
		await pixiSound.context.refresh();

		// await this.mGameModule[this.mCurrentGameIdx].endGame();
		await this.mGameModule[this.mCurrentGameIdx].deleteMemory();

		this.mCurrentGameIdx += 1;
		this.mProgressBar.changeStep();
		this.mStage.removeChildren();
		this.mStage.addChild(this.mGameModule[this.mCurrentGameIdx]);
		await this.mGameModule[this.mCurrentGameIdx].onInit();
		await this.mGameModule[this.mCurrentGameIdx].onStart();

		PhonicsApp.Handle.controller.reset();
	}

	// (이전모듈) or (이전게임) 으로 이동
	async prevModule() {
		await gsap.globalTimeline.clear();
		if (window['ticker']) gsap.ticker.remove(window['ticker']);
		this.mCurrentGameIdx -= 1;
		if (this.mCurrentGameIdx < 0) {
			this.mCurrentGameIdx = 0;
			await this.goScene('sound');
			return;
		}

		pixiSound.stopAll();
		await pixiSound.context.refresh();

		this.mProgressBar.changeStep();

		this.mStage.removeChildren();
		this.mStage.addChild(this.mGameModule[this.mCurrentGameIdx]);
		await this.mGameModule[this.mCurrentGameIdx].onInit();
		await this.mGameModule[this.mCurrentGameIdx].onStart();

		PhonicsApp.Handle.controller.reset();
	}

	// 게임 끝나고 outro 실행
	async endGame() {
		pixiSound.stopAll();
		await gsap.globalTimeline.clear();

		if (window['ticker']) {
			gsap.ticker.remove(window['ticker']);
		}
		window['ticker'] = null;

		await this.goScene('outro');
	}
}
