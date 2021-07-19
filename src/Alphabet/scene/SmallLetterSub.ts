import { SceneBase } from '../../com/core/SceneBase';
import { App } from '../../com/core/App';
import 'pixi-spine';

// Manager
import { ViewerRscManager } from '../../com/manager/ViewerRscManager';
import { ProductRscManager } from '../../com/manager/ProductRscManager';
import { Rsc, SoundManager } from '../../com/manager/SoundManager';

// Scene
import { NaviBtnName } from '../AlphabetApp';
import { Button } from '../../com/widget/Button';
import { EventType } from '../../com/core/EventType';
import { CustomEvent } from '../../com/core/CustomEvent';
import { ObjectBase } from '@/com/core/ObjectBase';
import { sound, spine } from 'pixi.js';
import gsap from 'gsap';
import pixiSound from 'pixi-sound';
import * as Util from '../../com/util/Util';
import { Star } from '../../com/widget/Star';

class GpCircle extends PIXI.Container {
	private mCircle: PIXI.Graphics;

	constructor() {
		super();

		this.mCircle = new PIXI.Graphics();

		this.mCircle.beginFill(0x000000);
		this.mCircle.drawCircle(0, 0, 20);
		this.mCircle.endFill();
		this.mCircle.position.set(-5, -5);

		// this.addChild(this.mCircle);
		App.Handle.addChilds(this, this.mCircle);
	}

	get gp(): PIXI.Graphics {
		return this.mCircle;
	}
}

class StrokeCircle extends PIXI.Container {
	private mCircle: PIXI.Graphics;

	constructor() {
		super();

		this.mCircle = new PIXI.Graphics();

		this.mCircle.beginFill(0x000000);
		this.mCircle.drawCircle(0, 0, 35);
		this.mCircle.endFill();
		this.mCircle.position.set(-5, -5);

		// this.addChild(this.mCircle);
		App.Handle.addChilds(this, this.mCircle);
	}

	get gp(): PIXI.Graphics {
		return this.mCircle;
	}
}

class TracingStoke extends ObjectBase {
	public mStrokeSpr: PIXI.Sprite;
	private mMask: PIXI.Container;
	private mColor: number;

	constructor(img: PIXI.Texture, tcolor: number) {
		super();
		this.mColor = tcolor;

		this.mStrokeSpr = new PIXI.Sprite(img);
		this.mStrokeSpr.tint = tcolor;
		// this.addChild(this.mStrokeSpr);
		App.Handle.addChilds(this, this.mStrokeSpr);

		this.mMask = new PIXI.Container();
		// this.addChild(this.mMask);
		App.Handle.addChilds(this, this.mMask, true);

		this.mStrokeSpr.mask = this.mMask;
	}

	get maskContainer(): PIXI.Container {
		return this.mMask;
	}

	blinkStrokeSpr() {
		this.mStrokeSpr.tint = 0xffff00;
		this.mStrokeSpr.mask = null;
		this.mStrokeSpr.alpha = 0;
		gsap.to(this.mStrokeSpr, {
			alpha: 1,
			duration: 0.3,
			repeat: 1,
			repeatDelay: 0.1,
			yoyo: true,
		});
	}

	fillSpr() {
		this.mStrokeSpr.alpha = 1;
		this.mStrokeSpr.tint = this.mColor;
	}

	setMaskSpr() {
		this.mStrokeSpr.alpha = 1;
		this.mStrokeSpr.tint = this.mColor;
		this.mStrokeSpr.mask = this.mMask;
	}

	removeMakeChild() {
		this.mMask.removeChildren();
	}
}

class Alphabet extends ObjectBase {
	private mCircleAry: Array<GpCircle>;

	private mGuideCt: PIXI.Container;
	private mLineCt: PIXI.Container;
	private mStrokeCt: PIXI.Container;

	private mWrongSnd: pixiSound.Sound;

	private mLineSp: PIXI.Sprite;
	private mFingerSp: PIXI.Sprite;

	private mStrokeAry: Array<TracingStoke>;
	private mPointGuideAry: Array<PIXI.Sprite>;

	private mTracingAry: Array<number>;
	private mCurrenStoke: number;
	private mMaxStoke: number;

	private mPos: Array<any>;

	private mStartTrue: boolean; // 트레이싱 시작했는지 나타낸다.
	private mIsTracing: boolean; // 트레이싱중인 상태인지 나타낸다.
	private mIsTwoFailed: boolean; // 두번 틀린 상태인지를 나타낸다.
	private mIsLock: boolean; // 트레이싱이 잠긴 상태인지를 나타낸다.

	private mCnt: number;
	private mFailureCnt: number;

	private mTimeOutHnd: number;
	private mTracingColor: number;

	private mFingerSnd: pixiSound.Sound;

	public mFillAlphabetSp: PIXI.Sprite;
	public mImgSheet: PIXI.Spritesheet;
	// get color(): number {
	//     return this.mTracingColor;
	// }

	// set color(tcolor: number){
	//     this.mTracingColor = tcolor;
	//     this.resetColor();
	// }

	get isLock(): boolean {
		return this.mIsLock;
	}

	set isLock(tVal: boolean) {
		this.mIsLock = tVal;
		this.lockTracing();
	}

	constructor(public m_Head: string, public m_Category: string) {
		super();

		this.sortableChildren = true; // zIndex 처리를 위한 준비과정을 나타낸다.

		this.mStartTrue = false;
		this.mIsTracing = false;
		this.mIsTwoFailed = false;
		this.mIsLock = false;

		this.mCnt = 0;
		this.mFailureCnt = 0;
		this.mTracingColor = 0xff0000;

		this.mTracingAry = ProductRscManager.Handle.getResource(
			this.m_Category,
			'tracing',
		) as any;
		this.mCurrenStoke = 0;
		this.mMaxStoke = this.mTracingAry.length;

		this.mLineCt = new PIXI.Container();
		this.mStrokeCt = new PIXI.Container();
		this.mGuideCt = new PIXI.Container();

		this.mImgSheet = ProductRscManager.Handle.getResource(
			'common',
			`ap_${this.m_Head}.json`,
		).spritesheet;

		this.creatStrokeAry();
		this.createPointGuide();
		this.showPointGuide(true);
		// this.addChild(this.mStrokeCt);
		App.Handle.addChilds(this, this.mStrokeCt, true);

		// this.addChild(mBg)
		const lineSp = this.mImgSheet.textures[`line_${this.m_Head}_4.png`];
		this.mLineSp = new PIXI.Sprite(lineSp);
		this.mLineSp.tint = 0x000000;
		// this.mLineCt.addChild(this.mLineSp);
		App.Handle.addChilds(this.mLineCt, this.mLineSp, true);

		this.mFillAlphabetSp = new PIXI.Sprite(
			this.mImgSheet.textures[`${this.m_Head}_4.png`],
		);
		this.mFillAlphabetSp.tint = this.mTracingColor;
		// this.mLineCt.addChild(this.mLineSp);
		this.mFillAlphabetSp.visible = false;
		App.Handle.addChilds(this.mStrokeCt, this.mFillAlphabetSp);

		//event
		this.interactive = true;
		this.on('pointerdown', (evt: PIXI.InteractionEvent) => {
			this.startTracing();

			const point = evt.data.getLocalPosition(this) as PIXI.Point;
			console.log(point);

			const dis = Math.sqrt(
				Math.pow(point.x - this.mPos[0].x, 2) +
					Math.pow(point.y - this.mPos[0].y, 2),
			);

			// console.log(`dis = ${dis}`);
			if (dis < 25) {
				const tracingStroke = this.mStrokeAry[this.mCurrenStoke];
				const strokeCircle = new StrokeCircle();
				if (this.mPos[this.mCnt] === undefined) return;
				strokeCircle.position.set(
					this.mPos[this.mCnt].x,
					this.mPos[this.mCnt].y,
				);
				// tracingStroke.maskContainer.addChild(strokeCircle);
				App.Handle.addChilds(tracingStroke.maskContainer, strokeCircle);

				this.mCnt < this.mPos.length ? this.mCnt++ : null;
				// this.checkCircle();
				this.mStartTrue = true;
				console.log('start');
				// console.log(this.mFingerSnd);
				SoundManager.Handle.getSound('common', 'snd_finger.mp3').play({
					loop: true,
				});

				if (this.mCnt == this.mPos.length) {
					console.log('Success');
					SoundManager.Handle.getSound('common', 'snd_finger.mp3').stop();
					this.suceess();
				}
			} else {
				console.log('실패');

				SoundManager.Handle.getSound('common', 'snd_finger.mp3').stop();
				this.checkFailure();

				// console.log(this.mTempCnt);
				this.mStartTrue = false;
				this.mCnt = 0;
				this.reset();
				// this.checkCircle();
			}
		});

		this.on('pointerup', (evt: PIXI.InteractionEvent) => {
			if (this.mStartTrue && this.mCnt < this.mPos.length) {
				this.checkFailure();
				// this.suceess();
			}

			SoundManager.Handle.getSound('common', 'snd_finger.mp3').stop();

			this.mStartTrue = false;
			this.mCnt = 0;
			this.reset();
			// this.checkCircle();
		});

		this.on('pointermove', (evt: PIXI.InteractionEvent) => {
			const tracingStroke = this.mStrokeAry[this.mCurrenStoke];

			if (this.mStartTrue && this.mCnt < this.mPos.length) {
				//
				const point = evt.data.getLocalPosition(this) as PIXI.Point;
				const dis = Math.sqrt(
					Math.pow(point.x - this.mPos[this.mCnt].x, 2) +
						Math.pow(point.y - this.mPos[this.mCnt].y, 2),
				);

				if (dis < 28 && !this.mPos[this.mCnt].flag) {
					this.mPos[this.mCnt].flag = true;

					const strokeCircle = new StrokeCircle();
					strokeCircle.position.set(
						this.mPos[this.mCnt].x,
						this.mPos[this.mCnt].y,
					);
					// tracingStroke.maskContainer.addChild(strokeCircle);
					App.Handle.addChilds(tracingStroke.maskContainer, strokeCircle);

					this.mCnt < this.mPos.length ? this.mCnt++ : null;
					// console.log(this.mCnt);

					if (this.mCnt == this.mPos.length) {
						SoundManager.Handle.getSound('common', 'snd_finger.mp3').stop();
						this.suceess();
					}

					// this.checkCircle();
				} else if (dis > 60) {
					console.log('실패');

					SoundManager.Handle.getSound('common', 'snd_finger.mp3').stop();
					this.checkFailure();

					// console.log(this.mTempCnt);
					this.mStartTrue = false;
					this.mCnt = 0;
					this.reset();
					// this.checkCircle();
				}
			}
		});

		// this.addChild(this.mLineCt);
		App.Handle.addChilds(this, this.mLineCt);

		const tViewSheet = ViewerRscManager.Handle.getResource(
			'common',
			`ap_view.json`,
		).spritesheet;

		this.mFingerSp = new PIXI.Sprite(tViewSheet.textures['finger.png']);
		this.mFingerSp.visible = false;
		// this.addChild(this.mFingerSp);
		this.mFingerSp.anchor.set(0.1);
		App.Handle.addChilds(this, this.mFingerSp, true);

		// this.mWrongSnd = ViewerRscManager.Handle.getResource(
		// 	'common',
		// 	'snd_wrong.mp3',
		// ).sound;
	}

	//트레이싱 시작 할때 처리를 나타낸다.
	private startTracing() {
		this.mFingerSp.visible = false;

		this.mStrokeAry[this.mCurrenStoke].setMaskSpr();
		if (!this.mIsTracing) {
			this.dispatchEvent(EventType.ReceiveData, 'startTracing');
			this.mIsTracing = true;
		}

		if (this.mIsTwoFailed) {
			this.dispatchEvent(EventType.ReceiveData, 'reTracing');
			this.mIsTwoFailed = false;
		}
	}

	//트레이싱 포인트 가이드를 나타낸다.
	private createPointGuide() {
		this.mPointGuideAry = [];
		for (let i = 0; i < this.mMaxStoke; i++) {
			const tPointGuideSp = new PIXI.Sprite(
				this.mImgSheet.textures[`point_${this.m_Head}_4_${i + 1}.png`],
			);
			this.mPointGuideAry.push(tPointGuideSp);
			tPointGuideSp.visible = false;
			App.Handle.addChilds(this, tPointGuideSp, true);
			tPointGuideSp.zIndex = 30 + i * 10 + i;
		}
	}

	private showPointGuide(tVal: boolean) {
		for (const tIdx of this.mPointGuideAry) {
			tIdx.visible = false;
		}
		this.mPointGuideAry[this.mCurrenStoke].visible = tVal;
	}

	//트레이싱 조각 배열 생성을 나타낸다.
	private creatStrokeAry() {
		this.mStrokeAry = [];
		for (let i = 0; i < this.mMaxStoke; i++) {
			//
			const ts = new TracingStoke(
				this.mImgSheet.textures[`${this.m_Head}_4_${i + 1}.png`],
				this.mTracingColor,
			);
			this.mStrokeAry.push(ts);
			ts.visible = false;
			// this.mStrokeCt.addChild(ts);
			App.Handle.addChilds(this.mStrokeCt, ts, true);
			ts.zIndex = 30 + i * 15 + i;
		}
	}

	// 실패 체크를 나타낸다.
	private checkFailure() {
		gsap.killTweensOf(this.mFingerSp);
		this.mFingerSp.visible = false;
		this.mFailureCnt++;
		if (this.mFailureCnt >= 2) {
			this.mFailureCnt = 0;
			this.mIsTwoFailed = true;
			// this.showTracingGuide();
			this.mStrokeAry[this.mCurrenStoke].blinkStrokeSpr();
			// let tSp = new PIXI.Sprite();
			// tSp = this.mStrokeAry[this.mCurrenStoke].mStrokeSpr;
			// tSp.alpha = 1;
			// gsap.to(tSp, {alpha: 0, duration: 1, repeat: 1, repeatDelay: 0.2 });

			this.dispatchEvent(EventType.ReceiveData, 'twoFailed');
		}
		// console.log(`this.mFailureCnt = ${this.mFailureCnt}`);
		clearTimeout(this.mTimeOutHnd);
		// this.startTimeOut(10);
		this.showTracingGuide(false);

		SoundManager.Handle.getSound('common', 'snd_wrong.mp3').play();
	}

	//손가락 가이드 감추기를 나타낸다.
	private hideGuide() {
		gsap.killTweensOf(this.mFingerSp);
		this.mFailureCnt = 0;
		this.mFingerSp.visible = false;

		clearTimeout(this.mTimeOutHnd);
		this.startTimeOut(10);
	}

	// 10초마다 손가락 디렉션 보여주기를 나타낸다.
	private startTimeOut(tTime: number) {
		this.mTimeOutHnd = setTimeout(() => {
			if (!this.isLock) {
				this.mFailureCnt = 0;
				this.showTracingGuide(true);
			}
		}, 1000 * tTime);
	}

	//트레이싱 조각 초기화를 나타낸다.
	private reset() {
		const len = this.mPos.length;

		for (let i = 0; i < len; i++) {
			this.mPos[i].flag = false;
		}

		const tracingStroke = this.mStrokeAry[this.mCurrenStoke];
		if (tracingStroke) tracingStroke.removeMakeChild();
	}

	// 트레이싱 성공 했을때의 처리를 나타낸다.
	private suceess() {
		console.log('성공');
		this.mStartTrue = false;
		this.showPointGuide(false);
		this.mStrokeAry[this.mCurrenStoke].fillSpr();
		this.mCurrenStoke++;
		this.makeStroke();

		if (this.mCurrenStoke < this.mMaxStoke) {
			this.showPointGuide(true);
			this.hideGuide();
			this.showTracingGuide(false);
		}
	}

	// 팔레트 색상 변경시의 처리를 나타낸다.
	private resetColor() {
		this.mIsTracing = false;
		this.mStartTrue = false;
		this.mCnt = 0;
		this.mFailureCnt = 0;

		this.mCurrenStoke = 0;

		for (let i = 0; i < this.mMaxStoke; i++) {
			const tracingStroke = this.mStrokeAry[i];
			tracingStroke.removeMakeChild();
			tracingStroke.visible = false;
		}

		this.creatStrokeAry();
		this.createPointGuide();
		this.showPointGuide(true);
		this.makeStroke();

		this.reset();
	}

	//다시 쓰기시의 처리를 나타낸다.
	reWrite() {
		this.mFillAlphabetSp.visible = false;
		this.resetColor();
		this.hideGuide();
		this.showTracingGuide(false);
	}

	//트레이싱 위치 만들기를 나타낸다.
	makeStroke() {
		const tracingStroke = this.mStrokeAry[this.mCurrenStoke];

		if (this.mCurrenStoke < this.mMaxStoke) {
			// console.log(`mCurrenStoke = ${this.mCurrenStoke},  ${this.mTracingAry[ this.mCurrenStoke ]}`);

			this.mPos = [];
			this.mCircleAry = [];

			tracingStroke.visible = true;

			const data = (this.mTracingAry[this.mCurrenStoke] as any) as Array<
				number[][]
			>;

			for (let i = 0; i < data.length; i++) {
				const temp = {
					x: data[i][0],
					y: data[i][1],
					flag: false,
				};
				this.mPos.push(temp);
			}
		} else {
			console.log('트레이싱 끝');
			this.isLock = true;

			this.mFillAlphabetSp.visible = true;
			for (const tObj of this.mStrokeAry) {
				tObj.visible = false;
			}
			App.Handle.pauseStageObjs();
			this.dispatchEvent(EventType.ReceiveData, 'getStar');
		}
	}

	// 손가락 가이드 보여주기를 나타낸다.
	showTracingGuide(tSndBool: boolean) {
		const data = (this.mTracingAry[this.mCurrenStoke] as any) as Array<
			number[][]
		>;
		this.mFingerSp.position.set(
			Number(data[0][0]) - 10,
			Number(data[0][1]) - 10,
		); //-10은 손가락 좌표에 의한 위치 보정을 나타낸다.
		this.mFingerSp.alpha = 0;
		this.mFingerSp.visible = true;
		this.mFingerSp.zIndex = 100;

		if (tSndBool)
			SoundManager.Handle.getSound('common', `scaffolding_sfx.mp3`).play();

		gsap
			.to(this.mFingerSp, {
				alpha: 1,
				duration: 0.2,
				repeat: 5,
				repeatDelay: 0.5,
				yoyo: true,
			})
			.eventCallback('onComplete', () => {
				this.hideGuide();
			});
	}

	//트레이싱 잠그기를 나타낸다.
	private lockTracing() {
		this.interactive = !this.mIsLock;
		if (this.isLock) {
			gsap.killTweensOf(this.mFingerSp);
			this.mFailureCnt = 0;
			this.mFingerSp.visible = false;

			clearTimeout(this.mTimeOutHnd);
		}
	}
}

export class SmallLetterSub extends SceneBase {
	private mAlphabet: Alphabet;

	private mIsShowTrue: boolean;

	private mTrueDirectionCt: PIXI.Container;
	private mTrueDirectionSp: PIXI.Sprite;
	private mSpeechBubbleSp: PIXI.AnimatedSprite;

	private mCardCt: PIXI.Container;
	private mEmptyCardSp: PIXI.Sprite;
	private mWordCardSp: PIXI.Sprite;
	private mWordTxtSp: PIXI.Text;

	private mScoreStarCt: PIXI.Container;
	private mScoreStarBg: Array<Star>;
	private mScoreStar: Array<Star>;

	private mStudyWordTxt: string;
	private mStudyWords: Array<string>;

	private mScoreCnt: number;
	private mFinStarCnt = 3;

	private mClearObj: Array<Button | PIXI.Container>;

	private mIntroMotion: any;
	private mEopNum: number;
	private mViewSheet: PIXI.Spritesheet;

	constructor() {
		super();
		this.name = 'SmallSub';
	}

	async onInit() {
		this.dispatchEvent(EventType.ReceiveData, 'StartMode'); //씬 시작시 네이게이션 버튼 처리를 위한 Alphabet 호출 부분을 나타낸다.
		this.mScoreCnt = 0;
		this.mClearObj = [];
		this.mIsShowTrue = false;

		// //배경 이미지를 나타낸다.
		// const tBgImg = new PIXI.NineSlicePlane(
		// 	ViewerRscManager.Handle.getResource(this.name, 'bigbg.png').texture,
		// 	40,
		// 	40,
		// 	40,
		// 	40,
		// );
		// tBgImg.width = App.Handle.appWidth;
		// tBgImg.height = App.Handle.appHeight - 64;
		// tBgImg.position.set(0, 64);
		// // this.addChild(tBgImg);
		// App.Handle.addChilds(this, tBgImg, true);

		this.selectEop();

		//배경 색상을 나타낸다.
		const tBackImg = new PIXI.Graphics();
		tBackImg.beginFill(0x04d8d9);
		tBackImg.drawRect(0, 0, App.Handle.appWidth, App.Handle.appHeight);
		tBackImg.endFill();
		// this.mStageCt.addChild(tBackImg);
		App.Handle.addChilds(this, tBackImg);

		this.mViewSheet = ViewerRscManager.Handle.getResource(
			'common',
			`ap_view.json`,
		).spritesheet;

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

		this.mScoreStarCt = new PIXI.Container();
		this.mScoreStarCt.position.set(App.Handle.appWidth - 140, 70);
		const tScoreBgImg = new PIXI.Sprite(this.mViewSheet.textures['starbg.png']);
		tScoreBgImg.anchor.set(0);
		tScoreBgImg.position.set(0, 0);
		// this.mScoreStarCt.addChild(tScoreBgImg);
		App.Handle.addChilds(this.mScoreStarCt, tScoreBgImg, true);

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

		this.mStudyWords = [
			...(ProductRscManager.Handle.getResource('common', 'studywords') as any),
		];
		console.log(this.mStudyWords);

		this.mCardCt = new PIXI.Container();
		this.mEmptyCardSp = new PIXI.Sprite(
			this.mViewSheet.textures['card_empty.png'],
		);
		this.mEmptyCardSp.anchor.set(0.5);
		this.mEmptyCardSp.position.set(App.Handle.appWidth / 2, 240);
		// this.addChild(this.mEmptyCardSp);
		App.Handle.addChilds(this.mCardCt, this.mEmptyCardSp, true);

		this.mWordCardSp = new PIXI.Sprite(
			this.mViewSheet.textures['question.png'],
		);
		this.mWordCardSp.anchor.set(0.5);
		this.mWordCardSp.position.set(App.Handle.appWidth / 2, 240);
		// this.addChild(this.mWordCardSp);
		App.Handle.addChilds(this.mCardCt, this.mWordCardSp, true);

		App.Handle.addChilds(this, this.mCardCt);
		// this.mWordTxtSp = new PIXI.Sprite(
		// 	ViewerRscManager.Handle.getResource(this.name, `word_empty.png`).texture,
		// );
		// // this.addChild(this.mWordTxtSp);
		// App.Handle.addChilds(this, this.mWordTxtSp, true);

		const style = new PIXI.TextStyle({
			align: 'center',
			fill: '#333333',
			fontFamily: 'minigate Bold ver2',
			fontWeight: 'normal',
			fontSize: 250,
			padding: 10,
		});

		this.mWordTxtSp = new PIXI.Text('');
		this.mWordTxtSp.style = style;
		// this.tempTxt.text = 'ALPHABET';
		this.mWordTxtSp.anchor.set(0.5);
		this.mWordTxtSp.position.set(640 + 80, 496);

		// this.addChild(this.tempTxt);
		App.Handle.addChilds(this, this.mWordTxtSp);

		// const tTestBg = new PIXI.Sprite(ViewerRscManager.Handle.getResource(this.name, 'test.png').texture);
		// tTestBg.position.set(0, 0);
		// this.addChild(tTestBg);

		// // 알파벳 스파인 애니메이션을 나타낸다.
		// this.mAlphabetSpine = new PIXI.spine.Spine( ProductRscManager.Handle.getResource( this.name, "test_b.json").spineData );
		// this.mAlphabetSpine.position.set(280, 320);
		// this.mAlphabetSpine.state.setAnimation(0, "b", false);
		// this.mAlphabetSpine.state.tracks[0].trackTime = 0; // 씬시작시 알파벳이 채워진 상태로 플레이 시키기 위한 방법을 나타낸다.
		// this.mAlphabetSpine.update(1000);
		// this.addChild(this.mAlphabetSpine);

		// this.mAlphabetSpine.state.addListener({
		//     complete: (trackIndex: PIXI.spine.core.TrackEntry) => {
		//         setTimeout(() => {
		//             this.completedSpine();
		//         });
		//     }
		// });

		// 알파벳 트레이싱을 나타낸다.
		console.log(App.Handle.getAlphabet);
		this.mAlphabet = new Alphabet(App.Handle.getAlphabet, this.name);
		this.mAlphabet.pivot.set(0.5, 1);
		this.mAlphabet.position.set(-1000);

		this.mAlphabet.addCustomEventListener(EventType.ReceiveData, evt => {
			this.eventReceive(evt);
		});
		// this.addChild(this.mAlphabet);
		App.Handle.addChilds(this, this.mAlphabet, true);

		// const debug = new PIXI.Graphics();
		// debug.lineStyle(2, 0x00ff00, 1);
		// debug.drawRect(0, 0, this.mAlphabet.width, this.mAlphabet.height);
		// this.mAlphabet.addChild(debug);
	}

	async onStart() {
		await this.preLoadSound();
		this.setQuest();
		// const BGM = ViewerRscManager.Handle.getResource(this.name, 'snd_bgm.mp3')
		// 	.sound;
		// BGM.play({ loop: true });
		// SoundManager.Handle.play('common', 'letter_bgm.mp3');

		// 뚜루두루 디렉션 캐릭터를 나타낸다.
		this.mTrueDirectionCt = new PIXI.Container();
		// this.mAlphabetSpine.state.timeScale = 1;

		this.mTrueDirectionSp = new PIXI.Sprite(
			this.mViewSheet.textures['truetrue.png'],
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
			this.mViewSheet.animations['speechBubble'],
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

		this.mAlphabet.makeStroke();

		this.showTrueTrue();
	}

	//사운드 미리 불러오기를 나타낸다.
	private async preLoadSound() {
		if (window['Android']) {
			if (App.Handle.loading === null || App.Handle.loading === undefined)
				window['Android'].showLoading();
		}
		const tSnds = [];
		tSnds.push([Rsc.viewer, 'common', 'button_click.mp3']);
		tSnds.push([
			Rsc.product,
			this.name,
			`snd_${App.Handle.getAlphabet}_ready.mp3`,
		]);
		tSnds.push([Rsc.viewer, 'common', 'snd_correct.mp3']);
		tSnds.push([Rsc.viewer, 'common', 'snd_finger.mp3']);
		tSnds.push([Rsc.viewer, 'common', 'snd_wrong.mp3']);
		tSnds.push([Rsc.viewer, 'common', 'scaffolding_sfx.mp3']);
		tSnds.push([Rsc.viewer, 'common', 'gain_star.mp3']);
		tSnds.push([Rsc.viewer, 'common', `eop_${this.mEopNum}.mp3`]);
		tSnds.push([Rsc.viewer, 'common', `eop_sfx.mp3`]);
		tSnds.push([
			Rsc.product,
			'common',
			`snd_${App.Handle.getAlphabet}_small.mp3`,
		]);
		tSnds.push([Rsc.product, 'common', `${this.mStudyWords[0]}.mp3`]);
		tSnds.push([Rsc.product, 'common', `${this.mStudyWords[1]}.mp3`]);
		tSnds.push([Rsc.product, 'common', `${this.mStudyWords[2]}.mp3`]);
		await SoundManager.Handle.loadSounds(tSnds);

		const tPreSnds = [];
		tPreSnds.push([Rsc.viewer, 'common', 'letter_bgm.mp3', true, true]);
		tPreSnds.push([Rsc.viewer, 'common', 'intro_bgm.mp3', false]);
		// tPreSnds.push([Rsc.viewer, 'Game', 'snd_bgm.mp3', true]);
		// tPreSnds.push([Rsc.viewer, 'Outro', 'snd_bgm.mp3', true]);
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
		if (this.mIntroMotion) {
			this.mIntroMotion.kill();
			this.mIntroMotion = null;
		}
		let delay = 0;
		let tCnt = 0;
		down ? (tCnt = 4) : (tCnt = 3);
		this.mIntroMotion = gsap.timeline({});
		this.mIntroMotion.to(this.mTrueDirectionSp, {
			rotation: 0.1 * Math.PI,
			duration: 0.7,
			repeat: tCnt,
			yoyo: true,
		});

		if (down) {
			this.mIntroMotion.to(this.mTrueDirectionSp, {
				rotation: 0.5,
				duration: 0.3,
			});

			this.mIntroMotion.to(this.mTrueDirectionSp, { x: -130, duration: 0.3 });
			delay = 0.6 + 0.7 * tCnt;
		} else {
			delay = 0.3 + 0.7 * tCnt;
		}
		await App.Handle.tweenMotion('delay', delay);
	}

	//뚜루뚜루 디렉션 캐릭터가 나타나 설명하는 애니메이션 처리를 나타낸다.
	private async showTrueTrue() {
		const downY = -130;
		const upY = -30;

		this.mTrueDirectionSp.x = downY;

		App.Handle.pauseStageObjs();
		// const tSndDir01 = ViewerRscManager.Handle.getResource(
		// 	this.name,
		// 	'snd_direction_01.mp3',
		// ).sound;
		this.mIsShowTrue = true;
		this.mAlphabet.isLock = true;
		this.mSpeechBubbleSp.visible = false;

		this.mTrueDirectionSp.rotation = 0;
		gsap.to(this.mTrueDirectionSp, { x: upY, duration: 0.3 });

		this.setTrueMotion(true);

		// tSndDir01.play({
		// 	complete: () => {
		// 		gsap.delayedCall(0.8, () => {
		// 			this.mAlphabet.showTracingGuide();
		// 			this.mAlphabet.isLock = false;
		// 			App.Handle.playStageObjs();
		// 			this.mSpeechBubbleSp.visible = true;
		// 			this.mIsShowTrue = false;
		// 		});
		// 	},
		// });
		const tDirection01 = SoundManager.Handle.getSound(
			this.name,
			`snd_${App.Handle.getAlphabet}_ready.mp3`,
		);
		tDirection01.play();
		await App.Handle.tweenMotion('delay', tDirection01.duration + 0.8);
		this.mAlphabet.showTracingGuide(false);
		this.mAlphabet.isLock = false;
		App.Handle.playStageObjs();
		this.mSpeechBubbleSp.visible = true;
		this.mIsShowTrue = false;
	}

	private setQuest() {
		//카드 이미지를 나타낸다.
		console.log(`setQuest`);

		const tQuestNum = Math.floor(Math.random() * this.mStudyWords.length);
		console.log(this.mStudyWords, tQuestNum, this.mStudyWords[tQuestNum]);

		this.mStudyWordTxt = this.mStudyWords[tQuestNum].toLowerCase();
		this.mStudyWords.splice(tQuestNum, 1);

		// console.log(`a_word_${this.mStudyWordTxt}.png`);
		// this.mWordTxtSp.texture = ProductRscManager.Handle.getResource(
		// 	this.name,
		// 	`${this.mStudyWordTxt}.png`,
		// ).texture;
		const tPosGap = ProductRscManager.Handle.getResource(
			this.name,
			'points',
		) as any;
		console.log(`1, ${this.mStudyWordTxt}`);
		if (this.mStudyWordTxt == 'box' || this.mStudyWordTxt == 'fox') {
			console.log(`2, ${this.mStudyWordTxt}`);
			// this.mStudyWordTxt = this.mStudyWordTxt.toUpperCase();
			this.mWordTxtSp.position.set(640 - 80, 496);
			this.mWordTxtSp.text = this.mStudyWordTxt.slice(
				0,
				this.mStudyWordTxt.length - 1,
			);
			this.mAlphabet.position.set(
				this.mWordTxtSp.x + this.mWordTxtSp.width / 2 - 105 + tPosGap[0][0],
				358 + tPosGap[0][1],
			);
			// this.mStudyWordTxt = this.mStudyWordTxt.toLowerCase();
		} else {
			this.mWordTxtSp.position.set(640 + 80, 496);
			this.mWordTxtSp.text = this.mStudyWordTxt.slice(
				1,
				this.mStudyWordTxt.length,
			);
			this.mAlphabet.position.set(
				this.mWordTxtSp.x -
					this.mWordTxtSp.width / 2 -
					this.mAlphabet.width +
					55 +
					tPosGap[0][0],
				358 + tPosGap[0][1],
			);
		}
		/* 여기는 삭제 하지 말것.
		// const debug = new PIXI.Graphics();
		// debug.lineStyle(2, 0xff0000, 1);
		// debug.drawRect(0, 0, this.mWordTxtSp.width, this.mWordTxtSp.height);
		// this.mWordTxtSp.addChild(debug);
		// debug.pivot.set(debug.width / 2, debug.height / 2);
		*/
	}

	private async showCorrectQuest() {
		// this.mCorrectAniFlag = "init"
		// pixiSound.stopAll();
		this.mTrueDirectionCt.interactive = false;
		this.mSpeechBubbleSp.visible = false;

		// const tCorrectSnd = ViewerRscManager.Handle.getResource(
		// 	'common',
		// 	'snd_correct.mp3',
		// ).sound;
		// const tWordSnd = ProductRscManager.Handle.getResource(
		// 	'common',
		// 	`${this.mStudyWordTxt}.mp3`,
		// ).sound;
		// const tEmptyCard = ViewerRscManager.Handle.getResource( this.name, 'card_empty.png').texture;
		// const tEmptyCardSp = new PIXI.Sprite(tEmptyCard);

		// const tWordSnd = ProductRscManager.Handle.getResource(
		// 'common',
		// `${this.mStudyWordTxt}.mp3`,
		// ) as any;
		// await SoundManager.Handle.loadSound(tWordSnd, Sounds.tWordSnd);
		// await SoundManager.Handle.loadSound(
		// 	'common',
		// 	`${this.mStudyWordTxt}.mp3`,
		// 	Rsc.product,
		// );

		const tCorrectSnd = SoundManager.Handle.getSound(
			'common',
			'snd_correct.mp3',
		);
		// this.mWordCardSp.scale.set(3);
		// this.mWordCardSp.position.set(App.Handle.appWidth / 2, 500);
		// this.mWordCardSp.alpha = 0;
		gsap.to(this.mWordCardSp, { alpha: 0, duration: 0.3 });
		await App.Handle.tweenMotion('delay', 1);
		this.mWordCardSp.texture = this.mAlphabet.mImgSheet.textures[
			`${this.mStudyWordTxt}.png`
		];
		gsap.to(this.mWordCardSp, { alpha: 1, duration: 0.7 });

		tCorrectSnd.play();

		// this.mEmptyCardSp.alpha = 0;
		// gsap.to(this.mWordCardSp, { y: 240, duration: 0.7, ease: 'power2' });
		// gsap.to(this.mWordCardSp.scale, {
		// 	x: 1,
		// 	y: 1,
		// 	duration: 0.7,
		// 	ease: 'back',
		// });
		await App.Handle.tweenMotion('delay', tCorrectSnd.duration + 1);

		const tAlphabetSnd = SoundManager.Handle.getSound(
			'common',
			`snd_${App.Handle.getAlphabet}_small.mp3`,
		);
		tAlphabetSnd.play();
		await App.Handle.tweenMotion('delay', tAlphabetSnd.duration + 0.2);

		const tWordsSnd = SoundManager.Handle.getSound(
			'common',
			`${this.mStudyWordTxt}.mp3`,
		);
		gsap.to(this.mWordCardSp.scale, {
			x: 1.1,
			y: 1.1,
			duration: 0.3,
			repeat: 1,
			yoyo: true,
		});
		tWordsSnd.play();
		await App.Handle.tweenMotion('delay', tWordsSnd.duration + 1);

		this.mScoreStar[this.mScoreCnt].showStar();
		this.mScoreStarBg[this.mScoreCnt].hideStar();

		await App.Handle.tweenMotion('delay', 1);

		this.mScoreCnt++;
		if (this.mScoreCnt < this.mFinStarCnt) {
			// this.mCorrectAniFlag = "clearcard";
			// this.mEmptyCardSp.alpha = 1;
			gsap.to(this.mWordCardSp, { alpha: 0, duration: 1 });
			gsap.to(this.mWordTxtSp, { alpha: 0, duration: 1 });
			gsap.to(this.mAlphabet, { alpha: 0, duration: 1 });
			// this.mCorrectAniFlag = "clearcardwait";

			await App.Handle.tweenMotion('delay', 2);

			gsap.killTweensOf(this.mWordCardSp);
			gsap.killTweensOf(this.mWordTxtSp);
			gsap.killTweensOf(this.mAlphabet);

			this.mWordCardSp.texture = this.mViewSheet.textures['question.png'];
			this.mWordCardSp.alpha = 1;
			this.mWordTxtSp.alpha = 1;
			this.mAlphabet.alpha = 1;
			this.setQuest();
			this.mAlphabet.isLock = false;
			this.mAlphabet.reWrite();
			// this.removeChild();
			App.Handle.playStageObjs();
			this.mSpeechBubbleSp.visible = true;
		} else {
			this.clearActivity();
			// this.mCorrectAniFlag = "quit";
		}
		// this.mTrueDirectionCt.interactive = true;
		// this.mSpeechBubbleSp.visible = true;
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
		const tData = evt.data;

		console.log(`getEventData = ${tData}`);
		switch (tData) {
			case 'ClearMode': // 액티비티 클리어후 네비게이션 버튼 처리를 위한 Alphabet 호출을 나타낸다.
				// this.mWordCardSp(ProductRscManager.Handle.getResource(this.name, `a_word_${this.mStudyWordTxt}.png`));

				break;
			case 'getStar':
				// this.mWordCardSp.texture = ProductRscManager.Handle.getResource(this.name, `a_card_${this.mStudyWordTxt}.png`).texture;
				if (this.mScoreCnt < this.mFinStarCnt) {
					this.showCorrectQuest();
				} else {
					this.clearActivity();
				}
				break;
			case 'startTracing': //트레이싱 시작시 팔렛트 사라지는 처리를 나타낸다.
				// this.showPallet(false);
				break;
			case 'twoFailed': //트레이싱 두번 실패시 다시보기 버튼 처리를 나타낸다.
				// this.blinkReviewBtn(true);
				break;
			case 'reTracing': //트레이싱 쓰기 시작시 다시보기 버튼 원래대로 돌리는 처리를 나타낸다.
				// this.blinkReviewBtn(false);
				break;
			default:
		}
	}

	private destroyGsapAni() {
		if (this.mIntroMotion) {
			this.mIntroMotion.kill();
			this.mIntroMotion = null;
		}
		gsap.killTweensOf(this.mTrueDirectionSp);
		gsap.killTweensOf(this.mWordCardSp);
		gsap.killTweensOf(this.mWordTxtSp);
		gsap.killTweensOf(this.mAlphabet);
		this.mAlphabet.isLock = true;
	}

	async onEnd() {
		this.destroyGsapAni();
		SoundManager.Handle.removeAll();
		App.Handle.playStageObjs();
		App.Handle.clearStagObjs();
		App.Handle.removeMotionDelay();
		this.mAlphabet?.removeCustomEventListener(EventType.ReceiveData);
		await App.Handle.removeChilds();
	}
}
