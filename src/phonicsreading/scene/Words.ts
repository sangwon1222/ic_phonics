import { App } from '../../com/core/App';
import { SceneBase } from '../../com/core/SceneBase';
import { ObjectBase } from '../../com/core/ObjectBase';
import { Button } from '../../com/widget/Button';
import { EventType } from '../../com/core/EventType';
import { CustomEvent } from '../../com/core/CustomEvent';
import * as Util from '../../com/util/Util';
import { Timer } from '../../com/widget/Timer';
import { Star } from '../../com/widget/Star';
import 'pixi-spine';

// Manager
import { ProductRscManager } from '../../com/manager/ProductRscManager';
import { ViewerRscManager } from '../../com/manager/ViewerRscManager';
import { Rsc, SoundManager } from '../../com/manager/SoundManager';

// Scene
import gsap from 'gsap';
import Config from '@/com/util/Config';
import PhonicsConf from '../PhonicsConf';
import { spine } from 'pixi.js';
import { Effect } from '@/com/widget/Effect';

class TrafficLight extends ObjectBase {
	private mTRedLight: PIXI.Sprite;
	private mTYellowLight: PIXI.Sprite;
	private mTGreenLight: PIXI.Sprite;
	private mLightAry: Array<PIXI.Sprite>;
	private mViewSheet: PIXI.Spritesheet;

	constructor(public mCategory: string) {
		super();
		this.onInit();
	}

	onInit() {
		//
		this.mLightAry = [];
		const tLightTextureAry = [
			'traffic_light_red',
			'traffic_light_yellow',
			'traffic_light_green',
		];

		this.mViewSheet = ViewerRscManager.Handle.getResource(
			'common',
			`word_view2.json`,
		).spritesheet;

		const tTrafficLight = new PIXI.Sprite(
			this.mViewSheet.textures['traffic_light.png'],
		);

		tTrafficLight.anchor.set(0.5);
		tTrafficLight.position.set(Config.width / 2, 101.5);

		App.Handle.addChilds(this, tTrafficLight);

		//0: Red, 1: Yellow, 2: Green
		for (let i = 0; i < tLightTextureAry.length; i++) {
			const tLightSpr = new PIXI.Sprite(
				this.mViewSheet.textures[`${tLightTextureAry[i]}.png`],
			);
			tLightSpr.anchor.set(0.5);
			tLightSpr.position.set(Config.width / 2, 101.5);

			this.mLightAry[i] = tLightSpr;
			App.Handle.addChilds(this, tLightSpr);
		}

		this.onAllLightOff();
	}

	onAllLightOff() {
		for (let i = 0; i < this.mLightAry.length; i++) {
			this.mLightAry[i].visible = false;
		}
	}

	onLightOn(tLightNum: number, tOn?: boolean) {
		this.onAllLightOff();
		let tBool = true;
		tOn == false ? (tBool = false) : (tBool = true);
		tLightNum > 2 ? (tLightNum = 2) : null;
		this.mLightAry[tLightNum].visible = tBool;
	}
}

class Car extends ObjectBase {
	private mCar: PIXI.Sprite;
	private mAniTimeLine: any;
	private mMoveSpeed = 40;
	private mSpeed: number;
	private mTicker: any;
	private mTickerFnc: any;
	public mTick: boolean;
	private mCrash: boolean;
	private mCrashAni: spine.Spine;
	private mViewSheet: PIXI.Spritesheet;

	constructor(public mCategory: string, public mRoadName: string) {
		super();
		this.onInit();
	}

	private onInit() {
		this.mSpeed = 0;
		this.mCrash = false;
		this.mTick = false;

		this.mTicker = PIXI.Ticker.shared;
		this.mTicker.autoStart = false;
		this.mTicker.maxFPS = 30;
		// this.mTicker.add(this.onUpdate);
		this.mTickerFnc = (delta: number) => {
			this.onCarUpdate(delta);
		};
		this.mTicker.add(this.mTickerFnc, PIXI.UPDATE_PRIORITY.NORMAL);

		let tCarName = 'default_car';
		this.mRoadName == 'sea' ? (tCarName = 'sea_car') : null;

		this.mViewSheet = ViewerRscManager.Handle.getResource(
			'common',
			`word_view2.json`,
		).spritesheet;

		this.mCar = new PIXI.Sprite(this.mViewSheet.textures[`${tCarName}.png`]);
		this.mCar.anchor.set(0.5);
		this.mCar.visible = false;
		App.Handle.addChilds(this, this.mCar);

		this.mCrashAni = new PIXI.spine.Spine(
			ViewerRscManager.Handle.getResource(
				this.mCategory,
				`common_explosion.json`,
			).spineData,
		);

		App.Handle.addChilds(this, this.mCrashAni);
	}

	onShowCar() {
		this.mSpeed = 0;
		// if (this.mCar === null) return;
		this.mCar.angle = 0;
		this.mCar.position.set(Config.width / 2, 900);
		this.mCar.visible = true;
		if (this.mAniTimeLine) {
			this.mAniTimeLine.kill();
			this.mAniTimeLine = null;
		}
		this.mAniTimeLine = gsap.timeline();
		this.mAniTimeLine.to(this.mCar, { y: 552.5, duration: 1.5 });
		// this.mTick = true;
	}

	onCarUpdate(t: number) {
		if (!this.mTick) {
			// this.onCarUpdate = () => null;
			return;
		}
		// console.log(this.mCar.y);
		this.mCar.y -= this.mSpeed;
		if (this.mCar.y < -200) {
			this.mTick = false;
			// this.mTicker.stop();
		}

		if (this.mCrash && this.mCar.y < 400) {
			this.mTick = false;
			// this.mTicker.stop();
			this.destroyGsapAni();
			// console.log('폭발' + this.mCategory);
			this.onCrashCarAni();
			//폭발
			// this.mTicker = null;
			// this.mTickerFnc = () => null;
			// this.onCarUpdate = () => null;
		}
	}

	private async onCrashCarAni() {
		this.mCrashAni.position.set(this.mCar.x, this.mCar.y - 100);
		this.mCrashAni.state.setAnimation(0, 'animation', false);

		SoundManager.Handle.getSound(this.mCategory, 'words_bump.mp3').play();
		await App.Handle.tweenMotion('delay', 0.4);
		this.mCar.visible = false;
		await App.Handle.tweenMotion('delay', 0.2);
		this.mCar.visible = true;
	}

	onLeftDrive(tCrash: boolean) {
		this.mCrash = tCrash;
		this.mTick = true;
		// this.mTicker.start();
		this.mSpeed = 0;

		if (this.mAniTimeLine) {
			this.mAniTimeLine.kill();
			this.mAniTimeLine = null;
		}

		this.mAniTimeLine = gsap.timeline();
		this.mAniTimeLine.to(this.mCar, { angle: -20, x: 400, duration: 1 });
		this.mAniTimeLine.to(this.mCar, { angle: 0, duration: 0.5 });
		this.mAniTimeLine.play();

		// gsap.to(this.mCar, { y: -200, duration: 4, ease: 'none' });
		gsap.to(this, { mSpeed: this.mMoveSpeed, duration: 3, ease: 'none' });
	}

	onRightDrive(tCrash: boolean) {
		this.mCrash = tCrash;
		this.mTick = true;
		// this.mTicker.start();
		this.mSpeed = 0;

		if (this.mAniTimeLine) {
			this.mAniTimeLine.kill();
			this.mAniTimeLine = null;
		}

		this.mAniTimeLine = gsap.timeline();
		this.mAniTimeLine.to(this.mCar, { angle: 20, x: 901, duration: 1 });
		this.mAniTimeLine.to(this.mCar, { angle: 0, duration: 0.5 });
		this.mAniTimeLine.play();

		// gsap.to(this.mCar, { x: 851, y: 400, rotation: 0.5, duration: 1 });
		gsap.to(this, { mSpeed: this.mMoveSpeed, duration: 3, ease: 'none' });
	}

	onCenterDrive(tCrash: boolean) {
		this.mCrash = tCrash;
		this.mTick = true;
		// this.mTicker.start();
		this.mSpeed = 0;

		// gsap.to(this.mCar, { x: 851, y: 400, rotation: 0.5, duration: 1 });
		gsap.to(this, { mSpeed: this.mMoveSpeed, duration: 3, ease: 'none' });
	}

	destroyGsapAni() {
		if (this.mAniTimeLine) {
			this.mAniTimeLine.kill();
			this.mAniTimeLine = null;
		}
	}

	destroyTicker() {
		this.mTicker = null;
		this.mTickerFnc = () => null;
		this.onCarUpdate = () => null;
	}
}

class Road extends ObjectBase {
	private mLoadBgAry: Array<PIXI.Sprite>;
	private mLoadLineAry: Array<PIXI.Sprite>;
	private mBarricadeAry: Array<PIXI.Sprite>;
	private mRoadCt: PIXI.Container;
	private mBarricadeCt: PIXI.Container;
	private mMoveSpeed = 30;
	private mSpeed: number;
	private mDeceleration: number;
	private mRoadCnt = 3;
	private mCheckCnt: number;
	private mTicker: any;
	private mTickerFnc: any;
	private mTick: boolean;
	private mRoadCtTop: number;
	private mQuizStart: boolean;
	private mTrafficLight: TrafficLight;
	private mBackBg: PIXI.Graphics;
	private mViewSheet: PIXI.Spritesheet;
	private mViewSheetbg: PIXI.Spritesheet;

	private mIsLock: boolean;

	public mCar: Car;

	get isLock(): boolean {
		return this.mIsLock;
	}

	set isLock(tVal: boolean) {
		this.mIsLock = tVal;
	}

	constructor(public mCategory: string) {
		super();

		this.onInit();
	}

	private onInit() {
		this.mLoadBgAry = [];
		this.mLoadLineAry = [];
		this.mBarricadeAry = [];
		this.mSpeed = this.mMoveSpeed;
		this.mDeceleration = 0;
		// this.mCheckCnt = this.mRoadCnt;
		this.mCheckCnt = 2;
		this.mRoadCtTop = 65;
		this.mQuizStart = true;
		this.mTick = false;

		this.mTicker = PIXI.Ticker.shared;
		this.mTicker.autoStart = false;
		this.mTicker.maxFPS = 30;
		this.mTickerFnc = (delta: number) => {
			this.onUpdate(delta);
		};
		this.mTicker.add(this.mTickerFnc, PIXI.UPDATE_PRIORITY.NORMAL);

		const tBgAry = ['forest', 'sea', 'winter'];
		const tRandomValue = Math.floor(Math.random() * tBgAry.length);

		console.log(
			`### tRandomValue = ${tRandomValue} ${tBgAry[tRandomValue]}_bg_1.png`,
		);
		this.mViewSheetbg = ViewerRscManager.Handle.getResource(
			'common',
			`word_view1.json`,
		).spritesheet;

		this.mViewSheet = ViewerRscManager.Handle.getResource(
			'common',
			`word_view2.json`,
		).spritesheet;

		let tSkinStr = '';
		if (
			PhonicsConf.wordsActBg === null ||
			PhonicsConf.wordsActBg === undefined ||
			PhonicsConf.wordsActBg === ''
		) {
			tSkinStr = tBgAry[tRandomValue];
			PhonicsConf.wordsActBg = tSkinStr;
		} else {
			tSkinStr = PhonicsConf.wordsActBg;
		}

		console.log(`### ${tSkinStr}`);
		console.log(`${tBgAry[tRandomValue]}_bg_1.png`);
		this.mRoadCt = new PIXI.Container();
		const tBg1 = new PIXI.Sprite(
			tSkinStr === 'winter'
				? this.mViewSheet.textures[`${tSkinStr}_bg_1.png`]
				: this.mViewSheetbg.textures[`${tSkinStr}_bg_1.png`],
		);
		this.mLoadBgAry[0] = tBg1;
		// this.mLoadBgAry[0].y = 0;
		// this.mLoadBgAry[0].anchor.set(0.5);
		// this.mLoadBgAry[0].position.set(Config.width / 2, Config.height / 2);

		const tBg2 = new PIXI.Sprite(
			tSkinStr === 'winter'
				? this.mViewSheet.textures[`${tSkinStr}_bg_2.png`]
				: this.mViewSheetbg.textures[`${tSkinStr}_bg_2.png`],
		);
		this.mLoadBgAry[1] = tBg2;
		// this.mLoadBgAry[1].anchor.set(0.5);
		// this.mLoadBgAry[1].position.set(
		// 	Config.width / 2,
		// 	Config.height / 2 + this.mLoadBgAry[0].height,
		// );
		this.mLoadBgAry[1].y = -688;

		const tBg3 = new PIXI.Sprite(
			tSkinStr === 'winter'
				? this.mViewSheet.textures[`${tSkinStr}_bg_1.png`]
				: this.mViewSheetbg.textures[`${tSkinStr}_bg_1.png`],
		);
		this.mLoadBgAry[2] = tBg3;
		this.mLoadBgAry[2].y = -688 * 2;

		App.Handle.addChilds(this.mRoadCt, this.mLoadBgAry[0]);
		App.Handle.addChilds(this.mRoadCt, this.mLoadBgAry[1]);
		App.Handle.addChilds(this.mRoadCt, this.mLoadBgAry[2]);

		for (let i = 0; i < 3; i++) {
			const tLine = new PIXI.Sprite(this.mViewSheet.textures['line.png']);
			tLine.y = -688 * i;
			App.Handle.addChilds(this.mRoadCt, tLine);
			this.mLoadLineAry[i] = tLine;
		}

		const tQuizLine = new PIXI.Sprite(
			this.mViewSheet.textures['stop_line.png'],
		);
		tQuizLine.y = -688;
		tQuizLine.visible = false;
		App.Handle.addChilds(this.mRoadCt, tQuizLine);
		this.mLoadLineAry[3] = tQuizLine;

		this.mBarricadeCt = new PIXI.Container();
		const tBarPosX = [376.5, 650.5, 923.5];
		for (let i = 0; i < 3; i++) {
			const tBarricade = new PIXI.Sprite(
				this.mViewSheet.textures['barricade.png'],
			);
			tBarricade.anchor.set(0.5);
			tBarricade.position.set(tBarPosX[i], 252 - 688);

			App.Handle.addChilds(this.mBarricadeCt, tBarricade);
			this.mBarricadeAry[i] = tBarricade;
		}
		this.mBarricadeCt.visible = false;
		App.Handle.addChilds(this.mRoadCt, this.mBarricadeCt);

		this.mRoadCt.y = this.mRoadCtTop;

		// const debug = new PIXI.Graphics();
		// debug.lineStyle(2, 0xff0000, 1);
		// debug.drawRect(tBg1.x, tBg1.y, tBg1.width, tBg1.height);
		// App.Handle.addChilds(this.mRoadCt, debug);

		App.Handle.addChilds(this, this.mRoadCt);

		// this.mScrollRoadAry = [...this.mLoadBgAry];
		// this.mScrollRoadAry.push(this.mLoadBgAry[0]);

		// this.mTicker = () => this.scrollingRoad();
		// gsap.ticker.add(this.scrollingRoad);

		this.mCar = new Car(this.mCategory, tSkinStr);
		App.Handle.addChilds(this, this.mCar);
		this.mCar.onShowCar();

		this.mBackBg = new PIXI.Graphics();
		this.mBackBg.beginFill(0x000000, 0.7);
		this.mBackBg.drawRect(0, 0, App.Handle.appWidth, App.Handle.appHeight);
		this.mBackBg.endFill();
		this.mBackBg.visible = false;
		this.addChild(this.mBackBg);

		this.mTrafficLight = new TrafficLight(this.mCategory);
		App.Handle.addChilds(this, this.mTrafficLight);
		this.mTrafficLight.onLightOn(2);

		// App.Handle.ticker.add(this.mTickerFnc, PIXI.UPDATE_PRIORITY.NORMAL);
		// this.mTicker.add(time => {
		// 	this.onUpdate(time);
		// });
		this.mTick = true;
		// this.mTicker.start();
	}

	onUpdate(t: number) {
		if (!this.mTick) return;

		const tHeight = 688;
		// const tHeight = this.mLoadBgAry[0].height;
		this.mRoadCt.y += this.mSpeed * t;

		// 달리는 거리에 따른 분기 처리를 나타낸다.
		if (this.mRoadCt.y > tHeight * 2 + this.mRoadCtTop) {
			if (!this.mQuizStart) return;
			this.mRoadCt.y = this.mRoadCtTop;
			!this.mIsLock ? this.mCheckCnt-- : null;
			// !this.mIsLock ? this.mCheckCnt-- : (this.mCheckCnt = 2);
			if (this.mCheckCnt === this.mRoadCnt - 1) {
				this.mLoadLineAry[1].visible = true;
				this.mLoadLineAry[3].visible = false;
				this.mBarricadeCt.visible = false;
			}
			if (this.mCheckCnt === 1) {
				this.mTrafficLight.onLightOn(1);
			}
			if (this.mCheckCnt <= 0) {
				this.mLoadLineAry[1].visible = false;
				this.mLoadLineAry[3].visible = true;
				this.mDeceleration = 0.8;
				this.mBarricadeCt.visible = true;
				//
				SoundManager.Handle.getSound(this.mCategory, 'words_stop.mp3').play();
			}
		}

		// 감속값이 있을때의 처리를 나타낸다.
		if (this.mDeceleration > 0) {
			this.mSpeed -= this.mDeceleration;
			this.mSpeed < 5 ? (this.mSpeed = 5) : null;
			if (this.mRoadCt.y > tHeight + this.mRoadCtTop - 20) {
				this.mSpeed = 0;
				this.mDeceleration = 0;
				this.mCheckCnt = this.mRoadCnt;
				this.mTrafficLight.onLightOn(0);
				// console.log('!! Stop Car~!!!!!!!!');
				// App.Handle.ticker.stop();
				// App.Handle.ticker.remove(this.mTickerFnc);
				this.mTick = false;
				// this.mTicker.stop();
				// this.mTicker.remove(this.mTickerFnc);
				//
				this.dispatchEvent(EventType.ReceiveData, 'SetQuest');
			}
		}
	}

	quizInit(tBool: boolean) {
		//
		this.mBackBg.visible = tBool;
	}

	// 바리케이트 보여주기를 나타낸다.
	onHideBarricade(tIdx: number) {
		// this.mBarricadeAry[tIdx].visible = tBool;
		let tPosX = 0;
		tIdx === 0 ? (tPosX = 200) : (tPosX = Config.width - 200);
		gsap.to(this.mBarricadeAry[tIdx], { x: tPosX, alpha: 0, duration: 0.5 });
	}

	//퀴즈 끝내고 다시 달리기 시작을 나타낸다.
	async onRollingStart() {
		this.mTick = true;
		// this.mTicker.start();
		// this.mCar.mTick = false;

		// if (this.mCar.y > 0) {
		this.mCar.mTick = false;
		this.mCar.destroyGsapAni();
		// }
		this.mCar.visible = false;
		// this.mCar.position.set(Config.width / 2, 900);

		this.mTrafficLight.onLightOn(2);
		gsap.to(this, { mSpeed: this.mMoveSpeed, duration: 3, ease: 'none' });

		await App.Handle.tweenMotion('delay', 2.5);

		const tBarPosX = [376.5, 650.5, 923.5];
		for (let i = 0; i < this.mBarricadeAry.length; i++) {
			this.mBarricadeAry[i].alpha = 1;
			this.mBarricadeAry[i].x = tBarPosX[i];
		}

		this.mCar.visible = true;
		this.mCar.onShowCar();
		// this.mLoadLineAry[1].visible = true;
		// this.mLoadLineAry[3].visible = false;
		// this.mBarricadeCt.visible = false;
	}

	destroyTicker() {
		this.mTicker = null;
		this.mTickerFnc = () => null;
		this.onUpdate = () => null;
	}
}

export class Words extends SceneBase {
	private mCloseBtn: Button;
	private mRoad: Road;
	private mCountTxt: PIXI.Text;
	private mCountNum: number;

	private mTicker: any;
	private mTickerFnc: any;
	private mTick: boolean;

	private mScoreStarCt: PIXI.Container;
	private mScoreStarBg: Array<Star>;
	private mScoreStar: Array<Star>;
	private mFinStarCnt = 4;

	private mQuestImg: PIXI.Sprite;
	private mAnswerBoardAry: Array<PIXI.Sprite>;
	private mBoardCtAry: Array<PIXI.Container>;
	private mQuestNum: number;
	private mQuestWordAry: Array<string>;
	private mQuestWordOriAry: Array<string>;
	private mQuestWord: string;
	private mWrongWord: string;

	private mEopNum: number;
	private mAniTimeLine: any;
	private mTrueDirectionCt: PIXI.Container;
	private mTrueDirectionSp: PIXI.Sprite;
	private mIsShowTrue: boolean;
	private mSpeechBubbleSp: PIXI.AnimatedSprite;
	private mIsQuest: boolean;
	private mFingerSp: PIXI.Sprite;
	private mTimeOutHnd: Timer;
	private mGuideNum: number;
	private mQuestTimeOutHnd: Timer;
	private mViewSheet: PIXI.Spritesheet;
	private mWordViewSheet: PIXI.Spritesheet;
	private mBtnEffSpine: spine.Spine;
	private mEffect: Effect;

	constructor() {
		super();
		this.name = 'Words';

		this.sortableChildren = true; // zIndex 처리를 위한 준비과정을 나타낸다.
	}

	async onInit() {
		//

		console.log(this.name);

		this.mAnswerBoardAry = [];
		this.mBoardCtAry = [];
		this.mCountNum = 10;
		this.mQuestNum = 0;
		this.mGuideNum = 0;
		this.mQuestWord = '';
		this.mWrongWord = '';

		this.mTick = false;

		// this.mTicker = PIXI.Ticker.shared;
		// this.mTicker.autoStart = false;
		// this.mTicker.maxFPS = 30;
		// // this.mTicker.add(this.onUpdate);
		// this.mTickerFnc = (delta: number) => {
		// 	this.onQuestUpdate(delta);
		// };
		// console.log('this.onQuestUpdate(10);');
		// this.onQuestUpdate(10);
		// App.Handle.ticker.add(this.mTickerFnc, PIXI.UPDATE_PRIORITY.NORMAL);
		// App.Handle.ticker.start();
		// this.mTicker.add(this.mTickerFnc, PIXI.UPDATE_PRIORITY.NORMAL);

		this.selectEop();

		this.mViewSheet = ViewerRscManager.Handle.getResource(
			'common',
			`ap_view.json`,
		).spritesheet;

		this.mWordViewSheet = ViewerRscManager.Handle.getResource(
			'common',
			`word_view2.json`,
		).spritesheet;

		this.mRoad = new Road(this.name);
		App.Handle.addChilds(this, this.mRoad, true);
		this.mRoad.addCustomEventListener(EventType.ReceiveData, evt =>
			this.eventReceive(evt),
		);

		this.mRoad.isLock = true;

		const tStyle = new PIXI.TextStyle({
			align: 'center',
			fill: '0xffffff',
			fontFamily: 'minigate Bold ver2',
			fontWeight: 'normal',
			fontSize: 35,
			padding: 10,
		});
		this.mCountTxt = new PIXI.Text('00');
		this.mCountTxt.style = tStyle;
		this.mCountTxt.anchor.set(0, 0.5);
		this.mCountTxt.position.set(531.3, 106.8);
		App.Handle.addChilds(this, this.mCountTxt);

		this.mScoreStarCt = new PIXI.Container();
		this.mScoreStarCt.position.set(App.Handle.appWidth - 196, 88.5);
		const tScoreBgImg = new PIXI.Sprite(
			this.mWordViewSheet.textures['star_bg.png'],
		);
		tScoreBgImg.position.set(0, 0);
		// this.mScoreStarCt.addChild(tScoreBgImg);
		// const tScoreBgImg1 = new PIXI.Sprite(
		// 	ViewerRscManager.Handle.getResource(this.name, 'star_bg.png').texture,
		// );
		// tScoreBgImg1.anchor.set(0.5);
		// tScoreBgImg1.position.set(1169, 113.5);
		// App.Handle.addChilds(this, tScoreBgImg1, true);
		App.Handle.addChilds(this.mScoreStarCt, tScoreBgImg, true);

		const tEdgeImg = new PIXI.NineSlicePlane(
			this.mViewSheet.textures['edge.png'],
			50,
			50,
			50,
			50,
		);
		tEdgeImg.width = App.Handle.appWidth;
		tEdgeImg.height = App.Handle.appHeight - 64;
		tEdgeImg.position.set(0, 64);
		// this.addChild(tEdgeImg);
		App.Handle.addChilds(this, tEdgeImg);

		this.mScoreStarBg = [];
		for (let i = 0; i < this.mFinStarCnt; i++) {
			const star = new Star(this.mViewSheet.textures['star_off.png'], true);
			star.anchor.set(0.5);
			star.position.set(27 + i * 38, 22);
			// tScoreBgImg.addChild(star);
			App.Handle.addChilds(tScoreBgImg, star, true);
			this.mScoreStarBg.push(star);
		}
		this.mScoreStar = [];
		for (let i = 0; i < this.mFinStarCnt; i++) {
			const star = new Star(this.mViewSheet.textures['star.png'], false);
			star.anchor.set(0.5);
			star.position.set(27 + i * 38, 22);
			// tScoreBgImg.addChild(star);
			App.Handle.addChilds(tScoreBgImg, star, true);
			this.mScoreStar.push(star);
		}
		// this.mScoreStar[0].changeState()
		// this.addChild(this.mScoreStarCt);
		App.Handle.addChilds(this, this.mScoreStarCt, true);

		// this.mBtnEffSpine = new PIXI.spine.Spine(
		// 	ViewerRscManager.Handle.getResource(
		// 		'common',
		// 		`click_effect.json`,
		// 	).spineData,
		// );
		// this.mBtnEffSpine.visible = false;
		// this.mBtnEffSpine.zIndex = 10;
		// App.Handle.addChilds(this, this.mBtnEffSpine);

		this.mEffect = new Effect();
		this.mEffect.zIndex = 3;
		App.Handle.addChilds(this, this.mEffect);

		this.mQuestWordAry = [
			...(ProductRscManager.Handle.getResource(this.name, 'studywords') as any),
		];
		this.mQuestWordOriAry = [...this.mQuestWordAry];

		this.dispatchEvent(EventType.ReceiveData, 'StartMode');
	}

	async onStart() {
		await this.preLoadSound();

		// SoundManager.Handle.play(this.name, 'pr_wo_dic.mp3');

		this.mTrueDirectionCt = new PIXI.Container();
		// this.mAlphabetSpine.state.timeScale = 1;

		const tTrueTrueSheet = ViewerRscManager.Handle.getResource(
			'common',
			`ap_view.json`,
		).spritesheet;

		this.mTrueDirectionSp = new PIXI.Sprite(
			tTrueTrueSheet.textures['truetrue.png'],
		);
		// this.mTrueDirectionSp = new PIXI.Sprite(
		// 	ViewerRscManager.Handle.getResource('common', 'truetrue.png').texture,
		// );
		this.mTrueDirectionSp.position.set(-130, 225);
		this.mTrueDirectionSp.anchor.set(0.2, 0.5);
		// this.mTrueDirectionSp.rotation = 0.5;
		// tTrueDirectionCt.addChild(this.mTrueDirectionSp);
		App.Handle.addChilds(this.mTrueDirectionCt, this.mTrueDirectionSp, true);

		this.mSpeechBubbleSp = new PIXI.AnimatedSprite(
			tTrueTrueSheet.animations['speechBubble'],
		);
		this.mSpeechBubbleSp.animationSpeed = 0.06;
		this.mSpeechBubbleSp.play();
		// this.mSpeechBubbleSp = new PIXI.Sprite(
		// 	ViewerRscManager.Handle.getResource('common', 'speechBubble.png').texture,
		// );
		this.mSpeechBubbleSp.position.set(47.5, 154.5);
		this.mSpeechBubbleSp.visible = false;
		// tTrueDirectionCt.addChild(this.mSpeechBubbleSp);
		App.Handle.addChilds(this.mTrueDirectionCt, this.mSpeechBubbleSp, true);
		// this.mClearObj.push(tTrueDirectionCt);

		this.mTrueDirectionCt.interactive = true;
		this.mTrueDirectionCt.on('pointertap', (evt: PIXI.InteractionEvent) => {
			if (this.mIsShowTrue) {
				// console.log(`tTrueDirectionCt TAB`);
			} else {
				this.showTrueTrue();
			}
		});

		// this.addChild(tTrueDirectionCt);
		App.Handle.addChilds(this, this.mTrueDirectionCt, true);

		// this.mAlphabet.makeStroke();

		this.showTrueTrue();
	}

	//사운드 미리 불러오기를 나타낸다.
	private async preLoadSound() {
		if (window['Android']) {
			if (App.Handle.loading === null || App.Handle.loading === undefined)
				window['Android'].showLoading();
		}
		const tPreSnds = [];

		const tSnds = [];
		tSnds.push([Rsc.viewer, 'common', 'button_click.mp3']);
		tSnds.push([Rsc.viewer, this.name, 'pr_wo_dic.mp3']);
		tSnds.push([Rsc.viewer, 'common', `eop_${this.mEopNum}.mp3`]);
		tSnds.push([Rsc.viewer, 'common', `eop_sfx.mp3`]);
		tSnds.push([Rsc.viewer, 'common', 'gain_star.mp3']);
		tSnds.push([Rsc.viewer, this.name, `words_correct.mp3`]);
		tSnds.push([Rsc.viewer, this.name, `words_wrong.mp3`]);
		tSnds.push([Rsc.viewer, this.name, `words_moving.mp3`]);
		tSnds.push([Rsc.viewer, this.name, `words_bump.mp3`]);
		tSnds.push([Rsc.viewer, this.name, `words_stop.mp3`]);
		tSnds.push([Rsc.viewer, this.name, `words_popup.mp3`]);
		tSnds.push([Rsc.product, 'common', `${this.mQuestWordAry[0]}.mp3`]);
		tSnds.push([Rsc.product, 'common', `${this.mQuestWordAry[1]}.mp3`]);
		tSnds.push([Rsc.product, 'common', `${this.mQuestWordAry[2]}.mp3`]);
		tSnds.push([Rsc.product, 'common', `${this.mQuestWordAry[3]}.mp3`]);
		await SoundManager.Handle.loadSounds(tSnds);

		tPreSnds.push([Rsc.viewer, 'common', 'activity_bgm.mp3', true, true]);
		tPreSnds.push([Rsc.viewer, 'common', 'intro_bgm.mp3', false]);
		await SoundManager.Handle.loadPreSounds(tPreSnds);
		if (window['Android']) {
			if (App.Handle.loading === null || App.Handle.loading === undefined) {
				window['Android'].hideLoading();
			} else {
				App.Handle.loading.remove();
				App.Handle.loading.destroy();
				App.Handle.loading = null;
			}
		} // 아이스크림 기기 내장 함수 호출
	}

	//EOP 랜덤 선택값을 나타낸다.
	private selectEop() {
		this.mEopNum = Math.floor(Math.random() * 6 + 1);
	}

	private async setTrueMotion(down: boolean) {
		if (this.mAniTimeLine) {
			this.mAniTimeLine.kill();
			this.mAniTimeLine = null;
		}
		let delay = 0;
		let tCnt = 0;
		down ? (tCnt = 3) : (tCnt = 3);
		this.mAniTimeLine = gsap.timeline({});
		this.mAniTimeLine.to(this.mTrueDirectionSp, {
			rotation: 0.1 * Math.PI,
			duration: 0.7,
			repeat: tCnt,
			yoyo: true,
		});

		if (down) {
			this.mAniTimeLine.to(this.mTrueDirectionSp, {
				rotation: 0.5,
				duration: 0.3,
			});

			this.mAniTimeLine.to(this.mTrueDirectionSp, { x: -130, duration: 0.3 });
			delay = 0.6 + 0.7 * tCnt;
		} else {
			delay = 0.3 + 0.7 * tCnt;
		}
		// console.log(delay, tCnt);
		await App.Handle.tweenMotion('delay', delay);
	}

	//뚜루뚜루 디렉션 캐릭터가 나타나 설명하는 애니메이션 처리를 나타낸다.
	private async showTrueTrue() {
		const downY = -130;
		const upY = -30;

		// this.mTick = false;
		this.mFingerSp != null ? this.hideFingerGuide() : null;
		this.mQuestTimeOutHnd?.pause();
		// this.mTimeOutHnd?.pause();

		this.mTrueDirectionSp.x = downY;

		App.Handle.pauseStageObjs();

		this.mIsShowTrue = true;
		this.mRoad.isLock = true;
		this.mSpeechBubbleSp.visible = false;

		this.mTrueDirectionSp.rotation = 0;
		gsap.to(this.mTrueDirectionSp, { x: upY, duration: 0.3 });

		this.setTrueMotion(true);
		const tDirection01 = SoundManager.Handle.getSound(
			this.name,
			`pr_wo_dic.mp3`,
		);
		tDirection01.play();
		await App.Handle.tweenMotion('delay', tDirection01.duration + 0.2);
		// this.mAlphabet.showTracingGuide();
		// this.mAlphabet.isLock = false;
		// this.mTick = true;
		this.mRoad.isLock = false;
		// this.mRoad.onRollingStart();

		this.mIsShowTrue = false;
		if (this.mIsQuest) {
			App.Handle.playStageObjs();
			this.mSpeechBubbleSp.visible = true;
			this.mQuestTimeOutHnd?.resume();
			// this.mTimeOutHnd?.resume();
		}
	}

	//문제 화면 만들기를 나타낸다.
	private async setQuest() {
		// this.mCountNum = 10;

		await App.Handle.tweenMotion('delay', 0.5);
		this.mIsQuest = true;
		this.mRoad.quizInit(true);

		SoundManager.Handle.getSound(this.name, 'words_popup.mp3').play();
		// this.mQuestWordAry = [
		// 	...(ProductRscManager.Handle.getResource(this.name, 'studywords') as any),
		// ];
		if (this.mQuestWord === '')
			this.mQuestWordAry = Util.shuffleArray(this.mQuestWordAry);

		// console.log('setQuest = ' + this.mQuestWordAry);
		// const tRandomNum = Math.floor(Math.random() * this.mQuestWordAry.length);
		this.mQuestWord = this.mQuestWordAry[0];

		const tQuestCt = new PIXI.Container();
		const tQuestBoard = new PIXI.Sprite(
			this.mWordViewSheet.textures['question_box.png'],
		);

		tQuestBoard.anchor.set(0.5);
		tQuestBoard.position.set(640, 288);
		tQuestBoard.alpha = 0;
		// App.Handle.addChilds(this, tQuestBoard);

		this.mAnswerBoardAry = [];
		const tAnswerBoardPosX = [294, 998];
		for (let i = 0; i < 2; i++) {
			const tAnswerBoard = new PIXI.Sprite(
				this.mWordViewSheet.textures['ex_bgbox.png'],
			);
			tAnswerBoard.anchor.set(0.5);
			tAnswerBoard.position.set(tAnswerBoardPosX[i], 548);
			tAnswerBoard.alpha = 0;
			this.mAnswerBoardAry[i] = tAnswerBoard;
		}

		this.mQuestImg = new PIXI.Sprite(
			ProductRscManager.Handle.getResource(
				this.name,
				`${this.mQuestWord}.png`,
			).texture,
		);
		this.mQuestImg.anchor.set(0.5);
		this.mQuestImg.position.set(640, 288);
		this.mQuestImg.visible = false;

		// tQuestCt.addChild(tQuestBoard);
		// tQuestCt.addChild(this.mQuestImg);
		// this.addChild(tQuestCt);
		App.Handle.addChilds(tQuestCt, tQuestBoard, true);
		App.Handle.addChilds(tQuestCt, this.mQuestImg, true);
		App.Handle.addChilds(this, tQuestCt, true);
		// tQuestCt.addChild(tQuestBoard);
		// tQuestCt.addChild(this.mQuestImg);
		// this.addChild(tQuestCt);
		this.mBoardCtAry[2] = tQuestCt;

		tQuestCt.interactive = true;
		tQuestCt.buttonMode = true;
		tQuestCt.on('pointertap', (evt: PIXI.InteractionEvent) => {
			SoundManager.Handle.getSound('common', `${this.mQuestWord}.mp3`).play();
			gsap.to(this.mQuestImg.scale, {
				x: 1.05,
				y: 1.05,
				duration: 0.3,
				repeat: 1,
				yoyo: true,
			});
			this.mEffect.createEffect(evt);
		});

		const tStyle = new PIXI.TextStyle({
			align: 'center',
			fill: '0xffffff',
			fontFamily: 'minigate Bold ver2',
			fontWeight: 'normal',
			fontSize: 58,
			padding: 10,
		});

		const tRndNum = Math.floor(Math.random() * 2);
		const tAnswerTxt = new PIXI.Text(this.mQuestWord);
		tAnswerTxt.style = tStyle;
		tAnswerTxt.anchor.set(0.5);
		tAnswerTxt.position.set(tAnswerBoardPosX[tRndNum], 548);
		tAnswerTxt.visible = false;

		if (this.mWrongWord === '') {
			let tTempWordAry = [...this.mQuestWordOriAry];
			const tQuestIndexNum = this.mQuestWordOriAry.indexOf(this.mQuestWord);
			tTempWordAry.splice(tQuestIndexNum, 1);
			this.mWrongWord =
				tTempWordAry[Math.floor(Math.random() * tTempWordAry.length)];
		}
		let tWrongNum = 0;
		tRndNum === 0 ? (tWrongNum = 1) : null;
		// const tWrongAnswerSpr = new PIXI.Sprite(
		// 	this.mWordViewSheet.textures['wrong_box.png'],
		// );
		// tWrongAnswerSpr.anchor.set(0.5);
		// tWrongAnswerSpr.position.set(tAnswerBoardPosX[tWrongNum], 548);
		// tWrongAnswerSpr.visible = false;
		const tWrongTxt = new PIXI.Text(this.mWrongWord);
		tWrongTxt.style = tStyle;
		tWrongTxt.anchor.set(0.5);
		tWrongTxt.position.set(tAnswerBoardPosX[tWrongNum], 548);
		tWrongTxt.visible = false;

		const tWrongCt = new PIXI.Container();
		// tWrongCt.addChild(this.mAnswerBoardAry[tWrongNum]);
		// tWrongCt.addChild(tWrongAnswerSpr);
		// this.addChild(tWrongCt);
		App.Handle.addChilds(tWrongCt, this.mAnswerBoardAry[tWrongNum]);
		App.Handle.addChilds(tWrongCt, tWrongTxt);
		App.Handle.addChilds(this, tWrongCt, true);

		this.mBoardCtAry[tWrongNum] = tWrongCt;

		tWrongCt.interactive = true;
		tWrongCt.buttonMode = true;
		tWrongCt.on('pointertap', (evt: PIXI.InteractionEvent) => {
			this.selectWrongAnswer(tWrongNum);
			this.mEffect.createEffect(evt);
		});

		const tCorrectCt = new PIXI.Container();
		const tCorrectNum = 1 - tWrongNum;
		// tCorrectCt.addChild(this.mAnswerBoardAry[tCorrectNum]);
		// tCorrectCt.addChild(tAnswerTxt);
		// this.addChild(tCorrectCt);
		App.Handle.addChilds(tCorrectCt, this.mAnswerBoardAry[tCorrectNum]);
		App.Handle.addChilds(tCorrectCt, tAnswerTxt);
		App.Handle.addChilds(this, tCorrectCt, true);

		this.mBoardCtAry[tCorrectNum] = tCorrectCt;

		tCorrectCt.interactive = true;
		tCorrectCt.buttonMode = true;
		tCorrectCt.on('pointertap', (evt: PIXI.InteractionEvent) => {
			SoundManager.Handle.getSound('common', `${this.mQuestWord}.mp3`).play();
			this.selectCorrectAnswer(tCorrectNum);
			this.mEffect.createEffect(evt);
		});

		tQuestBoard.y = -88;
		gsap.to(tQuestBoard, { alpha: 1, duration: 1 });
		gsap.to(tQuestBoard, { y: 288, duration: 0.5 });

		this.mAnswerBoardAry[0].x = -94;
		this.mAnswerBoardAry[1].x = 1298;
		gsap.to(this.mAnswerBoardAry[0], { alpha: 1, duration: 0.5 });
		gsap.to(this.mAnswerBoardAry[0], { x: tAnswerBoardPosX[0], duration: 0.5 });
		gsap.to(this.mAnswerBoardAry[1], { alpha: 1, duration: 0.5 });
		gsap.to(this.mAnswerBoardAry[1], { x: tAnswerBoardPosX[1], duration: 0.5 });

		await App.Handle.tweenMotion('delay', 0.5);

		this.mQuestImg.visible = true;
		tAnswerTxt.visible = true;
		tWrongTxt.visible = true;

		SoundManager.Handle.getSound('common', `${this.mQuestWord}.mp3`).play();

		this.mCountNum = 11;
		// this.mTicker.add(time => {
		// 	this.onUpdate(time);
		// }, this);
		this.mTick = true;
		// this.mTicker.start();
		this.onQuestUpdate();

		App.Handle.playStageObjs();
		this.mSpeechBubbleSp.visible = true;

		this.mFingerSp = new PIXI.Sprite(this.mViewSheet.textures['finger.png']);
		this.mFingerSp.visible = false;
		// this.addChild(this.mFingerSp);
		App.Handle.addChilds(this, this.mFingerSp);

		this.mGuideNum = 0;
		this.showFingerGuide();
		// console.log('setQuest End');
	}

	//오답 선택시 처리를 나타낸다.
	private async selectWrongAnswer(tIdx: number) {
		// console.log('selectWrongAnswer');
		this.hideFingerGuide();
		App.Handle.pauseStageObjs();
		this.mSpeechBubbleSp.visible = false;
		this.mTick = false;

		SoundManager.Handle.getSound(this.name, 'words_wrong.mp3').play();
		await App.Handle.tweenMotion('delay', 1);
		// this.mTicker?.stop();
		this.endQuest(tIdx, true);
	}

	//정답 선택시 처리를 나타낸다.
	private async selectCorrectAnswer(tIdx: number) {
		// console.log('selectCorrectAnswer');
		this.hideFingerGuide();
		App.Handle.pauseStageObjs();
		this.mSpeechBubbleSp.visible = false;
		this.mTick = false;
		// this.mTicker?.stop();

		SoundManager.Handle.getSound(this.name, 'words_correct.mp3').play();
		await App.Handle.tweenMotion('delay', 1);
		// await this.mScoreStar[this.mQuestNum].showStar();
		// await App.Handle.tweenMotion('delay', 1);

		this.endQuest(tIdx, false);

		this.mWrongWord = '';
		this.mQuestWordAry.splice(0, 1); // 맞춘문제 삭제를 나타낸다.
	}

	//문제가 끝났을때 처리를 나타낸다.
	private async endQuest(tIdx: number, tCrash: boolean) {
		//
		this.mTick = false;

		App.Handle.pauseStageObjs();
		this.mSpeechBubbleSp.visible = false;
		// this.mTicker?.stop();

		this.mRoad.quizInit(false);
		gsap.to(this.mBoardCtAry[2], { alpha: 0, duration: 1 });
		gsap.to(this.mBoardCtAry[2], { y: -300, duration: 0.5 });

		gsap.to(this.mBoardCtAry[0], { alpha: 0, duration: 0.5 });
		gsap.to(this.mBoardCtAry[0], { x: -300, duration: 0.5 });
		gsap.to(this.mBoardCtAry[1], { alpha: 0, duration: 0.5 });
		gsap.to(this.mBoardCtAry[1], { x: 300, duration: 0.5 });

		await App.Handle.tweenMotion('delay', 1);

		// 바리케이트 애니메이션 처리를 나타낸다.
		if (!tCrash) {
			switch (tIdx) {
				case 0:
					await this.mRoad.onHideBarricade(0);
					break;
				case 1:
					await this.mRoad.onHideBarricade(2);
					break;
				default:
			}
		}
		await App.Handle.tweenMotion('delay', 0.5);

		//tIdx => 0 = Left, 1 = Right, 2 = Center 방향에 따른 자동차 처리를 나타낸다.
		SoundManager.Handle.getSound(this.name, 'words_moving.mp3').play();
		switch (tIdx) {
			case 0:
				this.mRoad.mCar.onLeftDrive(tCrash);
				break;
			case 1:
				this.mRoad.mCar.onRightDrive(tCrash);
				break;
			default:
				this.mRoad.mCar.onCenterDrive(true);
		}

		//정답시 별스코어 보이게 처리를 나타낸다.
		if (!tCrash) {
			await App.Handle.tweenMotion('delay', 2);
			await this.mScoreStar[this.mQuestNum].showStar();
			this.mScoreStarBg[this.mQuestNum].hideStar();
			this.mQuestNum++;
			await App.Handle.tweenMotion('delay', 1);
		} else {
			await App.Handle.tweenMotion('delay', 2);
		}

		this.mQuestTimeOutHnd?.clear();
		this.mQuestTimeOutHnd = null;
		if (this.mQuestNum > 3) {
			this.clearActivity();
		} else {
			this.mRoad.mCar.destroyGsapAni();
			this.mRoad.onRollingStart();
			this.mCountNum = 0;
			this.mCountTxt.x = 531.3;
			this.mCountTxt.text = '00';
		}
		this.mIsQuest = false;
	}

	// 10초마다 손가락 디렉션 보여주기를 나타낸다.
	private startQuestTimeOut(tTime: number) {
		this.mQuestTimeOutHnd = new Timer(() => {
			this.onQuestUpdate();
		}, 1000 * tTime);
	}

	//문제풀이 시간 10초를 나타낸다.
	private async onQuestUpdate() {
		//
		// console.log(this.mCountNum, this.mCountNum);
		if (!this.mTick) return;
		if (this.mIsShowTrue) return;

		// console.log(this.mCountNum, this.mCountNum, tTime);

		this.mCountNum--;

		this.mQuestTimeOutHnd?.clear();
		this.mQuestTimeOutHnd = null;
		if (this.mCountNum < 0) {
			this.mCountNum = 0;
			// console.log('End');
			// App.Handle.ticker?.stop();
			// App.Handle.ticker.remove(this.mTickerFnc);
			// await App.Handle.tweenMotion('delay', 1);
			this.endQuest(2, true);
			// this.mTicker?.remove(this.mTickerFnc);
			// this.mTicker?.destroy();
			// this.mTickerFnc = null;
			// this.mTicker = null;
			// PIXI.Ticker.shared.remove(this.mTicker);
		} else {
			this.startQuestTimeOut(1);
		}
		let tPosX = 538.3;
		this.mCountNum < 10 ? (tPosX = 531.3) : null;
		this.mCountTxt.x = tPosX;
		this.mCountTxt.text = `${Util.addZero(this.mCountNum, 2)}`;
	}

	// 10초마다 손가락 디렉션 보여주기를 나타낸다.
	private startTimeOut(tTime: number) {
		// this.mTimeOutHnd = setTimeout(() => {
		// 	this.showFingerGuide();
		// }, 1000 * tTime);
		this.mTimeOutHnd = new Timer(() => {
			this.showFingerGuide();
		}, 1000 * tTime);
	}

	//손가락 보이기를 나타낸다.
	private async showFingerGuide() {
		if (this.mGuideNum > 5) return;

		let tPosX = 0;
		let tPosY = 0;
		const tNowGuideNum = this.mGuideNum % 2;
		tPosX = this.mAnswerBoardAry[tNowGuideNum].x;
		tPosY = this.mAnswerBoardAry[tNowGuideNum].y + 50;
		this.mFingerSp.position.x = tPosX + 10;
		this.mFingerSp.position.y = tPosY + 20;
		this.mFingerSp.alpha = 1;
		this.mFingerSp.visible = true;
		this.mFingerSp.scale.set(1.3);
		gsap.to(this.mFingerSp, { x: tPosX, y: tPosY, duration: 0.5 });
		await App.Handle.tweenMotion('delay', 0.5);
		gsap.to(this.mFingerSp.scale, {
			x: 1,
			y: 1,
			duration: 0.5,
			ease: 'back.out(4)',
		});
		await App.Handle.tweenMotion('delay', 0.5);
		// }

		this.mFingerSp.visible = false;
		// clearTimeout(this.mTimeOutHnd);
		this.mTimeOutHnd?.clear();
		this.mTimeOutHnd = null;
		if (this.mGuideNum < 5) {
			this.mGuideNum++;
			this.startTimeOut(0.5);
		} else {
			this.mGuideNum = 0;
		}
	}

	//손가락 감추기를 나타낸다.
	private hideFingerGuide() {
		// clearTimeout(this.mTimeOutHnd);
		this.mTimeOutHnd = null;
		this.mFingerSp.visible = false;
		this.mGuideNum = 10;
	}

	//액티비티 클리어 했을때의 처리를 나타낸다.
	private async clearActivity() {
		SoundManager.Handle.stopAll();
		this.mSpeechBubbleSp.visible = false;
		this.dispatchEvent(EventType.ReceiveData, 'ClearMode');

		const tEopSpine = new PIXI.spine.Spine(
			ViewerRscManager.Handle.getResource('common', 'eop.json').spineData,
		);
		tEopSpine.position.set(App.Handle.appWidth / 2, App.Handle.appHeight / 2);
		App.Handle.addChilds(this, tEopSpine);

		tEopSpine.state.setAnimation(0, `eop${this.mEopNum}`, false);

		SoundManager.Handle.getSound('common', `eop_sfx.mp3`).play();
		await App.Handle.tweenMotion('delay', 1.5);
		SoundManager.Handle.getSound('common', `eop_${this.mEopNum}.mp3`).play();
	}

	//이벤트 받기를 나타낸다.
	private eventReceive(evt: CustomEvent) {
		console.log(`eventReceive = ${evt.data}`);

		switch (evt.data) {
			case 'ClearMode':
				this.dispatchEvent(EventType.ReceiveData, evt.data);
				break;
			case 'SetQuest':
				this.setQuest();
				break;
			default: {
				//
			}
		}
		// if (evt.data == 'ClearMode') {
		// 	// this.destroy();
		// 	this.dispatchEvent(EventType.ReceiveData, evt.data);
		// }
	}
	//gsap Animation 제거를 나타낸다.
	private destroyGsapAni() {
		if (this.mAniTimeLine) {
			this.mAniTimeLine.kill();
			this.mAniTimeLine = null;
		}

		this.mRoad.mCar.destroyGsapAni();

		gsap.killTweensOf(this.mTrueDirectionSp);
		gsap.killTweensOf(this.mFingerSp);
		gsap.killTweensOf(this.mAnswerBoardAry[0]);
		gsap.killTweensOf(this.mAnswerBoardAry[1]);
		gsap.killTweensOf(this.mBoardCtAry[0]);
		gsap.killTweensOf(this.mBoardCtAry[1]);
		gsap.killTweensOf(this.mBoardCtAry[2]);
	}

	//Ticker의 제거를 나타낸다.
	private destroyTicker() {
		// this.mTicker.stop();
		// this.mTicker = null;
		// this.mTickerFnc = () => null;
		// this.onQuestUpdate = () => null;
		this.mQuestTimeOutHnd?.clear();
		this.mQuestTimeOutHnd = null;
		this.mTimeOutHnd?.clear();
		this.mTimeOutHnd = null;
	}

	async onEnd() {
		this.destroyGsapAni();
		SoundManager.Handle.removeAll();
		App.Handle.clearStagObjs();
		App.Handle.removeMotionDelay();
		this.mRoad.mCar.destroyTicker();
		this.mRoad.destroyTicker();
		this.destroyTicker();
		await App.Handle.removeChilds();
	}
}
