import * as PIXI from 'pixi.js';
import { ObjectBase } from '../core/ObjectBase';
import Config from '../util/Config';
import * as Util from '../util/Util';
import { Timer } from './Timer';

export class LoadingBar extends ObjectBase {
	private mLoaderName: string;
	private mSheet: PIXI.Spritesheet;
	private mLoadBg: PIXI.Sprite;
	private mLoadLoop: PIXI.AnimatedSprite;
	private mRandomAry: Array<number>;
	private mBgNumAry: Array<number>;
	private mLoader: PIXI.Loader;
	private mTimeOutHnd: Timer;

	constructor() {
		super();

		this.mBgNumAry = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
	}

	async load() {
		this.mLoaderName = `loadingbar0${Math.floor(Math.random() * 5 + 1)}.json`;
		this.mLoader = new PIXI.Loader();
		this.mLoader.reset();
		await this.mLoader
			.add(
				'loading',
				`${Config.restAPIProd}ps_${Config.appName}/viewer/common/spines/${this.mLoaderName}`,
			)
			.load((loader, resources) => {
				this.create();
			});
	}

	private create() {
		// console.log(this.mLoaderName);
		// console.log(
		// 	`${Config.restAPIProd}ps_${Config.appName}/viewer/common/spines/${this.mLoaderName}`,
		// );
		this.mLoader.resources[`loading`]
			? (this.mSheet = this.mLoader.resources[`loading`].spritesheet)
			: null;

		this.resetBgAry();

		// this.mSheet = await PIXI.Loader.shared.resources[
		// 	`${Config.restAPIProd}ps_${Config.appName}/viewer/common/spines/${this.mLoaderName}`
		// ].spritesheet;
		this.mLoadBg = new PIXI.Sprite(
			this.mSheet.textures[`loading_0${this.mRandomAry[0]}.png`],
		);
		this.mLoadBg.anchor.set(0.5);
		this.mLoadBg.position.set(Config.width / 2, 377.5);
		this.addChild(this.mLoadBg);

		this.mLoadLoop = new PIXI.AnimatedSprite(
			this.mSheet.animations['loadingLoopAni'],
		);
		this.mLoadLoop.animationSpeed = 0.5;
		this.mLoadLoop.play();
		this.mLoadLoop.anchor.set(0.5);
		this.mLoadLoop.position.set(Config.width / 2, 433.5);
		this.addChild(this.mLoadLoop);

		this.mRandomAry.splice(0, 1);
		this.startTimeOut();
	}

	private startTimeOut() {
		if (this.mTimeOutHnd !== null) {
			this.mTimeOutHnd?.clear();
			this.mTimeOutHnd?.destroy();
			this.mTimeOutHnd = null;
		}

		this.mTimeOutHnd = new Timer(() => {
			this.changeBg();
		}, 1000 * 4);
	}

	private resetBgAry() {
		this.mRandomAry = [...this.mBgNumAry];
		this.mRandomAry = Util.shuffleArray(this.mRandomAry);
	}

	private changeBg() {
		this.mLoadBg.texture = this.mSheet.textures[
			`loading_0${this.mRandomAry[0]}.png`
		];

		if (this.mRandomAry.length <= 1) this.resetBgAry();

		this.mRandomAry.splice(0, 1);

		this.startTimeOut();
	}

	remove() {
		this.mLoader.destroy();
		this.mLoader = null;
	}
}
