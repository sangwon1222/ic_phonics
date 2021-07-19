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
import { Effect } from '@/com/widget/Effect';

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
	private mStrokeSpr: PIXI.Sprite;
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
		App.Handle.addChilds(this, this.mMask);

		this.mStrokeSpr.mask = this.mMask;
	}

	get maskContainer(): PIXI.Container {
		return this.mMask;
	}

	fillSpr() {
		this.mStrokeSpr.alpha = 1;
		this.mStrokeSpr.tint = this.mColor;
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
	private mPointGuideSp: PIXI.Sprite;

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

	private mFingerSnd: sound.Sound;
	private mImgSheet: PIXI.Spritesheet;

	get color(): number {
		return this.mTracingColor;
	}

	set color(tcolor: number) {
		this.mTracingColor = tcolor;
		this.resetColor();
	}

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
		// const gp = new PIXI.Graphics();
		// gp.beginFill(0xffff00);
		// gp.drawRect(0,0,523,523);
		// gp.endFill();
		// this.addChild(gp);

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
		// this.mFingerSnd = ViewerRscManager.Handle.getResource(
		// 	'common',
		// 	'snd_finger.mp3',
		// ).sound;

		// this.mStrokeAry = [];
		// for( let i = 0; i < this.mMaxStoke; i++) {
		//     //
		//     const ts = new TracingStoke(ProductRscManager.Handle.getResource( category, `${head}_1_${i}.png`).texture, this.mTracingColor);
		//     this.mStrokeAry.push(ts);
		//     ts.visible = false;
		//     this.mStrokeCt.addChild(ts);
		// }
		this.creatStrokeAry();
		this.createPointGuide();
		this.showPointGuide(true);

		// this.addChild(this.mStrokeCt);
		App.Handle.addChilds(this, this.mStrokeCt);

		// this.addChild(mBg)

		// const lineSp = ProductRscManager.Handle.getResource(
		// 	this.m_Category,
		// 	`line_${this.m_Head}_2.png`,
		// ).texture;
		const lineSp = this.mImgSheet.textures[`line_${this.m_Head}_2.png`];
		this.mLineSp = new PIXI.Sprite(lineSp);
		this.mLineSp.tint = 0x000000;
		// this.mLineCt.addChild(this.mLineSp);
		App.Handle.addChilds(this.mLineCt, this.mLineSp);

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
				// this.mFingerSnd.play({ loop: true });
				SoundManager.Handle.getSound('common', 'snd_finger.mp3').play({
					loop: true,
				});

				// console.log(`${this.mCnt}, ${this.mPos.length}`);
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
						// this.mFingerSnd.stop();
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
		App.Handle.addChilds(this, this.mLineCt, true);

		const tViewSheet = ViewerRscManager.Handle.getResource(
			'common',
			`ap_view.json`,
		).spritesheet;

		this.mFingerSp = new PIXI.Sprite(tViewSheet.textures['finger.png']);
		this.mFingerSp.visible = false;
		// this.addChild(this.mFingerSp);
		this.mFingerSp.anchor.set(0.2);
		App.Handle.addChilds(this, this.mFingerSp);

		// this.mWrongSnd = ViewerRscManager.Handle.getResource(
		// 	'common',
		// 	'snd_wrong.mp3',
		// ).sound;
	}

	//트레이싱 시작 할때 처리를 나타낸다.
	private startTracing() {
		this.mFingerSp.visible = false;

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
		// this.hidePointGuide();
		// const tIdx = this.mCurrenStoke + 1;
		// this.mPointGuideSp = new PIXI.Sprite(
		// 	ProductRscManager.Handle.getResource(
		// 		this.m_Category,
		// 		`point_${this.m_Head}_1_${tIdx}.png`,
		// 	).texture,
		// );
		// App.Handle.addChilds(this, this.mPointGuideSp, true);
		// console.log(`createPoint = ${tIdx}`);
		this.mPointGuideAry = [];
		for (let i = 0; i < this.mMaxStoke; i++) {
			// const tPointGuideSp = new PIXI.Sprite(
			// 	ProductRscManager.Handle.getResource(
			// 		this.m_Category,
			// 		`point_${this.m_Head}_2_${i + 1}.png`,
			// 	).texture,
			// );
			const tPointGuideSp = new PIXI.Sprite(
				this.mImgSheet.textures[`point_${this.m_Head}_2_${i + 1}.png`],
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
		// this.mPointGuideAry[this.mCurrenStoke].zIndex = 100 + this.mCurrenStoke;
		// this.mPointGuideSp == null || undefined
		// 	? null
		// 	: (this.mPointGuideSp.visible = false);
	}

	//트레이싱 조각 배열 생성을 나타낸다.
	private creatStrokeAry() {
		this.mStrokeAry = [];
		for (let i = 0; i < this.mMaxStoke; i++) {
			//
			const ts = new TracingStoke(
				// ProductRscManager.Handle.getResource(
				// 	this.m_Category,
				// 	`${this.m_Head}_2_${i + 1}.png`,
				// ).texture,
				this.mImgSheet.textures[`${this.m_Head}_2_${i + 1}.png`],
				this.mTracingColor,
			);
			this.mStrokeAry.push(ts);
			ts.visible = false;
			// this.mStrokeCt.addChild(ts);
			App.Handle.addChilds(this.mStrokeCt, ts);
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
			this.dispatchEvent(EventType.ReceiveData, 'twoFailed');
		}
		// console.log(`this.mFailureCnt = ${this.mFailureCnt}`);
		clearTimeout(this.mTimeOutHnd);
		// this.startTimeOut(10);
		this.showTracingGuide(false);
		SoundManager.Handle.getSound('common', 'snd_wrong.mp3').play();
		// this.mWrongSnd.play();
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
		this.makeStroke();

		this.reset();
	}

	//다시 쓰기시의 처리를 나타낸다.
	reWrite() {
		this.resetColor();
		this.showPointGuide(true);
		this.hideGuide();
		this.showTracingGuide(false);
	}

	//트레이싱 위치 만들기를 나타낸다.
	async makeStroke() {
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

				// // circle 보기 편하기 위한 빨간원 생성
				// const circle = new GpCircle();
				// circle.x = Number(temp.x);
				// circle.y = Number(temp.y);
				// this.mCircleAry.push(circle);
				// this.addChild(circle);

				// tracingStroke.maskContainer.addChild(circle);
			}
		} else {
			// App.Handle.bottomBar.dispatchEvent(EventType.ReceiveData, '트레이싱 클리어');
			console.log('트레이싱 끝');
			this.isLock = true;
			App.Handle.pauseStageObjs();
			await App.Handle.tweenMotion('delay', 0.5);
			const tCorrectSnd = SoundManager.Handle.getSound(
				'common',
				`snd_correct.mp3`,
			);
			tCorrectSnd.play();

			await App.Handle.tweenMotion('delay', 0.5);

			const tAlphabetSnd = SoundManager.Handle.getSound(
				'common',
				`snd_${App.Handle.getAlphabet}_small.mp3`,
			);
			tAlphabetSnd.play();
			await App.Handle.tweenMotion('delay', tAlphabetSnd.duration + 0.5);

			this.dispatchEvent(EventType.ReceiveData, 'ClearMode');

			// (this.parent as PhaseOne).testFnc();
		}
	}

	// 손가락 가이드 보여주기를 나타낸다.
	showTracingGuide(tSndBool: boolean) {
		const data = (this.mTracingAry[this.mCurrenStoke] as any) as Array<
			number[][]
		>;
		this.mFingerSp.position.set(Number(data[0][0]), Number(data[0][1]));
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

export class SmallLetter extends SceneBase {
	private mAlphabet: Alphabet;
	private mReviewBtn: Button;
	private mRewriteBtn: Button;

	private mIsShowPallet: boolean;
	private mIsShowTrue: boolean;
	private mIsClear: boolean;

	private mPalletCt: PIXI.Container;

	private mAlphabetSpine: spine.Spine;

	private mTrueDirectionCt: PIXI.Container;
	private mTrueDirectionSp: PIXI.Sprite;
	private mSpeechBubbleSp: PIXI.AnimatedSprite;
	private mSnd: pixiSound.Sound;

	private mPalletBtns: Array<Button>;

	private mIntroMotion: any;
	private mTweenflag: string;
	private mSpineIsPlaying: boolean;
	private mEopNum: number;
	private mViewSheet: PIXI.Spritesheet;
	private mEffect: Effect;
	private mTrueLockFlag: boolean;

	constructor() {
		super();
		this.name = 'Small';
		this.mTrueLockFlag = true;
	}

	async onInit() {
		this.dispatchEvent(EventType.ReceiveData, 'StartMode'); //씬 시작시 네이게이션 버튼 처리를 위한 Alphabet 호출 부분을 나타낸다.

		this.mIsShowPallet = true;
		this.mIsShowTrue = false;
		this.mIsClear = false;
		this.mSpineIsPlaying = false;
		this.mPalletBtns = [];

		// console.log(this.name );
		//배경 이미지를 나타낸다.
		// const tBgImg = new PIXI.NineSlicePlane(
		// 	ViewerRscManager.Handle.getResource(this.name, 'bigbg.png').texture,
		// 	50,
		// 	50,
		// 	50,
		// 	120,
		// );
		// tBgImg.width = App.Handle.appWidth;
		// tBgImg.height = App.Handle.appHeight - 64;
		// tBgImg.position.set(0, 64);
		// this.addChild(tBgImg);
		// App.Handle.addChilds(this, tBgImg);
		this.selectEop();

		//배경 색상을 나타낸다.
		const tBackImg = new PIXI.Graphics();
		tBackImg.beginFill(0x00ccea);
		tBackImg.drawRect(0, 0, App.Handle.appWidth, App.Handle.appHeight);
		tBackImg.endFill();
		// this.mStageCt.addChild(tBackImg);
		App.Handle.addChilds(this, tBackImg);

		this.mViewSheet = ViewerRscManager.Handle.getResource(
			'common',
			`ap_view.json`,
		).spritesheet;
		// const tTestBg = new PIXI.Sprite(ViewerRscManager.Handle.getResource(this.name, 'test.png').texture);
		// tTestBg.position.set(0, 0);
		// this.addChild(tTestBg);
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

		const tNoteImg = new PIXI.Sprite(this.mViewSheet.textures['bignote.png']);
		tNoteImg.anchor.set(0.5);
		tNoteImg.position.set(897, 444);
		// this.addChild(tNoteImg);

		App.Handle.addChilds(this, tNoteImg);

		// 알파벳 스파인 애니메이션을 나타낸다.
		this.mAlphabetSpine = new PIXI.spine.Spine(
			ProductRscManager.Handle.getResource(
				this.name,
				`${App.Handle.getAlphabet}_2_tracing.json`,
			).spineData,
		);
		// this.mAlphabetSpine.pivot.set(
		// 	this.mAlphabetSpine.width / 2,
		// 	this.mAlphabetSpine.height / 2,
		// );
		this.mAlphabetSpine.position.set(326, 444);
		// this.mAlphabetSpine.state.timeScale = 1000;

		// this.mAlphabetSpine.state.setAnimation(0, `tracing`, false);
		// this.mAlphabetSpine.state.tracks[0].trackTime = 0; // 씬시작시 알파벳이 채워진 상태로 플레이 시키기 위한 방법을 나타낸다.
		// this.mAlphabetSpine.update(1000);

		// this.mAlphabetSpine.state.setEmptyAnimation(0, 15);
		// this.mAlphabetSpine.state.addEmptyAnimation(0, 10000, 0);
		// this.mAlphabetSpine.state.setAnimation(0, "b", false);
		// const tSpineDuration = this.mAlphabetSpine.state.tracks[0].endTime;
		// console.log(tSpineDuration);
		// this.addChild(this.mAlphabetSpine);
		App.Handle.addChilds(this, this.mAlphabetSpine);

		this.mAlphabetSpine.state.addListener({
			complete: (trackIndex: PIXI.spine.core.TrackEntry) => {
				setTimeout(() => {
					this.mSpineIsPlaying = false;
					this.completedSpine();
				});
			},
			start: (trackIndex: PIXI.spine.core.TrackEntry) => {
				setTimeout(() => {
					this.mSpineIsPlaying = true;
				});
			},
		});

		// 알파벳 트레이싱을 나타낸다.
		this.mAlphabet = new Alphabet(App.Handle.getAlphabet, this.name);
		this.mAlphabet.position.set(670, 203);
		this.mAlphabet.addCustomEventListener(EventType.ReceiveData, evt => {
			this.eventReceive(evt);
		});
		// this.addChild(this.mAlphabet);
		App.Handle.addChilds(this, this.mAlphabet);

		//다시보기 버튼을 나타낸다.
		this.mReviewBtn = new Button(
			this.mViewSheet.textures['reviewbtn_ori.png'],
			this.mViewSheet.textures['reviewbtn_sel.png'],
			null,
			false,
			true,
		);
		this.mReviewBtn.setAnchor(0.5, 0.5);
		this.mReviewBtn.position.set(326, 135);
		this.mReviewBtn.addCustomEventListener(EventType.ButtonDown, evt => {
			this.mReviewBtn.selected = true;
			this.mEffect.createEffect(evt.data);
		});
		this.mReviewBtn.addCustomEventListener(EventType.ButtonUp, () => {
			this.mReviewBtn.selected = false;
			this.reviewAlphabet();
		});
		// this.addChild(this.mReviewBtn);
		App.Handle.addChilds(this, this.mReviewBtn, true);
		// this.mClearObj.push(this.mReviewBtn);

		//다시쓰기 버튼을 나타낸다.
		this.mRewriteBtn = new Button(
			this.mViewSheet.textures['rewritebtn_ori.png'],
			this.mViewSheet.textures['rewritebtn_sel.png'],
			null,
			false,
			true,
		);
		this.mRewriteBtn.setAnchor(0.5, 0.5);
		this.mRewriteBtn.position.set(897, 135);
		this.mRewriteBtn.addCustomEventListener(EventType.ButtonDown, evt => {
			this.mRewriteBtn.selected = true;
			this.mEffect.createEffect(evt.data);
		});
		this.mRewriteBtn.addCustomEventListener(EventType.ButtonUp, () => {
			this.mRewriteBtn.selected = false;
			this.rewriteAlphabet();
		});
		// this.addChild(this.mRewriteBtn);
		App.Handle.addChilds(this, this.mRewriteBtn, true);
		// this.mClearObj.push(this.mRewriteBtn);

		// 색상 선택할 수 있는 팔렛트를 나타낸다.---------------------------------------------------------------------------
		this.mPalletCt = new PIXI.Container();
		const tPalletSp = new PIXI.Sprite(this.mViewSheet.textures['pallet.png']);
		tPalletSp.anchor.set(0);
		tPalletSp.position.set(0, 0);
		// this.mPalletCt.addChild(tPalletSp);
		App.Handle.addChilds(this.mPalletCt, tPalletSp);

		const tRedBtn = new Button(
			this.mViewSheet.textures['redbtn_ori.png'],
			this.mViewSheet.textures['redbtn_sel.png'],
			null,
			false,
			true,
		);
		tRedBtn.position.set(12, 20);
		tRedBtn.addCustomEventListener(EventType.ButtonDown, evt => {
			this.mEffect.createEffect(evt.data);
		});
		tRedBtn.addCustomEventListener(EventType.ButtonUp, () => {
			this.setPalletColor(0xff0000, 0);
		});
		// this.mPalletCt.addChild(tRedBtn);
		App.Handle.addChilds(this.mPalletCt, tRedBtn, true);
		this.mPalletBtns.push(tRedBtn);

		const tOrangeBtn = new Button(
			this.mViewSheet.textures['orangebtn_ori.png'],
			this.mViewSheet.textures['orangebtn_sel.png'],
			null,
			false,
			true,
		);
		tOrangeBtn.position.set(12, 100);
		tOrangeBtn.addCustomEventListener(EventType.ButtonDown, evt => {
			this.mEffect.createEffect(evt.data);
		});
		tOrangeBtn.addCustomEventListener(EventType.ButtonUp, () => {
			this.setPalletColor(0xff7800, 1);
		});
		// this.mPalletCt.addChild(tOrangeBtn);
		App.Handle.addChilds(this.mPalletCt, tOrangeBtn, true);
		this.mPalletBtns.push(tOrangeBtn);

		const tBlueBtn = new Button(
			this.mViewSheet.textures['bluebtn_ori.png'],
			this.mViewSheet.textures['bluebtn_sel.png'],
			null,
			false,
			true,
		);
		tBlueBtn.position.set(12, 180);
		tBlueBtn.addCustomEventListener(EventType.ButtonDown, evt => {
			this.mEffect.createEffect(evt.data);
		});
		tBlueBtn.addCustomEventListener(EventType.ButtonUp, () => {
			this.setPalletColor(0x6a00ff, 2);
		});
		// this.mPalletCt.addChild(tBlueBtn);
		App.Handle.addChilds(this.mPalletCt, tBlueBtn, true);
		this.mPalletBtns.push(tBlueBtn);

		this.mPalletCt.position.set(1180, 250);
		// this.addChild(this.mPalletCt);
		this.setPalletColor(0xff0000, 0); // 빨간색 선택을 나타낸다.

		App.Handle.addChilds(this, this.mPalletCt);

		this.mEffect = new Effect();
		App.Handle.addChilds(this, this.mEffect);
		// this.mAlphabet.showTracingGuide( true );
	}

	async onStart() {
		await this.preLoadSound();
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
		tSnds.push([
			Rsc.product,
			this.name,
			`snd_${App.Handle.getAlphabet}_start.mp3`,
		]);
		tSnds.push([Rsc.viewer, 'common', 'snd_correct.mp3']);
		tSnds.push([Rsc.viewer, 'common', 'snd_finger.mp3']);
		tSnds.push([Rsc.viewer, 'common', 'snd_wrong.mp3']);
		tSnds.push([Rsc.viewer, 'common', 'scaffolding_sfx.mp3']);
		tSnds.push([Rsc.viewer, 'common', `eop_${this.mEopNum}.mp3`]);
		tSnds.push([Rsc.viewer, 'common', `eop_sfx.mp3`]);
		tSnds.push([
			Rsc.product,
			'common',
			`snd_${App.Handle.getAlphabet}_small.mp3`,
		]);
		tSnds.push([Rsc.product, 'common', `${App.Handle.getAlphabet}.mp3`]);
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
	// 다시보기 버튼 클릭시의 처리를 나타낸다.
	private reviewAlphabet() {
		this.mReviewBtn.disabled = true;
		this.mRewriteBtn.disabled = true;
		this.blinkReviewBtn(false);
		// this.showAlphabetSpine();
		this.showAlphabetSpine();
	}

	//다시쓰기 버튼 클릭시의 처리를 나타낸다.
	private rewriteAlphabet() {
		if (this.mIsShowPallet === false) {
			this.showPallet(true);
			this.mAlphabet.isLock = false;
			this.mAlphabet.reWrite();
			this.blinkReviewBtn(false);
		}
	}

	// resetMotion(down: boolean): Promise<void>{
	//     return new Promise<void>((resolve, reject)=>{
	//         if(this.mIntroMotion){
	//             this.mIntroMotion.kill();
	//             this.mIntroMotion = null;
	//         }
	//         let delay = 0;
	//         this.mIntroMotion = gsap.timeline({ });
	//         this.mIntroMotion.to(this.mTrueDirectionSp, {rotation: 0.1 * Math.PI, duration: 0.7, repeat: 3, yoyo:true })
	//         this.mIntroMotion.to(this.mTrueDirectionSp, {rotation: 0, duration: 0.3 })
	//         if(down){
	//             this.mIntroMotion.to(this.mTrueDirectionSp, {y: 860, duration: 0.3})
	//             delay = 0.6 + (0.7*3)
	//         }else{
	//             delay = 0.3 + (0.7*3)
	//         }
	//         gsap.delayedCall(delay,()=>{ resolve(); })
	//     })

	// }

	// delayAniTime(): Promise<void>{
	//     return new Promise<void>((resolve, reject)=>{
	//         gsap.delayedCall(1, () => resolve());
	//     })
	// }

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
		this.mTrueLockFlag = false;
		const downY = -130;
		const upY = -30;

		this.mTweenflag = 'showTrueTrue';
		this.mTrueDirectionSp.x = downY;

		App.Handle.pauseStageObjs();
		// const tSndDir01 = ViewerRscManager.Handle.getResource(this.name, 'snd_direction_01.mp3').sound;
		// this.mSnd = ViewerRscManager.Handle.getResource(
		// 	this.name,
		// 	'snd_direction_01.mp3',
		// ).sound;
		this.mIsShowTrue = true;
		this.mAlphabet.isLock = true;
		this.mSpeechBubbleSp.visible = false;
		this.mReviewBtn.disabled = true;
		this.mRewriteBtn.disabled = true;

		this.mTrueDirectionSp.rotation = 0;
		gsap.to(this.mTrueDirectionSp, { x: upY, duration: 0.3 });

		// tSndDir01.play();
		// this.mIntroMotion = gsap.timeline({ });
		// this.mIntroMotion.to(this.mTrueDirectionSp, {rotation: 0.1 * Math.PI, duration: 0.7, repeat: 3, yoyo:true })
		// this.mIntroMotion.to(this.mTrueDirectionSp, {rotation: 0, duration: 0.3 })

		const tDirection01 = SoundManager.Handle.getSound(
			this.name,
			`snd_${App.Handle.getAlphabet}_ready.mp3`,
		);
		if (!tDirection01.isPlaying) {
			// pixiSound.stopAll();
			// this.mSnd.play();
			tDirection01.play();
		}
		// await this.tweenMotion('soundplay', this.mSnd);
		// await this.tweenMotion('motioninit');
		this.setTrueMotion(false);
		// await this.tweenMotion('truemotion', false);
		await App.Handle.tweenMotion('delay', tDirection01.duration + 0.3);

		this.showAlphabetSpine();
		// this.showAlphabetSpine(0.3 + tSndDir01.duration );
		// this.showAlphabetSpine();
		// this.setTrueMotion(false)

		// gsap.to(this.mTrueDirectionSp, {y: 750, duration: 0.3}).eventCallback("onComplete", () => {
		//     if (!tSndDir01.isPlaying){
		//         tSndDir01.play({complete: () => {
		//             gsap.killTweensOf(this.mTrueDirectionSp);
		//             gsap.to(this.mTrueDirectionSp, {rotation: 0, duration: 1}).eventCallback("onComplete", ()=>{
		//                 this.showAlphabetSpine();
		//             })
		//         }});
		//     }

		//     gsap.to(this.mTrueDirectionSp, {rotation: 0.1 * Math.PI, duration: 0.7, repeat: -1, yoyo: true, yoyoEase: "power1" })

		// });
		this.mTrueLockFlag = true;
	}

	//알파벳 스파인 애니메이션 보기를 나타낸다.
	private async showAlphabetSpine() {
		if (!this.mSpineIsPlaying) {
			// if (this.mTweenflag === 'showAlphabetSpine'){
			this.mAlphabet.isLock = true;
			this.mAlphabetSpine.visible = true;
			SoundManager.Handle.getSound(
				'common',
				`${App.Handle.getAlphabet}.mp3`,
			).play();
			this.mAlphabetSpine.state.setAnimation(0, `tracing`, false);
		}
	}

	// 스파인 애니메이션 완료시의 처리를 나타낸다.
	private async completedSpine() {
		if (this.mTrueLockFlag == false) {
			return;
		}
		// console.log('completedSpine');
		// const tSndDir02 = ViewerRscManager.Handle.getResource(this.name, 'snd_direction_02.mp3').sound;
		// this.mSnd = ViewerRscManager.Handle.getResource(
		// 	this.name,
		// 	'snd_direction_02.mp3',
		// ).sound;
		// this.mTweenflag = 'completedSpine';
		this.mTweenflag = 'completedSpine';
		this.mAlphabetSpine.removeAllListeners();

		if (this.mIsShowTrue) {
			//    this.setTrueMotion(true);
			// await this.tweenMotion('motioninit');
			this.setTrueMotion(true);
			// await this.tweenMotion('truemotion', true);

			// tSndDir02.play();
			// await this.tweenMotion('soundplay', this.mSnd);
			const tDirection02 = SoundManager.Handle.getSound(
				this.name,
				`snd_${App.Handle.getAlphabet}_start.mp3`,
			);
			if (!tDirection02.isPlaying) {
				// pixiSound.stopAll();
				// this.mSnd.play();
				tDirection02.play();
			}

			await App.Handle.tweenMotion('delay', tDirection02.duration + 0.8);

			if (this.mTweenflag === 'completedSpine') {
				this.mSpeechBubbleSp.visible = true;
				this.mAlphabet.showTracingGuide(false);
				this.mAlphabet.isLock = false;
				this.mIsShowTrue = false;
				this.mReviewBtn.disabled = false;
				this.mRewriteBtn.disabled = false;
				App.Handle.playStageObjs();
			}

			//    this.mTweenflag = "init";
			//    this.mTweenFunc = () => {

			//    }
			//    gsap.ticker.add(this.mTweenFunc);

			// tSndDir02.play({complete: () => {
			//     // await this.delayAniTime();

			// }});
		} else {
			this.mAlphabet.showTracingGuide(false);
			this.mAlphabet.isLock = false;
			this.mReviewBtn.disabled = false;
			this.mRewriteBtn.disabled = false;
		}
		// if (this.mIsShowTrue) {
		//     tSndDir02.play({complete: () => {
		//         gsap.killTweensOf(this.mTrueDirectionSp);
		//         gsap.to(this.mTrueDirectionSp, {rotation: 0, duration: 1}).eventCallback("onComplete", ()=>{
		//             gsap.to(this.mTrueDirectionSp, {y: 860, duration: 0.3}).eventCallback("onComplete", ()=>{
		//                 this.mAlphabet.showTracingGuide();
		//                 this.mAlphabet.isLock = false;
		//                 this.mSpeechBubbleSp.visible = true;
		//                 this.mIsShowTrue = false;
		//                 this.mReviewBtn.disabled = false;
		//                 this.mRewriteBtn.disabled = false;
		//             });
		//         })
		//     }});

		//     gsap.to(this.mTrueDirectionSp, {rotation: 0.1 * Math.PI, duration: 0.7, repeat: -1, yoyo: true, yoyoEase: "power1" })

		// }else{
		//     this.mAlphabet.showTracingGuide();
		//     this.mAlphabet.isLock = false;
		//     this.mReviewBtn.disabled = false;
		//     this.mRewriteBtn.disabled = false;
		// }
	}

	//다시보기 버튼 반짝이는 처리를 나타낸다.
	private blinkReviewBtn(tVal: boolean) {
		this.mReviewBtn.stopblink();
		if (tVal) {
			// this.mAlphabet.isLock = true;
			this.mReviewBtn.blink(-1, 0.2);
		}
	}

	//액티비티 클리어 했을때의 처리를 나타낸다.
	private async clearActivity() {
		SoundManager.Handle.stopAll();
		this.mSpeechBubbleSp.visible = false;

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
				this.clearActivity();
				// this.destroy();
				this.dispatchEvent(EventType.ReceiveData, evt.data);
				break;
			case 'startTracing': //트레이싱 시작시 팔렛트 사라지는 처리를 나타낸다.
				this.showPallet(false);
				break;
			case 'twoFailed': //트레이싱 두번 실패시 다시보기 버튼 처리를 나타낸다.
				this.blinkReviewBtn(true);
				break;
			case 'reTracing': //트레이싱 쓰기 시작시 다시보기 버튼 원래대로 돌리는 처리를 나타낸다.
				this.blinkReviewBtn(false);
				break;
			default:
		}
	}

	//팔렛트 색상 선택에 대한 처리를 나타낸다.
	private setPalletColor(tColor: number, tBtnIdx: number) {
		for (const tBtn of this.mPalletBtns) {
			tBtn.selected = false;
		}
		this.mPalletBtns[tBtnIdx].selected = true;
		this.mAlphabet.color = tColor;
		// this.showPallet(false);
	}

	//팔렛트 이동에 대한 처리를 나타낸다.
	showPallet(tVal: boolean) {
		if (tVal) {
			this.mIsShowPallet = true;
			gsap.to(this.mPalletCt, { x: 1180, duration: 0.5 });
		} else {
			this.mIsShowPallet = false;
			gsap.to(this.mPalletCt, { x: 1300, duration: 0.5 });
		}
	}

	private destroyGsapAni() {
		if (this.mIntroMotion) {
			this.mIntroMotion.kill();
			this.mIntroMotion = null;
		}
		gsap.killTweensOf(this.mTrueDirectionSp);
		gsap.killTweensOf(this.mPalletCt);
		this.mAlphabet.isLock = true;
	}

	async onEnd() {
		this.mEffect.removeEffect();
		this.destroyGsapAni();
		SoundManager.Handle.removeAll();
		App.Handle.playStageObjs();
		App.Handle.clearStagObjs();
		App.Handle.removeMotionDelay();
		this.mAlphabet?.removeCustomEventListener(EventType.ReceiveData);
		this.mReviewBtn?.removeCustomEventListener(EventType.ButtonUp);
		this.mRewriteBtn?.removeCustomEventListener(EventType.ButtonUp);
		await App.Handle.removeChilds();
	}
}
