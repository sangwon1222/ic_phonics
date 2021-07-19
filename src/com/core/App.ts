// Pixi Module
import * as PIXI from 'pixi.js';
import PIXISound from 'pixi-sound';
window.PIXI = PIXI;
// Link Module
import Config from '../util/Config';
import * as Util from '../util/Util';
import { NetCommunication } from '../util/NetCommunication';
import { LoadingBar } from '../widget/LoadingBar';
import { XCaliperApi } from '../util/XCaliperApi';

//나가기 팝업에서 Yes 클릭시 아이스크림 기기에서 나가기를 나타낸다.
window['popUpYes'] = async function() {
	if (!Config.isFreeStudy) {
		await App.Handle.netModule.leaveActivity(
			Config.currentMode,
			Config.currentIdx,
		);
		await App.Handle.netModule.endStudyData();
		await App.Handle.netModule.saveCache();
		await App.Handle.netModule.sendStudyData();
	}
	await App.Handle.xCaliper.AssignablePaused();
	window['Android'].exit();
};

export class App extends PIXI.Application {
	//-----------------------------------
	// singleton
	private static _handle: App;
	static get Handle(): App {
		return App._handle;
	}
	//-----------------------------------

	private mSceneRoot: PIXI.Container;
	private mNaviRoot: PIXI.Container;

	private mWidth: number;
	private mHeight: number;

	private mPlayingVideo: Array<HTMLVideoElement>;

	private mAlphabet: string;

	private mLogPosY: number;
	private mLogAry: Array<PIXI.Text>;

	private mTimeOut: number;
	private mUseSprs: Array<any>;
	private mPauseSprs: Array<any>;

	private mURLRoot: string;
	private mPauseApp: boolean;

	private mNetModule: NetCommunication;
	private mLoading: LoadingBar;
	private mXCaliper: XCaliperApi;

	constructor(canvas: HTMLCanvasElement, pWidth = 1280, pHeight = 752) {
		console.log('App Created');
		super({
			width: pWidth,
			height: pHeight,
			backgroundColor: 0x000000,

			transparent: true,
			// resolution: window.devicePixelRatio || 1, //해상도에 따라 화면 클릭시 위치가 맞지 않을때 주석처리해야 함
			view: canvas,
		});

		this.mLogPosY = 0;
		this.mLogAry = [];
		this.mUseSprs = [];
		this.mPauseSprs = [];

		this.mSceneRoot = new PIXI.Container();
		this.stage.addChild(this.mSceneRoot);

		this.mNaviRoot = new PIXI.Container();
		this.stage.addChild(this.mNaviRoot);

		this.mWidth = pWidth;
		this.mHeight = pHeight;

		this.mPlayingVideo = [];

		this.mAlphabet = '';

		this.mPauseApp = false;

		// // F5 키를 눌렀을때의 처리를 나타낸다.
		// const tStr = location.href.slice(0, location.href.lastIndexOf('/'));
		// window.onkeydown = (evt: KeyboardEvent) => {
		// 	if (evt.keyCode == 116) {
		// 		console.error(`${location.href}`);
		// 		if (Config.devMode) {
		// 			location.href = `${tStr}/ictest/index.html`;
		// 		} else {
		// 			location.href = `${tStr}/apps/littleengnuri/index.html`;
		// 		}
		// 	}
		// };

		// 기기 ON -> OFF 시 처리를 나타낸다.
		document.addEventListener('visibilitychange', () => {
			if (document.hidden == false) {
				PIXI.Ticker.shared.start();
				PIXISound.resumeAll();
				// App.Handle.pauseApp = false;
				// if (window['video']) window['video'].play();
			} else {
				PIXI.Ticker.shared.stop();
				PIXISound.pauseAll();
				App.Handle.pauseApp = true;
				// if (window['video']) window['video'].pause();
			}
			if (window['video']) window['video'].videoStateCheck(); // 0413 백지원 주임 메일 수정요청에 따라 비활성화 -> 활성화시 항상 멈춤 상태
		});

		PIXI.settings.TARGET_FPMS = 0.03;
		this.mURLRoot = Config.restAPIProd;

		Config.mobile = Util.isMobilePlatform();

		App._handle = this;
		// hack for browser
		(window as any)['app'] = this;
	}

	get appWidth(): number {
		return this.mWidth;
	}
	get appHeight(): number {
		return this.mHeight;
	}

	get sceneRoot(): PIXI.Container {
		return this.mSceneRoot;
	}
	get naviRoot(): PIXI.Container {
		return this.mNaviRoot;
	}

	get playingVideo(): Array<HTMLVideoElement> {
		return this.mPlayingVideo;
	}
	set playingVideo(v: Array<HTMLVideoElement>) {
		this.mPlayingVideo = v;
	}

	get useObjects(): Array<any> {
		return this.mUseSprs;
	}

	get rootUrl(): string {
		return this.mURLRoot;
	}

	get pauseApp(): boolean {
		return this.mPauseApp;
	}
	set pauseApp(tVal: boolean) {
		this.mPauseApp = tVal;
	}

	get netModule(): NetCommunication {
		return this.mNetModule;
	}

	set netModule(tObj: NetCommunication) {
		this.mNetModule = tObj;
	}

	get loading(): LoadingBar {
		return this.mLoading;
	}

	set loading(tObj: LoadingBar) {
		this.mLoading = tObj;
	}

	get xCaliper(): XCaliperApi {
		return this.mXCaliper;
	}

	set xCaliper(tObj: XCaliperApi) {
		this.mXCaliper = tObj;
	}

	// 플레이 진행에 따른 제어를 위한 변수를 나타낸다.
	get getAlphabet(): string {
		return this.mAlphabet;
	}
	set setAlphabet(v: string) {
		this.mAlphabet = v;
	}

	// 영상 초기화를 나타낸다.
	stopVideo() {
		//
		for (const video of this.playingVideo) {
			video.currentTime = 0;
			video.pause();
		}
		this.playingVideo = [];
	}

	//모션대기 설정하기를 나타낸다.
	tweenMotion(tFlag: string, tData?: any): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			switch (tFlag) {
				case 'delay':
					// console.log(tData);
					this.mTimeOut = setTimeout(resolve, tData * 1000);
					// const timer = new PauseableTimeout(function() {}, 3000);
					break;
				default:
			}
		});
	}

	//모션대기 타임아웃 제거를 나타낸다.
	removeMotionDelay() {
		clearTimeout(this.mTimeOut);
		this.mTimeOut = null;
	}

	//일시정지를 위해 따로 리스트화 시킨 AddChilds를 나타낸다.
	addChilds(target: any, obj: any, tClear?: boolean) {
		target.addChild(obj);
		this.mUseSprs.push(obj);
		tClear ? this.mPauseSprs.push(obj) : null;
	}

	//mPauseSprs의 오브젝트 일시정지를 나타낸다.
	pauseStageObjs() {
		for (const tObj of this.mPauseSprs) {
			tObj.interactive = false;
		}
	}

	//mPauseSprs의 오브젝트 플레이를 나타낸다.
	playStageObjs() {
		for (const tObj of this.mPauseSprs) {
			tObj.interactive = true;
		}
	}

	//일시정지 오브젝트의 초기화를 나타낸다.
	clearStagObjs() {
		this.mPauseSprs = [];
	}

	//addchilds한 오브젝트의 메모리 제거를 나타낸다.
	removeChilds() {
		// console.log(this.mUseSprs);

		for (let tVal of this.mUseSprs) {
			tVal?.destroy();
			tVal = null;
		}

		this.mUseSprs = [];
	}

	//addchilds한 오브젝트중 하나만 제거를 나타낸다.
	removeChild(tObj: any) {
		for (let i = 0; i < this.mUseSprs.length; i++) {
			if (this.mUseSprs[i] == tObj) {
				this.mUseSprs[i].destroy();
				this.mUseSprs.splice(i, 1);
			}
		}
	}

	//닫기 버튼 클릭시의 처리를 나타낸다.
	async exitApp() {
		let tAlertTxt = '학습창을 닫으시겠습니까?';
		// if (AlphabetConf.isFreeStudy) {
		// 	tAlertTxt = '알파벳을(를) 종료하시겠습니까?';
		// }

		window['Android'].confirm(
			tAlertTxt,
			'popUpYes()',
			'funcNo()',
			'예',
			'아니오',
		);
	}
}

// back 물리버튼 탭시의 처리를 나타낸다.
window.onBackPressed = function() {
	App.Handle.exitApp();
};

window.onPause = function() {
	console.log('.onCalledEvents .onPause');
};
window.onResume = function() {
	console.log('.onCalledEvents .onResume');
};
