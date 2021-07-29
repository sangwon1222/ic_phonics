import * as PIXI from 'pixi.js';
window.PIXI = PIXI;
import pixiSound from 'pixi-sound';
require('pixi-spine');
import WebFont from 'webfontloader';
import { ResourceManager, ResourceTable } from './resourceManager';

import { SceneBase } from './sceneBase';
import gsap from 'gsap';
import { Common } from './resource/common';
import Config from '@/com/util/Config';
import * as Util from '@/com/util/Util';

import { LoadingBar } from '@/com/widget/LoadingBar';
import { Home } from '../scene/home';
import { Intro } from '../scene/intro';
import { Chant } from '../scene/chant/chant';
import { Outro } from '../scene/outro';
import { Sound } from '../scene/sound/sound';
import { Game } from '../scene/game/game';
import { Controller } from '../widget/controller';
import { isMobilePlatform } from '../utill/gameUtil';

import AppConf from '@/phonic/core/PhonicsConf';

//Net Module
import { NetCommunication } from '@/com/util/NetCommunication';
import { XCaliperApi } from '@/com/util/XCaliperApi';
import { gameData } from './resource/product/gameData';

//나가기 팝업에서 Yes 클릭시 아이스크림 기기에서 나가기를 나타낸다.
window['popUpYes'] = async function() {
	if (!Config.isFreeStudy) {
		await this.netModule.leaveActivity(Config.currentMode, Config.currentIdx);
		await this.netModule.endStudyData();
		await this.netModule.saveCache();
		await this.netModule.sendStudyData();
	}
	await window['phonics_xCaliper'].AssignablePaused();
	window['Android'].exit();
};

export class PhonicsApp extends PIXI.Application {
	// singleton
	private static _handle: PhonicsApp;
	static get Handle(): PhonicsApp {
		return PhonicsApp._handle;
	}

	// 현재 진행중인 액티비티 이름
	private mCurrentSceneName: string;
	get currectSceneName(): string {
		return this.mCurrentSceneName;
	}

	// 로딩화면
	private mLoadingScene: LoadingBar;
	// netCommunity
	private netModule: NetCommunication;

	// 게임 컨트롤러 (게임버튼을 눌러 해당 게임으로 이동하는 기능 등등)
	private mController: Controller;
	get controller(): Controller {
		return this.mController;
	}

	// 액티비티가 들어갈 공간
	private mSceneStage: PIXI.Container;
	private mModalStage: PIXI.Container;

	private mSceneArray: Array<SceneBase>;

	constructor(canvas: HTMLCanvasElement, private mPrevScene: string) {
		super({
			width: Config.width,
			height: Config.height,
			backgroundColor: 0x333333,
			view: canvas,
		});
		PhonicsApp._handle = this;

		window['spine'] = null;
		Config.appName = 'phonics';
	}

	async onInit() {
		await this.resetTicker();

		pixiSound.context.paused = false;
		await pixiSound.context.refresh();
		this.renderer.reset();
		gsap.globalTimeline.clear();
		pixiSound.resumeAll();

		this.mSceneStage = new PIXI.Container();
		this.mModalStage = new PIXI.Container();

		this.stage.addChild(this.mSceneStage, this.mModalStage);

		this.mLoadingScene = new LoadingBar();
		this.mLoadingScene.interactive = true;
		this.mModalStage.addChild(this.mLoadingScene);
		await this.mLoadingScene.load();

		this.mSceneStage.zIndex = 1;
		this.mModalStage.zIndex = 2;

		await this.getStudyInfo();

		// back 물리버튼 탭시의 처리를 나타낸다.
		window.onBackPressed = function() {
			this.exitApp();
		};

		if (!this.netModule) this.netModule = new NetCommunication();
		window['phonics_xCaliper'] = new XCaliperApi();

		await this._fontLoading();
		await ResourceManager.Handle.loadCommonResource(Common);
		ResourceManager.Handle.getCommon('button_click.mp3').sound.play();

		if (window['ticker']) gsap.ticker.remove(window['ticker']);
		if (window['video']) {
			window['video'].pause();
			window['video'] = null;
		}
		if (window['bgm']) {
			window['bgm'].pause();
			window['bgm'] = null;
		}

		this.stage.sortableChildren = true;

		// PIXI.settings.TARGET_FPMS = 0.03;
		Config.mobile = isMobilePlatform();

		// 기기 ON -> OFF 시 처리를 나타낸다.
		document.removeEventListener(
			'visibilitychange',
			window['app_visibilitychange'],
		);
		document.addEventListener('visibilitychange', async () => {
			/**화면이 보일때 */
			if (document.hidden == false) {
				pixiSound.resumeAll();
				window['spine'] ? (window['spine'].state.timescale = 1) : null;
				window['video'] ? await window['video_controller'].waitingPlay() : null;
				if (window['bgm']) {
					window['bgm'].play();
					window['bgm'].volume = 1;
				}
				// window['bgm'] ? (window['bgm'].volume = 1) : null;
			} else {
				/**화면이 안보일때 */
				pixiSound.pauseAll();
				window['spine'] ? (window['spine'].state.timescale = 0) : null;
				window['video'] ? window['video'].pause() : null;
				if (window['bgm']) {
					window['bgm'].pause();
					window['bgm'].volume = 0;
				}
				// window['bgm'] ? (window['bgm'].volume = 0) : null;
			}
		});

		this.mController = new Controller();
		this.mModalStage.addChild(this.mController);
		await this.mController.onInit();
		this.mController.zIndex = 1;

		this.mController.visible = false;

		this.mModalStage.sortableChildren = true;

		window['clickSnd'] = ResourceManager.Handle.getCommon(
			'button_click.mp3',
		).sound;

		this.mSceneArray = [];

		this.addScene(new Home());
		this.addScene(new Intro());
		this.addScene(new Chant());
		this.addScene(new Sound());
		this.addScene(new Game());
		this.addScene(new Outro());

		window['phonics_xCaliper'].AssignableStudyStarted();

		await this.goScene(this.mPrevScene);
	}

	controllerVisible(flag: boolean) {
		this.mController.visible = flag;
	}

	private _fontLoading(): Promise<void> {
		return new Promise<void>(resolve => {
			WebFont.load({
				custom: {
					// families: ["TmoneyRoundWindExtraBold", "TmoneyRoundWindRegular"],
					families: ['minigate Bold ver2', 'NanumSquareRound'],
					urls: [`${Config.restAPIProd}ps_phonics/viewer/fonts/fonts.css`],
					// urls: [`https://imestudy.smartdoodle.net/ic_phonics/rsc/viewer/fonts/fonts.css`],
				},
				timeout: 2000,
				active: () => {
					//
					resolve();
				},

				fontloading: fontname => {
					//
				},
			});
		});
	}

	async loddingFlag(flag: boolean) {
		this.mLoadingScene.visible = flag;
	}

	addScene(scene: SceneBase) {
		this.mSceneArray.push(scene);
	}

	async goScene(sceneName: string) {
		this.mController.updateInfo();
		if (this.mCurrentSceneName == sceneName) {
			return;
		}

		if (window['chant_guide_snd']) {
			window['chant_guide_snd'].pause();
			window['chant_guide_snd'] = null;
		}

		await this.resetTicker();

		if (sceneName == 'sound' || sceneName == 'game') {
			window['bgm'] = document.createElement('audio');
			window[
				'bgm'
			].src = `${Config.restAPIProd}ps_phonics/viewer/sounds/${sceneName}_bgm.mp3`;
			window['bgm'].play();
			window['bgm'].loop = true;

			this.controller.bgmFlag
				? (window['bgm'].volume = 1)
				: (window['bgm'].volume = 0);

			this.mController.bgmBtn.visible = true;
		} else {
			this.mController.bgmBtn.visible = false;
			if (window['bgm']) {
				window['bgm'].pause();
				window['bgm'] = null;
			}
		}

		let sceneFlag = true;
		for (const scene of this.mSceneArray) {
			if (scene.sceneName == sceneName) {
				sceneFlag = false;
				this.mPrevScene = this.mCurrentSceneName;
				this.mCurrentSceneName = sceneName;

				// free_mode => 액티비티 완료 안해도 액티비티 이동가능
				this.mController.changeLabel(sceneName);

				await gsap.globalTimeline.clear();
				pixiSound.stopAll();
				this.mController.bgmSprite.visible = false;
				this.mController.bgmBtn.interactive = true;

				this.mSceneStage.removeChildren();
				this.mSceneStage.addChild(scene);

				await this.loddingFlag(true);
				await this.mController.reset();

				this.setAssignableViewed();
				await scene.onInit();
				await this.loddingFlag(false);
				await scene.onStart();
				break;
			}
		}

		if (sceneFlag) {
			console.log(`${sceneName}: 없는 액티비티 입니다.`);
		}
	}

	//xCaliper.AssignableViewed 함수 호출을 나타낸다.
	private setAssignableViewed() {
		const list = ['chant', 'sound', 'game'];
		let tSceneName = '';
		let tSceneNum = 0;

		for (const name of list) {
			if (name == this.mCurrentSceneName) {
				tSceneNum = list.indexOf(name);
				tSceneName = name[0].toUpperCase() + name.slice(1);
			}
		}

		window['phonics_xCaliper'].AssignableViewed(tSceneName, tSceneNum + 1);
	}

	// 아이스크림 에듀 학습 정보 가져오기
	private async getStudyInfo() {
		const tUrl = Config.getInitVariable.xmlName;
		if (
			tUrl === null ||
			tUrl === undefined ||
			tUrl === '' ||
			!Config.mobile ||
			Config.devMode
		) {
			Config.subjectName = Util.getSubjectStr(Config.subjectNum);
			if (Config.subjectName == undefined) {
				Config.subjectName = gameData[`day${Config.subjectNum}`].title;
			}
			console.groupCollapsed(
				`%c 초기 세팅값 `,
				'background:#000; color:#fff;padding:2px;',
			);
			console.log(
				'subjectNum  =>' + `%c [ ${Config.subjectNum} ]`,
				'color:green; font-weight:800;',
			);
			console.log(
				'subjectName  =>' + `%c [ ${Config.subjectName} ]`,
				'color:green; font-weight:800;',
			);
			console.groupEnd();

			Config.currentMode = 0;
			Config.currentIdx = 0;
			return;
		}

		await this.netModule.getLCMS();

		Config.subjectNum = Number(
			AppConf.LCMS.cdn_url.slice(-2, AppConf.LCMS.cdn_url.length),
		);
		Config.subjectName = Util.getSubjectStr(Config.subjectNum);
		// App.Handle.setAlphabet = Config.subjectName;

		let tFreeStudy = false;
		Config.getInitVariable.studying === 'N'
			? (tFreeStudy = true)
			: (tFreeStudy = false);
		Config.devMode ? null : (Config.isFreeStudy = tFreeStudy);

		if (tFreeStudy) {
			Config.currentMode = 0;
			Config.currentIdx = 0;
		} else {
			console.log(this.netModule.getLastVisit());
			const tActAry = this.netModule.getLastVisit();
			console.error(tActAry);
			//마지막 학습 완료후의 다음 학습모드로 이동한다.
			switch (tActAry[2]) {
				case 1:
					Config.currentMode = tActAry[0] + 1;
					Config.currentIdx = tActAry[1];
					break;
				case 2:
					Config.currentMode = 1;
					Config.currentIdx = 0;
					break;
				default:
					Config.currentMode = 0;
					Config.currentIdx = 0;
			}

			// if (SceneNum.SelectScene === 0) {
			// 	this.mLastPlayNum = this.getIdxNum(this.mCurrentIdx) + 1;
			// } else {
			// 	this.mLastPlayNum = this.getIdxNum(this.mCurrentIdx);
			// }

			//오늘의 학습을 모두 완료 했을때 모든 메뉴 버튼 활성화를 나타낸다.
			if (tActAry[2] === 2) Config.isFreeStudy = true;
			// if (tActAry[2] === 2) this.mLastPlayNum = 10;
			// this.setModeData(this.mLastPlayNum);
		}
	}

	resetTicker(): Promise<void> {
		return new Promise<void>(resolve => {
			if (window['ticker']) {
				gsap.ticker.remove(window['ticker']);
			}
			window['ticker'] = null;
			if (window['video']) {
				window['video'].pause();
				window['video'] = null;
			}
			if (window['bgm']) {
				window['bgm'].pause();
				window['bgm'] = null;
			}
			resolve();
		});
	}

	endScene(): Promise<void> {
		return new Promise<void>(resolve => {
			for (const scene of this.mSceneArray) {
				scene.onEnd();
			}
			resolve();
		});
	}

	goFullScreen() {
		// App.vue에서 overwhite
	}

	//닫기 버튼 클릭시의 처리를 나타낸다.
	async exitApp() {
		let tAlertTxt = '학습창을 닫으시겠습니까?';
		// if (AlphabetConf.isFreeStudy) {
		// 	tAlertTxt = '알파벳을(를) 종료하시겠습니까?';
		// }
		if (window['Android']) {
			window['Android'].confirm(
				tAlertTxt,
				'popUpYes()',
				'funcNo()',
				'예',
				'아니오',
			);
		} else {
			history.back();
			window.close();
		}
	}
}
