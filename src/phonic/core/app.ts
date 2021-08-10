import * as PIXI from 'pixi.js';
window.PIXI = PIXI;
import pixiSound from 'pixi-sound';
require('pixi-spine');
import WebFont from 'webfontloader';
import { ResourceManager } from './resourceManager';

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
import { isIOS, isMobilePlatform } from '../utill/gameUtil';

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

	private mStartScene: string;
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

	constructor(canvas: HTMLCanvasElement, startScene: string) {
		super({
			width: Config.width,
			height: Config.height,
			backgroundColor: 0x333333,
			view: canvas,
		});
		PhonicsApp._handle = this;
		this.mStartScene = startScene;

		window['spine'] = null;
		Config.appName = 'phonics';
	}

	async onInit() {
		// 메모리 초기화
		await pixiSound.context.refresh();
		await this.resetTicker();

		// 아이스크림 에듀 학습 정보 가져오기
		await this.getStudyInfo();

		// back 물리버튼 탭시의 처리를 나타낸다.
		window.onBackPressed = function() {
			this.exitApp();
		};

		if (!this.netModule) this.netModule = new NetCommunication();
		window['phonics_xCaliper'] = new XCaliperApi();

		// 폰트 리소스 로딩
		await this._fontLoading();
		// 공통으로 쓰이는 리소스 로딩
		await ResourceManager.Handle.loadCommonResource(Common);

		/**
		 * createAppUI() 구조
		 * app
		 * [scene Stage]    ,             [ modal Stage ]
		 *      ↓                                ↓
		 * [scene],[scene]...     [loading Screen , controller]
		 *
		 *
		 * [modal] zIndex=3
		 * [scene] zIndex=2
		 * [stage]
		 */
		await this.createAppUI();

		// 로딩에 들어가는 리소스 로딩
		await this.mLoadingScene.load();
		await this.mController.onInit();

		PIXI.settings.TARGET_FPMS = 0.03;
		Config.mobile = isMobilePlatform();

		// 기기 ON -> OFF 시 처리를 나타낸다.
		document.removeEventListener(
			'visibilitychange',
			window['app_visibilitychange'],
		);
		window['app_visibilitychange'] = async () => {
			if (document.hidden == false) {
				/**화면 보일때 */
				pixiSound.resumeAll();
				window['spine'] ? (window['spine'].state.timescale = 1) : null;
				window['bgm'] ? (window['bgm'].muted = false) : null;
				window['guide_snd'] ? window['guide_snd'].play() : null;
				if (window['video']) {
					window['Android']
						? null
						: await window['video_controller'].waitingPlay();
				}
			} else {
				/**화면 안보일때 */
				pixiSound.pauseAll();
				window['spine'] ? (window['spine'].state.timescale = 0) : null;
				window['video'] ? window['video'].pause() : null;
				window['bgm'] ? (window['bgm'].muted = true) : null;
				window['guide_snd'] ? window['guide_snd'].pause() : null;
			}
		};
		document.addEventListener(
			'visibilitychange',
			window['app_visibilitychange'],
		);

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

		await window['phonics_xCaliper'].AssignableStudyStarted();

		await this.goScene(this.mStartScene);
	}

	private createAppUI(): Promise<void> {
		return new Promise<void>(resolve => {
			this.stage.sortableChildren = true;

			this.mSceneStage = new PIXI.Container();

			this.mModalStage = new PIXI.Container();
			this.mModalStage.sortableChildren = true;

			this.mSceneStage.zIndex = 1;
			this.mModalStage.zIndex = 2;
			this.stage.addChild(this.mSceneStage, this.mModalStage);

			this.mLoadingScene = new LoadingBar();
			this.mLoadingScene.interactive = true;

			this.mController = new Controller();
			this.mController.zIndex = 1;
			this.mController.visible = false;

			this.mModalStage.addChild(this.mLoadingScene);
			this.mModalStage.addChild(this.mLoadingScene, this.mController);

			resolve();
		});
	}

	private resetTicker(): Promise<void> {
		return new Promise<void>(resolve => {
			window['ticker'] ? gsap.ticker.remove(window['ticker']) : null;
			window['video'] && !window['video'].paused
				? window['video'].pause()
				: null;
			window['bgm'] && !window['bgm'].paused ? window['bgm'].pause() : null;

			window['ticker'] = null;
			window['video'] = null;
			window['bgm'] = null;

			pixiSound.context.paused = false;
			this.renderer.reset();
			gsap.globalTimeline.clear();
			pixiSound.resumeAll();

			resolve();
		});
	}

	controllerVisible(flag: boolean) {
		this.mController.visible = flag;
	}

	private _fontLoading(): Promise<void> {
		return new Promise<void>(resolve => {
			let url = '';

			Config.restAPIProd.slice(-2) == 'g/'
				? // 아이스크림 cdn 바라 봅니다.
				  (url = `${Config.restAPIProd}ps_phonics/viewer/fonts/fonts.css`)
				: // 미니게이트 테스트서버 바라 봅니다.
				  (url = `${Config.restAPIProd}viewer/fonts/fonts.css`);
			WebFont.load({
				custom: {
					families: ['minigate Bold ver2', 'NanumSquareRound'],
					urls: [url],
				},
				timeout: 2000,
				active: () => {
					resolve();
				},

				fontloading: fontname => {
					fontname == '' ? console.log(`fontname이 없습니다.`) : null;
					//
				},
			});
		});
	}

	async loddingFlag(flag: boolean) {
		this.mLoadingScene.visible = flag;
	}

	private addScene(scene: SceneBase) {
		this.mSceneArray.push(scene);
	}

	async goScene(sceneName: string) {
		this.mController.updateInfo();
		if (this.mCurrentSceneName == sceneName) {
			return;
		}
		await gsap.globalTimeline.clear();
		pixiSound.context.refresh();

		window['bgm'] && !window['bgm'].paused ? window['bgm'].pause() : null;
		window['guide_snd'] ? window['guide_snd'].pause() : null;

		window['bgm'] = null;
		window['guide_snd'] = null;

		await this.resetTicker();

		if (sceneName == 'sound' || sceneName == 'game') {
			this.mController.bgmBtn.visible = false;
			/**
			 * IOS 오디오 동시출력이 불안정해서 추후에 soundjs 로 분기쳐서 업데이트 필요
			 * 일단은 IOS로 접속 시 BGM 옵션 빼놨습니다.
			 * */
			if (!isIOS()) {
				window['bgm'] = document.createElement('audio');

				let url = '';
				Config.restAPIProd.slice(-2) == 'g/'
					? (url = `${Config.restAPIProd}ps_phonics/viewer/sounds/${sceneName}_bgm.mp3`)
					: (url = `${Config.restAPIProd}viewer/sounds/${sceneName}_bgm.mp3`);

				window['bgm'].src = url;
				window['bgm'].loop = true;
				window['bgm'].play();

				this.controller.bgmFlag
					? (window['bgm'].muted = false)
					: (window['bgm'].muted = true);

				this.mController.bgmBtn.visible = true;
			}
		} else {
			this.mController.bgmBtn.visible = false;
		}

		let sceneFlag = true;
		for (const scene of this.mSceneArray) {
			if (scene.sceneName == sceneName) {
				sceneFlag = false;
				await this.loddingFlag(true);
				this.mCurrentSceneName = sceneName;

				this.mController.changeLabel(sceneName);
				pixiSound.stopAll();
				this.mController.bgmSprite.visible = false;
				this.mController.bgmBtn.interactive = true;

				this.mSceneStage.removeChildren();
				this.mSceneStage.addChild(scene);
				await this.mController.reset();

				await this.setAssignableViewed();
				pixiSound.resumeAll();
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
	private async setAssignableViewed() {
		const list = ['chant', 'sound', 'game'];
		let tSceneName = '';
		let tSceneNum = 0;

		for (const name of list) {
			if (name == this.mCurrentSceneName) {
				tSceneNum = list.indexOf(name);
				tSceneName = name[0].toUpperCase() + name.slice(1);
			}
		}

		await window['phonics_xCaliper'].AssignableViewed(
			tSceneName,
			tSceneNum + 1,
		);
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

			Config.currentMode = 0;
			Config.currentIdx = 0;
			return;
		}

		await this.netModule.getLCMS();

		let subjectNum = 1;
		Config.subjectNum.toString().slice(0, 1) == '0'
			? (subjectNum = +Config.subjectNum.toString().slice(-1))
			: (subjectNum = +AppConf.LCMS.cdn_url.slice(
					-2,
					AppConf.LCMS.cdn_url.length,
			  ));
		Config.subjectNum = +subjectNum;
		Config.subjectName = Util.getSubjectStr(Config.subjectNum);

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

	endScene(): Promise<void> {
		return new Promise<void>(resolve => {
			for (const scene of this.mSceneArray) {
				scene.onEnd();
			}
			resolve();
		});
	}

	goFullScreen() {
		// App.vue에서 override
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
