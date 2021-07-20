//Base Module
import { App } from '../com/core/App';
import { SceneBase } from '../com/core/SceneBase';
import { EventType } from '../com/core/EventType';
import { CustomEvent } from '../com/core/CustomEvent';
//Net Module
import { NetCommunication } from '@/com/util/NetCommunication';
import { XCaliperApi } from '@/com/util/XCaliperApi';
//Pixi Module
import PIXISound from 'pixi-sound';
//Manager Module
import { ViewerRscManager } from '../com/manager/ViewerRscManager';
import { ProductRscManager } from '../com/manager/ProductRscManager';
import { SoundManager } from '../com/manager/SoundManager';
//Navi Module
import { TopBar } from './scene/TopBar';
import { BottomBar } from './scene/BottomBar';
//Scene Module
import { Intro } from './scene/Intro';
import { Pattern } from './scene/Pattern';
import { Practice } from './scene/Practice';
import { Chant } from './scene/Chant';
import { Outro } from './scene/Outro';
import { SelectScene } from './scene/SelectScene';
import Config from '@/com/util/Config';
import AppConf from './SightWordsConf';
import { LoadingBar } from '@/com/widget/LoadingBar';
import * as Util from '../com/util/Util';

export enum SceneNum {
	Intro,
	Pattern,
	Practice,
	Chant,
	Outro,
	SelectScene,
}

export enum NaviBtnName {
	Prev = 'prev',
	Next = 'next',
	Sub1 = 'sub1',
	Sub2 = 'sub2',
}

export enum BtnState {
	On,
	Selected,
	Off,
	Blink,
	Hide,
	Clear,
}

class ModeData {
	mIdx: number;
	mMode: number;
}

export class SightWordsApp extends App {
	private mLastPlayNum: number;
	private mTotalSceneNum: number; // 추가된 총 씬 번호
	private mSceneAry: Array<Array<SceneBase>>;
	private mPrevIdx: ModeData; // 이전씬 index
	private mCurrentIdx: ModeData; // 현재씬 index
	private mLockIdx: ModeData;
	private mTopBar: TopBar;
	private mBottomBar: BottomBar;
	private mLoadingBg: PIXI.Graphics;
	private mLoadingBar: LoadingBar;

	constructor(canvas: HTMLCanvasElement) {
		console.log('IScream Sight Words');
		Config.appName = 'words';
		super(canvas);
		this.mPrevIdx = new ModeData();
		this.mCurrentIdx = new ModeData();
		this.mLockIdx = new ModeData();

		this.mPrevIdx.mIdx = 0;
		this.mPrevIdx.mMode = 0;
		this.mCurrentIdx.mIdx = 0;
		this.mCurrentIdx.mMode = 0;
		this.mTotalSceneNum = 0;
		this.mLastPlayNum = 0;

		// 씬 생성
		this.mSceneAry = [];
		// this.addScene([new SelectScene()]); //0
		this.addScene([new Intro()]); //0
		this.addScene([new Pattern()]); //1
		this.addScene([new Practice()]); //2
		this.addScene([new Chant()]); //3
		this.addScene([new Outro()]); //6

		for (let i = 0; i < this.mSceneAry.length; i++) {
			const tSceneAry = this.mSceneAry[i];
			for (let j = 0; j < tSceneAry.length; j++) {
				// 메인단과의 통신을 위한 이벤트
				tSceneAry[j].addCustomEventListener(EventType.ReceiveData, evt =>
					this.receiveScene(evt),
				);
			}
		}

		// 상단바 생성
		this.mTopBar = new TopBar();
		this.mTopBar.addCustomEventListener(EventType.ReceiveData, evt =>
			this.receiveTabDown(evt),
		);
		this.mTopBar.x = 0;
		this.mTopBar.y = 0;
		App.Handle.naviRoot.addChild(this.mTopBar);

		// 하단바 생성
		this.mBottomBar = new BottomBar();
		this.mBottomBar.addCustomEventListener(
			EventType.ReceiveData,
			(evt: CustomEvent) => {
				this.receiveMoveScene(evt);
			},
		);
		App.Handle.naviRoot.addChild(this.mBottomBar);

		this.startApp();

		PIXISound.context.paused = false;
		PIXISound.context.refresh();
	}

	private async startApp() {
		App.Handle.xCaliper = new XCaliperApi();
		if (SceneNum.SelectScene !== 0) {
			this.mLoadingBar = new LoadingBar();
			App.Handle.loading = this.mLoadingBar;
			await this.mLoadingBar.load();

			this.mLoadingBg = new PIXI.Graphics();
			this.mLoadingBg.beginFill(0xfd4f33);
			this.mLoadingBg.drawRect(0, 0, App.Handle.appWidth, App.Handle.appHeight);
			this.mLoadingBg.endFill();
			App.Handle.addChilds(this.stage, this.mLoadingBg);
			App.Handle.addChilds(this.stage, this.mLoadingBar);
		}
		await this.getStudyInfo();
		await this.onLoadData();
		await this.onStartApp();
		await this.goScene(this.mCurrentIdx);
	}

	// 아이스크림 에듀 학습 정보 가져오기
	private async getStudyInfo() {
		App.Handle.netModule = new NetCommunication();

		const tUrl = Config.getInitVariable.xmlName;
		if (
			tUrl === null ||
			tUrl === undefined ||
			tUrl === '' ||
			!Config.mobile ||
			Config.devMode
		) {
			Config.subjectName = Util.getSubjectStr(Config.subjectNum);
			App.Handle.setAlphabet = Config.subjectName;

			this.mCurrentIdx.mMode = 0;
			this.mCurrentIdx.mIdx = 0;

			if (SceneNum.SelectScene === 0) {
				this.mLastPlayNum = this.getIdxNum(this.mCurrentIdx) + 1;
			} else {
				this.mLastPlayNum = this.getIdxNum(this.mCurrentIdx);
			}

			this.setModeData(this.mLastPlayNum);
			return;
		}

		await App.Handle.netModule.getLCMS();

		Config.subjectNum = Number(
			AppConf.LCMS.cdn_url.slice(-2, AppConf.LCMS.cdn_url.length),
		);
		Config.subjectName = Util.getSubjectStr(Config.subjectNum);
		App.Handle.setAlphabet = Config.subjectName;

		let tFreeStudy = false;
		Config.getInitVariable.studying === 'N'
			? (tFreeStudy = true)
			: (tFreeStudy = false);
		Config.devMode ? null : (Config.isFreeStudy = tFreeStudy);

		if (tFreeStudy) {
			this.mCurrentIdx.mMode = 0;
			this.mCurrentIdx.mIdx = 0;
		} else {
			const tActAry = App.Handle.netModule.getLastVisit();
			//마지막 학습 완료후의 다음 학습모드로 이동한다.
			switch (tActAry[2]) {
				case 1:
					this.mCurrentIdx.mMode = tActAry[0] + 1;
					this.mCurrentIdx.mIdx = tActAry[1];
					break;
				case 2:
					this.mCurrentIdx.mMode = 1;
					this.mCurrentIdx.mIdx = 0;
					break;
				default:
					this.mCurrentIdx.mMode = 0;
					this.mCurrentIdx.mIdx = 0;
			}

			if (SceneNum.SelectScene === 0) {
				this.mLastPlayNum = this.getIdxNum(this.mCurrentIdx) + 1;
			} else {
				this.mLastPlayNum = this.getIdxNum(this.mCurrentIdx);
			}

			//오늘의 학습을 모두 완료 했을때 모든 메뉴 버튼 활성화를 나타낸다.
			if (tActAry[2] === 2) this.mLastPlayNum = 10;
			this.setModeData(this.mLastPlayNum);
		}
	}

	private async onStartApp() {
		const viewerJson = await ViewerRscManager.Handle.getJSON();
		await ViewerRscManager.Handle.loadResource(viewerJson.data);

		await Util._fontLoading();
		this.mTopBar.onInit();
		this.mBottomBar.onInit();

		PIXISound.stopAll();
		App.Handle.xCaliper.AssignableStudyStarted();
	}

	private async onLoadData() {
		if (
			Config.subjectNum == null ||
			Config.subjectNum == undefined ||
			Config.subjectNum < 1
		) {
			Config.subjectNum = Util.getSubjectIdx(Config.subjectName);
		}
		const tAlphabetNum = Config.subjectNum;
		const productJson = await ProductRscManager.Handle.getJSON(tAlphabetNum);
		await ProductRscManager.Handle.loadResource(productJson.data);
	}

	private async goScene(pModeData: ModeData) {
		if (
			pModeData.mMode > 0 &&
			this.mPrevIdx.mMode === pModeData.mMode &&
			this.mPrevIdx.mIdx === pModeData.mIdx
		)
			return;

		if (!Config.isFreeStudy) {
			let tCalcu = 1;
			if (SceneNum.SelectScene == 0) tCalcu = 2;
			await App.Handle.netModule.leaveActivity(
				this.mPrevIdx.mMode - tCalcu,
				this.mPrevIdx.mIdx,
			);
		}

		// 종로 버튼 클리시 학습데이터 처리를 위한 변수를 나타낸다.
		Config.currentMode = this.mCurrentIdx.mMode - 1;
		Config.currentIdx = this.mCurrentIdx.mIdx;

		// 기기 OFF-ON후 씬 이동시 변수 초기화를 나타낸다.
		App.Handle.pauseApp = false;

		SoundManager.Handle.stopAll();
		this.stopVideo();

		// 현재씬이 타이틀이나 아웃트로라면 상단, 하단바는 보이지 않는다.
		const tSceneIdx = this.mSceneAry[pModeData.mMode][pModeData.mIdx].index;
		if (
			tSceneIdx == SceneNum.Intro ||
			tSceneIdx == SceneNum.Outro ||
			tSceneIdx == SceneNum.SelectScene
		) {
			this.mTopBar.hide();
			this.mBottomBar.hide();
		} else {
			this.mTopBar.show();
			this.mBottomBar.show();
		}

		// 바톰바 좌우 버튼 설정

		let scene: SceneBase;
		// 기존씬 초기화 작업
		if (this.mPrevIdx !== pModeData) {
			console.log(`this.mPrevIdx : ${this.mPrevIdx !== pModeData}`);
			scene = this.mSceneAry[this.mPrevIdx.mMode][this.mPrevIdx.mIdx];
			scene.hide();
			await scene.onEnd();
			scene.removeChildren();
			App.Handle.sceneRoot.removeChildren();
		}

		// 현재씬
		scene = this.mSceneAry[pModeData.mMode][pModeData.mIdx];

		this.mTopBar.selectButton(pModeData.mMode);
		if (SceneNum.SelectScene == 0) {
			this.mTopBar.selectButton(pModeData.mMode - 1);
		}

		App.Handle.sceneRoot.addChild(scene);
		await scene.onInit();
		scene.show();
		await scene.onStart();
		App.Handle.removeChild(this.mLoadingBg);

		this.setAssignableViewed();
	}

	//xCaliper.AssignableViewed 함수 호출을 나타낸다.
	private setAssignableViewed() {
		let tSceneName = '';
		let tSceneNum = this.getIdxNum(this.mCurrentIdx);
		switch (tSceneNum) {
			case SceneNum.Pattern:
				tSceneName = 'Pattern';
				break;
			case SceneNum.Practice:
				tSceneName = 'Practice';
				break;
			case SceneNum.Chant:
				tSceneName = 'Chant';
				break;
			default:
				tSceneName = '';
				break;
		}
		if (tSceneName !== '')
			App.Handle.xCaliper.AssignableViewed(
				tSceneName,
				this.mCurrentIdx.mIdx + 1,
			);
	}

	// Scene ---------------------------------------------------
	private addScene(pSceneAry: Array<SceneBase>) {
		const aryLength = pSceneAry.length;

		for (let i = 0; i < aryLength; i++) {
			pSceneAry[i].index = this.mTotalSceneNum;
			this.mTotalSceneNum++;
		}

		this.mSceneAry.push(pSceneAry);
	}

	private prevScene() {
		if (this.mCurrentIdx.mMode > 1) {
			this.mPrevIdx.mMode = this.mCurrentIdx.mMode;
			this.mPrevIdx.mIdx = this.mCurrentIdx.mIdx;
			let tCnt = 0;
			if (this.mCurrentIdx.mIdx > tCnt) {
				this.mCurrentIdx.mIdx--;
			} else {
				this.mCurrentIdx.mMode--;
				this.mCurrentIdx.mIdx =
					this.mSceneAry[this.mCurrentIdx.mMode].length - 1;
			}

			this.goScene(this.mCurrentIdx);
		}
	}

	private nextScene() {
		const maxLength = this.mSceneAry.length - 1;
		const maxIdxLength = this.mSceneAry[this.mCurrentIdx.mMode].length - 1;

		if (this.mCurrentIdx.mMode < maxLength) {
			this.mPrevIdx.mMode = this.mCurrentIdx.mMode;
			this.mPrevIdx.mIdx = this.mCurrentIdx.mIdx;
			if (this.mCurrentIdx.mIdx < maxIdxLength) {
				this.mCurrentIdx.mIdx++;
			} else {
				this.mCurrentIdx.mMode++;
				this.mCurrentIdx.mIdx = 0;
			}

			this.goScene(this.mCurrentIdx);
		}
	}

	//-----------------------------------------------------------------------------
	//TopBar
	private activeTopBar(tClear: boolean) {
		let tCnt = 0;
		SceneNum.SelectScene == 0
			? (tCnt = this.mLockIdx.mMode - 1)
			: (tCnt = this.mLockIdx.mMode);

		let tLockIdx = this.getIdxNum(this.mLockIdx);
		const tSceneIdx = this.getIdxNum(this.mCurrentIdx);

		Config.isFreeStudy ? (tLockIdx = 100) : null;
		this.mTopBar.soundMuteShow(true);

		switch (tSceneIdx) {
			case SceneNum.Pattern:
			case SceneNum.Chant: {
				this.mTopBar.soundMuteShow(false);
				if (tSceneIdx < tLockIdx) {
					if (tClear) {
						this.mTopBar.settingButton(tCnt);
					}
				}
				break;
			}
			default: {
				if (tSceneIdx < tLockIdx) {
					if (tClear) {
						this.mTopBar.settingButton(tCnt);
					}
				}
			}
		}
	}

	// BottomBar
	private activeBottomBar(tClear: boolean) {
		let tLockIdx = this.getIdxNum(this.mLockIdx);
		const tSceneIdx = this.getIdxNum(this.mCurrentIdx);

		Config.isFreeStudy ? (tLockIdx = 100) : null;

		this.mBottomBar.settingButton(NaviBtnName.Sub1, BtnState.Hide);
		this.mBottomBar.settingButton(NaviBtnName.Sub2, BtnState.Hide);

		switch (tSceneIdx) {
			case SceneNum.Pattern: {
				this.mBottomBar.settingButton(NaviBtnName.Prev, BtnState.Off);
				if (tSceneIdx < tLockIdx) {
					if (tClear) {
						this.mBottomBar.settingButton(NaviBtnName.Next, BtnState.Blink);
					} else {
						this.mBottomBar.settingButton(NaviBtnName.Next, BtnState.On);
					}
				} else {
					this.mBottomBar.settingButton(NaviBtnName.Next, BtnState.Off);
				}
				break;
			}

			default: {
				this.mBottomBar.settingButton(NaviBtnName.Prev, BtnState.On);
				if (tSceneIdx < tLockIdx) {
					if (tClear) {
						this.mBottomBar.settingButton(NaviBtnName.Next, BtnState.Blink);
					} else {
						this.mBottomBar.settingButton(NaviBtnName.Next, BtnState.On);
					}
				} else {
					this.mBottomBar.settingButton(NaviBtnName.Next, BtnState.Off);
				}
			}
		}
	}

	private receiveMoveScene(evt: CustomEvent) {
		const way = evt.data;
		switch (way) {
			case NaviBtnName.Prev:
				this.prevScene();
				break;
			case NaviBtnName.Next:
				this.nextScene();
				break;
			default:
		}
	}

	//idxNum을 ModeData로 바꾼값을 나타낸다.
	private setModeData(idx: number) {
		let tCnt = 0;

		for (let i = 0; i < this.mSceneAry.length; i++) {
			const tSceneAry = this.mSceneAry[i];
			for (let j = 0; j < tSceneAry.length; j++) {
				Config.isFreeStudy && i == this.mSceneAry.length - 1
					? (idx = tCnt)
					: null;
				if (tCnt <= idx) {
					this.mLockIdx.mMode = i;
					this.mLockIdx.mIdx = j;
				}
				tCnt++;
			}
		}
		return this.mLockIdx;
	}

	//ModeData를 IdxNum로 바꾼값을 나타낸다.
	private getIdxNum(tData: ModeData): number {
		let tCnt = 0;

		for (let i = 0; i < this.mSceneAry.length; i++) {
			const tSceneAry = this.mSceneAry[i];
			for (let j = 0; j < tSceneAry.length; j++) {
				if (tData.mMode == i && tData.mIdx == j) {
					return tCnt;
				}
				tCnt++;
			}
		}
	}

	// 해당씬이 종료되는 경우 호출
	private async receiveScene(evt: CustomEvent) {
		let tCalcu = 1;
		if (SceneNum.SelectScene == 0) tCalcu = 2;
		let tLockIdx = this.getIdxNum(this.mLockIdx);
		const tSceneIdx = this.getIdxNum(this.mCurrentIdx);

		Config.isFreeStudy ? (tLockIdx = 100) : null;

		switch (evt.data) {
			case 'SelectScene': {
				console.log('SelectScene');
				this.mTopBar.reSetTitle();
				await this.onLoadData();
				this.nextScene();
				break;
			}
			case 'Intro': {
				this.mLastPlayNum++;

				this.setModeData(this.mLastPlayNum);
				this.activeTopBar(true);
				this.activeBottomBar(true);
				this.nextScene();
				break;
			}
			case 'StartMode': {
				this.setModeData(this.mLastPlayNum);
				this.activeTopBar(false);
				this.activeBottomBar(false);

				if (!Config.isFreeStudy) {
					await App.Handle.netModule.visitActivity(
						this.mCurrentIdx.mMode - tCalcu,
						this.mCurrentIdx.mIdx,
					);
				}
				break;
			}
			case 'ClearMode': {
				if (tLockIdx === tSceneIdx) this.mLastPlayNum++;
				this.setModeData(this.mLastPlayNum);
				this.activeTopBar(true);
				this.activeBottomBar(true);
				if (!Config.isFreeStudy) {
					await App.Handle.netModule.completeActivity(
						this.mCurrentIdx.mMode - tCalcu,
						this.mCurrentIdx.mIdx,
					);
					await App.Handle.netModule.endStudyData();
					await App.Handle.netModule.saveCache();
				}
				break;
			}
			case 'ClearAlphabet': {
				this.mLastPlayNum++;
				this.nextScene();
				break;
			}
			case 'Quit': {
				this.quitApp();
				break;
			}
			default:
		}
	}

	public async quitApp() {
		// 앱 종료
		if (Config.mobile) {
			App.Handle.exitApp();
		} else {
			if (SceneNum.SelectScene != 0) return;

			PIXISound.stopAll();
			this.mLastPlayNum = 0;
			this.setModeData(this.mLastPlayNum);
			this.activeTopBar(false);
			this.activeBottomBar(false);

			this.mPrevIdx.mMode = this.mCurrentIdx.mMode;
			this.mPrevIdx.mIdx = this.mCurrentIdx.mIdx;
			this.mCurrentIdx.mMode = 0;
			this.mCurrentIdx.mIdx = 0;
			App.Handle.netModule = null;

			this.goScene(this.mCurrentIdx);
		}
	}

	private async receiveTabDown(evt: CustomEvent) {
		const index = evt.data;
		let tLockIdx = 0;
		if (SceneNum.SelectScene == 0) {
			tLockIdx = this.mLockIdx.mMode - 1;
		} else {
			tLockIdx = this.mLockIdx.mMode;
		}

		Config.isFreeStudy ? (tLockIdx = 100) : null;

		switch (index) {
			case 'Quit': {
				this.quitApp();
				break;
			}
			default:
				if (index <= tLockIdx) {
					this.mPrevIdx.mMode = this.mCurrentIdx.mMode;
					this.mPrevIdx.mIdx = this.mCurrentIdx.mIdx;

					if (SceneNum.SelectScene == 0) {
						this.mCurrentIdx.mMode = index + 1;
					} else {
						this.mCurrentIdx.mMode = index;
					}
					this.mCurrentIdx.mIdx = 0;

					this.goScene(this.mCurrentIdx);
				}
		}
	}
}
