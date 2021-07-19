// Pixi Module
import * as PIXI from 'pixi.js';
import pixiSound from 'pixi-sound';
// Link Module
import Config from '../util/Config';
import * as Util from '../util/Util';

export interface SoundObj {
	key: string;
	autoPlay: boolean;
	loop: boolean;
	duration: number;
	isPlaying: boolean;
	playFlag: boolean;
	loadedFlag: boolean;
}

export enum Rsc {
	product = 'lesson',
	viewer = 'viewer',
}

interface bgmSoundObj {
	category: string;
	fileName: string;
}

export class SoundManager {
	//-----------------------------------
	// singleton
	private static _handle: SoundManager;
	static get Handle(): SoundManager {
		if (SoundManager._handle === undefined) {
			SoundManager._handle = new SoundManager();
		}
		return SoundManager._handle;
	}
	//-----------------------------------

	private mURLRoot = Config.restAPIProd;
	private mNameAry: Array<string>;
	private mSndInsAry: { [name: string]: any };
	private mSndObjAry: Array<SoundObj>;
	private mLoader: PIXI.Loader;
	private mBgmSnd: bgmSoundObj;
	private mBgmMute: boolean;

	constructor() {
		this.mNameAry = [];
		this.mSndInsAry = {};
		this.mSndObjAry = [];
		this.mBgmSnd = { category: '', fileName: '' };
		this.mBgmMute = false;
	}

	// 사운드정보 가져오기를 나타낸다.
	getSound(tCategory: string, tFileName: string): pixiSound.Sound {
		this.mSndInsAry[`${tCategory.toLowerCase()}:${tFileName}`].muted = false;
		return this.mSndInsAry[`${tCategory.toLowerCase()}:${tFileName}`];
	}

	// 배경 사운드 리스트 프리로딩을 나타낸다.
	loadPreSounds(tFileUrlAry: Array<Array<string> | boolean>) {
		for (const tVal of tFileUrlAry) {
			// console.log(tVal[0], tVal[1], tVal[2], tVal[3], tVal[4]);

			if (tVal == null || tVal == undefined) continue;
			if (tVal[0] == null || tVal[0] == undefined) continue;
			if (tVal[1] == null || tVal[1] == undefined) continue;
			if (tVal[2] == null || tVal[2] == undefined) continue;
			let tLoop = false;
			if (tVal[3] != null && tVal[3] != undefined) {
				tLoop = tVal[3];
			}
			let tAutoPlay = false;
			if (tVal[4] != null && tVal[4] != undefined) {
				tAutoPlay = tVal[4];
				this.mBgmSnd.category = tVal[1];
				this.mBgmSnd.fileName = tVal[2];
			}

			if (tVal[0] == Rsc.product)
				tVal[0] = `ps_${Config.appName}_${Util.addZero(Config.subjectNum, 2)}`;

			const tKey = `${tVal[1].toLowerCase()}:${tVal[2]}`;
			const tFullPath = `${this.mURLRoot}ps_${Config.appName}/${tVal[0]}/${tVal[1]}/sounds/${tVal[2]}`;
			const tFindSnd = this.mSndInsAry[tKey];

			if (tVal[2] === 'intro_bgm.mp3' && tAutoPlay) this.mBgmMute = false;
			if (tFindSnd !== undefined) {
				const tIdx = Object.entries(this.mSndInsAry).findIndex(
					e => e[0] == tKey,
				);
				tFindSnd.muted = this.mBgmMute;
				if (tAutoPlay) tFindSnd.play();
				// resolve();
			} else {
				this.mSndInsAry[tKey] = pixiSound.Sound.from({
					url: tFullPath,
					preload: true,
					singleInstance: true,
					loop: tLoop,
					autoPlay: tAutoPlay,
					loaded: (err, sound) => {
						const tIdx = Object.entries(this.mSndInsAry).findIndex(
							e => e[0] == tKey,
						);
						this.mSndObjAry[tIdx].loadedFlag = true;
						this.mSndObjAry[tIdx].duration = sound.duration;
						this.mSndObjAry[tIdx].loop = tLoop;
						this.mSndObjAry[tIdx].autoPlay = tAutoPlay;
						sound.muted = this.mBgmMute;
						if (this.mSndObjAry[tIdx].playFlag) {
							sound.play();
						}
					},
				});

				const tIdx = Object.entries(this.mSndInsAry).findIndex(
					e => e[0] == tKey,
				);

				const tSndObj = {
					key: tKey,
					autoPlay: false,
					loop: false,
					duration: 0,
					isPlaying: false,
					playFlag: false,
					loadedFlag: false,
				};
				this.mSndObjAry[tIdx] = tSndObj;
			}
		}
	}

	// 사운드 리스트 로딩을 나타낸다.
	loadSounds(tFileUrlAry: Array<Array<string> | boolean>): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			let tAddObj = false;
			this.mLoader = PIXI.Loader.shared;
			for (const tVal of tFileUrlAry) {
				// console.log(tVal[0], tVal[1], tVal[2], tVal[3], tVal[4]);

				if (tVal == null || tVal == undefined) continue;
				if (tVal[0] == null || tVal[0] == undefined) continue;
				if (tVal[1] == null || tVal[1] == undefined) continue;
				if (tVal[2] == null || tVal[2] == undefined) continue;

				if (tVal[0] == Rsc.product)
					tVal[0] = `ps_${Config.appName}_${Util.addZero(
						Config.subjectNum,
						2,
					)}`;

				const tKey = `${tVal[1].toLowerCase()}:${tVal[2]}`;
				const tFullPath = `${this.mURLRoot}ps_${Config.appName}/${
					tVal[0]
				}/${tVal[1].toLowerCase()}/sounds/${tVal[2]}`;
				const tFindSnd = this.mSndInsAry[tKey];

				if (tFindSnd === undefined) {
					this.mLoader.add(tKey, tFullPath);
					tAddObj = true;
				} else {
					// console.log(`tKey = ${tKey} Finded`);
				}
			}

			if (!tAddObj) resolve();

			this.mLoader.load((loader, resource) => {
				for (const [key, value] of Object.entries(resource)) {
					// console.log(`%%% tKey = ${key}`, value.sound);
					this.mSndInsAry[key] = value.sound;
					// this.mResource[tIdx] = value;
				}
				resolve();
			});
		});
	}

	// 사운드 플레이를 나타낸다.
	play(tCategory: string, tFileName: string) {
		const tKey = `${tCategory.toLowerCase()}:${tFileName}`;
		const tIdx = Object.entries(this.mSndInsAry).findIndex(e => e[0] == tKey);
		// console.log('play = ' + tKey, tIdx, this.mSndInsAry);
		if (this.mSndObjAry[tIdx].loadedFlag) {
			this.mSndInsAry[tKey].play();
		} else {
			this.mSndObjAry[tIdx].playFlag = true;
		}
	}

	// 사운드의 길이 체크를 나타낸다.
	duration(tCategory: string, tFileName: string): Promise<number> {
		const tKey = `${tCategory.toLowerCase()}:${tFileName}`;
		const tIdx = Object.entries(this.mSndInsAry).findIndex(e => e[0] == tKey);
		// console.log('duration = ' + tKey, tIdx, this.mSndInsAry);
		if (this.mSndObjAry[tIdx].loadedFlag) {
			return Promise.resolve(this.mSndObjAry[tKey].duration);
		}
	}

	// 모든 사운드 멈춤을 나타낸다.
	stopAll() {
		pixiSound.stopAll();
		for (const tVal of Object.values(this.mSndInsAry)) {
			tVal.stop();
		}
	}

	// 모든 사운드 제거를 나타낸다.
	removeAll() {
		pixiSound.stopAll();
		for (const tVal of Object.values(this.mSndInsAry)) {
			tVal.stop();
			tVal.muted = true;
		}
	}

	//bgm 사운드의 뮤트 설정을 나타낸다.
	muteBgm(tBool: boolean) {
		console.log(
			`muteBgm = ${this.mBgmSnd.category}, ${this.mBgmSnd.fileName}, ${tBool}`,
		);
		this.mBgmMute = tBool;
		this.getSound(this.mBgmSnd.category, this.mBgmSnd.fileName).muted = tBool;
	}
}
