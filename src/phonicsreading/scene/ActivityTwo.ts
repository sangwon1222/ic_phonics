import { App } from '../../com/core/App';
import { SceneBase } from '../../com/core/SceneBase';
import { Button } from '../../com/widget/Button';
import { EventType } from '../../com/core/EventType';
import { CustomEvent } from '../../com/core/CustomEvent';
import { Timer } from '../../com/widget/Timer';
import { Star } from '../../com/widget/Star';
import * as Util from '../../com/util/Util';
import 'pixi-spine';

// Manager
import { ProductRscManager } from '../../com/manager/ProductRscManager';
import { ViewerRscManager } from '../../com/manager/ViewerRscManager';
import { Rsc, SoundManager } from '../../com/manager/SoundManager';

// Scene
import gsap from 'gsap';
import Config from '@/com/util/Config';
import PhonicsConf from '../PhonicsConf';
import { ObjectBase } from '@/com/core/ObjectBase';
import pixiSound from 'pixi-sound';
import { spine } from 'pixi.js';
import { Effect } from '@/com/widget/Effect';

class Block extends ObjectBase {
	private mStartBlankAry: Array<number>;
	private mEndBlankAry: Array<number>;
	private mDefaultWidth: number;
	private mWidth: number;
	private mHeight: number;
	private mFixWidth: number;
	private mIsDrag: boolean;
	private mPositionAry: Array<number>;

	public mBlockSp: PIXI.NineSlicePlane;
	public mTxtSp: PIXI.Text;
	public mNextX: number;
	public mBlockCt: PIXI.Container;
	private mFailCnt: number;
	private mViewSheet: PIXI.Spritesheet;

	get blockWidth(): number {
		return this.mWidth;
	}

	set isDrag(tBool: boolean) {
		// this.mIsDrag = tBool;
		this.mBlockCt.interactive = tBool;
	}

	constructor(
		public mTxt: string,
		public mBlockName: string,
		public mSkinNum: number,
		public mBlockIdx: number,
		public mStartPosX: number,
		public mCt: any,
		tPosY?: number,
		tCorrectAnswer?: boolean,
		tCorrectObj?: PIXI.Graphics,
	) {
		super();

		this.mFailCnt = 0;
		this.mPositionAry = [];
		tPosY === undefined ? (tPosY = 408) : null;
		// this.mCt === undefined ? (this.mCt = this) : null;
		this.mBlockIdx === 1 ? (this.mDefaultWidth = 50) : (this.mDefaultWidth = 0);

		this.mStartBlankAry = [
			PhonicsConf.skinblocks[this.mSkinNum].first.startblank,
			PhonicsConf.skinblocks[this.mSkinNum].middle.startblank,
			PhonicsConf.skinblocks[this.mSkinNum].last.startblank,
		];
		this.mEndBlankAry = [
			PhonicsConf.skinblocks[this.mSkinNum].first.endblank,
			PhonicsConf.skinblocks[this.mSkinNum].middle.endblank,
			PhonicsConf.skinblocks[this.mSkinNum].last.endblank,
		];

		this.mViewSheet = ViewerRscManager.Handle.getResource(
			'common',
			`act2_view.json`,
		).spritesheet;

		this.mBlockCt = new PIXI.Container();
		let tNineRect = [];
		switch (this.mBlockIdx) {
			case 0:
				tNineRect = PhonicsConf.skinblocks[this.mSkinNum].first.nineslice;
				break;
			case 1:
				tNineRect = PhonicsConf.skinblocks[this.mSkinNum].middle.nineslice;
				break;
			default:
				tNineRect = PhonicsConf.skinblocks[this.mSkinNum].last.nineslice;
		}
		this.mBlockSp = new PIXI.NineSlicePlane(
			this.mViewSheet.textures[this.mBlockName],
			tNineRect[0],
			tNineRect[1],
			tNineRect[2],
			tNineRect[3],
		);

		// this.mBlockSp.pivot.set(0.5);
		App.Handle.addChilds(this.mBlockCt, this.mBlockSp);
		// App.Handle.addChilds(this.mCt, this.mBlockCt);

		const questStyle = new PIXI.TextStyle({
			align: 'left',
			fill: '#ffffff',
			fontFamily: 'minigate Bold ver2',
			fontStyle: 'normal',
			fontSize: 36,
			padding: 10,
		});

		this.mTxtSp = new PIXI.Text(this.mTxt);
		this.mTxtSp.style = questStyle;
		this.mTxtSp.anchor.set(0, 0.5);
		// this.mTxtSp.pivot.set(0.5);

		App.Handle.addChilds(this.mBlockCt, this.mTxtSp);
		App.Handle.addChilds(this.mCt, this.mBlockCt);
		let tMinWidth = 0;
		this.mTxtSp.width < this.mDefaultWidth
			? (tMinWidth = this.mDefaultWidth)
			: (tMinWidth = this.mTxtSp.width);

		this.mBlockSp.width =
			tMinWidth +
			this.mStartBlankAry[this.mBlockIdx] +
			this.mEndBlankAry[this.mBlockIdx];

		this.mTxtSp.position.set(
			this.mStartBlankAry[this.mBlockIdx] +
				(this.mBlockSp.width -
					this.mTxtSp.width -
					this.mStartBlankAry[this.mBlockIdx] -
					this.mEndBlankAry[this.mBlockIdx]) /
					2,
			this.mBlockSp.height / 2,
		);

		this.mBlockCt.pivot.set(this.mBlockCt.width / 2, this.mBlockCt.height / 2);
		this.mBlockCt.position.set(
			this.mStartPosX + this.mBlockCt.width / 2,
			tPosY,
		);

		this.mNextX = this.mStartPosX + this.mBlockSp.width;
		this.mWidth = this.mBlockSp.width;

		//event 처리를 나타낸다.
		// this.mBlockCt.interactive = true;
		this.mBlockCt.buttonMode = true;
		this.mBlockCt.on('pointerdown', (evt: PIXI.InteractionEvent) => {
			if (this.mIsDrag) return;
			this.mIsDrag = true;
			this.mPositionAry[0] = this.mBlockCt.position.x;
			this.mPositionAry[1] = this.mBlockCt.position.y;
			this.mBlockCt.zIndex = 1;
			const point = evt.data.getLocalPosition(this) as PIXI.Point;
			this.mBlockCt.x = point.x;
			this.mBlockCt.y = point.y;
			// this.mBlockCt.x = point.x - this.mBlockCt.width / 7;
			// this.mBlockCt.y = point.y - 20;

			pixiSound.stopAll();
			SoundManager.Handle.getSound(
				'common',
				`${this.mTxt.toLowerCase()}.mp3`,
			).play();
			this.dispatchEvent(EventType.ReceiveData, 'MoveBlock');
			// console.log('pointerdown = ', this.mPositionAry[0], this.mPositionAry[1]);
		});

		this.mBlockCt.on('pointerup', (evt: PIXI.InteractionEvent) => {
			if (!this.mIsDrag) return;
			this.mIsDrag = false;
			this.mBlockCt.zIndex = 0;
			// this.mBlockCt.interactive = false;
			if (
				tCorrectAnswer &&
				tCorrectObj.hitArea.contains(
					this.mBlockCt.x + this.mBlockCt.width / 7,
					this.mBlockCt.y + 20,
				)
			) {
				//
				SoundManager.Handle.getSound('common', `activity_correct.mp3`).play();
				// console.log('CorrectAnswer~~!!');
				this.dispatchEvent(EventType.ReceiveData, 'CorrectAnswer');
			} else {
				SoundManager.Handle.getSound('common', `activity_wrong.mp3`).play();

				// console.log('WrongAnswer~~!!');
				this.mBlockCt.position.set(this.mPositionAry[0], this.mPositionAry[1]);

				this.mFailCnt++;
				// this.mAnswerImgAry[tIdx].angle = -20;
				this.dispatchEvent(EventType.ReceiveData, 'Failed');

				if (this.mFailCnt < 2) return;
				//
				this.mFailCnt = 0;

				this.dispatchEvent(EventType.ReceiveData, 'TwoFailed');
			}

			// console.log('pointerup = ', this.mPositionAry[0], this.mPositionAry[1]);
		});

		this.mBlockCt.on('pointermove', (evt: PIXI.InteractionEvent) => {
			//
			// console.log('pointermove = ', this.mIsDrag);
			if (!this.mIsDrag) return;
			const point = evt.data.getLocalPosition(this) as PIXI.Point;
			// this.mBlockCt.x = point.x - this.mBlockCt.width / 2;
			// this.mBlockCt.y = point.y - this.mBlockCt.height / 2;
			this.mBlockCt.x = point.x;
			this.mBlockCt.y = point.y;
			// this.mBlockCt.x = point.x - this.mBlockCt.width / 7;
			// this.mBlockCt.y = point.y - 20;

			// console.log('pointermove = ', this.x, this.y);
		});

		// const debug = new PIXI.Graphics();
		// debug.lineStyle(2, 0xff0000, 1);
		// debug.drawRect(
		// 	this.mTxtSp.x,
		// 	this.mTxtSp.y,
		// 	this.mTxtSp.width,
		// 	this.mTxtSp.height,
		// );
		// App.Handle.addChilds(this.mBlockCt, debug);
	}

	reLocBlock(tStartPosX: number, tWidth: number): number {
		switch (this.mSkinNum) {
			case 0:
				this.mFixWidth = 85 - (tWidth % 85);
				// this.mFixWidth = 0;
				break;
			case 1:
				this.mFixWidth = 111 - ((tWidth - 183) % 111) + 1;
				break;
			default:
				this.mFixWidth = 0;
		}
		// tGap > 55 ? null : (tGap = -tGap);
		// console.log(tWidth, tWidth - 183, this.mFixWidth);
		this.mBlockSp.x += this.mFixWidth;
		this.mTxtSp.x += this.mFixWidth;
		this.mNextX += this.mFixWidth;
		return this.mFixWidth;
	}

	fixWidth(tNum: number) {
		this.mBlockSp.width += tNum;
		this.mTxtSp.x += tNum / 2;
		this.mWidth = this.mBlockSp.width;
	}

	setWidth(tNum: number) {
		this.mBlockSp.width = tNum;
		this.mTxtSp.x =
			this.mBlockSp.x + (this.mBlockSp.width - this.mTxtSp.width) / 2;
		this.mWidth = this.mBlockSp.width;
	}
}

export class ActivityTwo extends SceneBase {
	private mSkinNum: number;
	private mSndPlayBtn: Button;
	private mScoreStarCt: PIXI.Container;
	private mScoreStarBg: Array<Star>;
	private mScoreStar: Array<Star>;
	private mFinStarCnt = 2;

	private mTureTrue: PIXI.Sprite;
	private mTureTrue2: PIXI.Sprite;

	private mQuestSentenceAry: Array<string>;
	private mCorrectAnswerAry: Array<string>;
	private mWrongAnswerAry: Array<string>;
	private mQuestWordAry: Array<string>;

	private mAnswerCtAry: Array<Block>;
	private mQuestAry: Array<number>;
	private mQuestNum: number;
	private mFailCnt: number;
	private mQuestBgStartXAry: Array<number>;
	private mQuestText: string;
	private mQuestTxtSp: PIXI.Text;
	private mQuestImg: PIXI.Sprite;
	private mQuestBackBlock: PIXI.NineSlicePlane;

	private mEopNum: number;
	private mTrueDirectionCt: PIXI.Container;
	private mTrueDirectionSp: PIXI.Sprite;
	private mIsShowTrue: boolean;
	private mSpeechBubbleSp: PIXI.AnimatedSprite;
	private mIsQuest: boolean;
	private mFingerSp: PIXI.Sprite;
	private mTimeOutHnd: Timer;
	private mGuideNum: number;
	private mAniTimeLine: any;
	private mViewSheet: PIXI.Spritesheet;
	private mCommonSheet: PIXI.Spritesheet;

	private mQuestSound: pixiSound.Sound;
	private mEffect: Effect;

	constructor() {
		super();
		this.name = 'ActivityTwo';

		this.sortableChildren = true; // zIndex 처리를 위한 준비과정을 나타낸다.
	}

	async onInit() {
		//
		this.mAnswerCtAry = [];
		this.mQuestAry = [0, 1];
		this.mFailCnt = 0;
		this.mQuestNum = 0;
		this.mGuideNum = 0;
		this.mIsQuest = false;

		this.selectEop();

		// const bgGraphics = new PIXI.Graphics();
		//
		// bgGraphics.beginFill(0xfcb612);
		// bgGraphics.drawRect(0, 0, App.Handle.appWidth, App.Handle.appHeight);
		// bgGraphics.endFill();
		// this.addChild(bgGraphics);
		this.mCommonSheet = ViewerRscManager.Handle.getResource(
			'common',
			`ap_view.json`,
		).spritesheet;
		this.mViewSheet = ViewerRscManager.Handle.getResource(
			'common',
			`act2_view.json`,
		).spritesheet;

		const tRandomNum = Math.floor(Math.random() * 3 + 1);
		// console.log('++++ this.mSkinNum =' + this.mSkinNum);
		// this.mSkinNum = 2;
		let tSkinStr = '';
		if (
			PhonicsConf.activityTwoBg === null ||
			PhonicsConf.activityTwoBg === undefined ||
			PhonicsConf.activityTwoBg === ''
		) {
			tSkinStr = String(tRandomNum);
			PhonicsConf.activityTwoBg = tSkinStr;
		} else {
			tSkinStr = PhonicsConf.activityTwoBg;
		}
		this.mSkinNum = Number(tSkinStr);

		const tSkinBg = new PIXI.Sprite(
			this.mViewSheet.textures[`${this.mSkinNum}_bg.png`],
		);
		tSkinBg.anchor.set(0.5);
		tSkinBg.position.set(640.5, 408);
		App.Handle.addChilds(this, tSkinBg);

		// const tQuestBgStartXAry = [660, 673, 640.5];
		// this.mQuestBgStartXAry = [260, 247.5, 640.5];
		this.mQuestBgStartXAry = [0, 247.5, 0];

		this.mSndPlayBtn = new Button(
			this.mViewSheet.textures['speaker2_normal.png'],
			this.mViewSheet.textures['speaker2_down.png'],
			null,
			false,
			true,
		);
		this.mSndPlayBtn.setAnchor(1, 0.5);
		// this.mSndPlayBtn.position.set(
		// 	this.mQuestBgStartXAry[this.mSkinNum - 1] - 33,
		// 	411,
		// );
		// this.addChild(this.closeBtn);
		this.mSndPlayBtn.visible = false;
		App.Handle.addChilds(this, this.mSndPlayBtn, true);

		this.mSndPlayBtn.addCustomEventListener(EventType.ButtonDown, evt => {
			this.mEffect.createEffect(evt.data);
		});
		this.mSndPlayBtn.addCustomEventListener(EventType.ButtonUp, async () => {
			// this.destroy();
			// this.dispatchEvent(EventType.ReceiveData, 'Quit');
			if (this.mQuestSound?.isPlaying) return;

			this.mQuestSound = SoundManager.Handle.getSound(
				this.name,
				`${Config.subjectNum}_ac_${this.mQuestAry[0] + 3}.mp3`,
			);
			if (!this.mQuestSound.isPlaying) this.mQuestSound.play();

			this.mSndPlayBtn.selected = true;
			await App.Handle.tweenMotion('delay', this.mQuestSound.duration);
			this.mSndPlayBtn.selected = false;
		});

		this.mScoreStarCt = new PIXI.Container();
		this.mScoreStarCt.position.set(App.Handle.appWidth - 117, 88.5);
		const tScoreBgImg = new PIXI.Sprite(
			this.mCommonSheet.textures['2star_bg.png'],
		);
		App.Handle.addChilds(this.mScoreStarCt, tScoreBgImg, true);

		const tEdgeImg = new PIXI.NineSlicePlane(
			this.mViewSheet.textures['edge2.png'],
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
			const star = new Star(this.mCommonSheet.textures['star_off.png'], true);
			star.anchor.set(0.5);
			star.position.set(27 + i * 38, 22);
			// tScoreBgImg.addChild(star);
			App.Handle.addChilds(tScoreBgImg, star, true);
			this.mScoreStarBg.push(star);
		}
		this.mScoreStar = [];
		for (let i = 0; i < this.mFinStarCnt; i++) {
			const star = new Star(this.mCommonSheet.textures['star.png'], false);
			star.anchor.set(0.5);
			star.position.set(27 + i * 38, 22);
			// tScoreBgImg.addChild(star);
			App.Handle.addChilds(tScoreBgImg, star, true);
			this.mScoreStar.push(star);
		}
		// this.mScoreStar[0].changeState()
		// this.addChild(this.mScoreStarCt);
		App.Handle.addChilds(this, this.mScoreStarCt, true);

		this.mEffect = new Effect();
		App.Handle.addChilds(this, this.mEffect);

		// console.log(
		// 	ProductRscManager.Handle.getResource(this.name, 'studywords') as any,
		// );
		this.mQuestSentenceAry = [
			...(ProductRscManager.Handle.getResource(this.name, 'studywords') as any),
		];
		this.mCorrectAnswerAry = [
			...(ProductRscManager.Handle.getResource(this.name, 'correctstr') as any),
		];
		this.mWrongAnswerAry = [
			...(ProductRscManager.Handle.getResource(this.name, 'wrongstr') as any),
		];
		this.mQuestWordAry = [
			...(ProductRscManager.Handle.getResource('words', 'studywords') as any),
		];

		this.dispatchEvent(EventType.ReceiveData, 'StartMode');
	}

	async onStart() {
		await this.preLoadSound();

		// 뚜루두루 디렉션 캐릭터를 나타낸다.
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
		this.mTrueDirectionSp.position.set(-230, 225);
		this.mTrueDirectionSp.anchor.set(0.2, 0.5);
		// this.mTrueDirectionSp.zIndex = 100;
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

		// this.mTrueDirectionCt.zIndex = 1;
		// this.addChild(tTrueDirectionCt);
		App.Handle.addChilds(this, this.mTrueDirectionCt, true);

		this.mFingerSp = new PIXI.Sprite(tTrueTrueSheet.textures['finger.png']);
		this.mFingerSp.visible = false;
		this.mFingerSp.zIndex = 2;
		// this.addChild(this.mFingerSp);
		App.Handle.addChilds(this, this.mFingerSp);

		this.setQuest();
	}

	//사운드 미리 불러오기를 나타낸다.
	private async preLoadSound() {
		if (window['Android']) {
			if (App.Handle.loading === null || App.Handle.loading === undefined)
				window['Android'].showLoading();
		}

		const tSnds = [];
		tSnds.push([Rsc.viewer, 'common', 'button_click.mp3']);
		tSnds.push([Rsc.viewer, this.name, 'pr_ac_dic_2.mp3']);
		tSnds.push([Rsc.viewer, 'common', `eop_${this.mEopNum}.mp3`]);
		tSnds.push([Rsc.viewer, 'common', `eop_sfx.mp3`]);
		tSnds.push([Rsc.viewer, 'common', 'gain_star.mp3']);
		tSnds.push([Rsc.viewer, 'common', `activity_correct.mp3`]);
		tSnds.push([Rsc.viewer, 'common', `activity_wrong.mp3`]);
		tSnds.push([Rsc.product, 'common', `${this.mQuestWordAry[0]}.mp3`]);
		tSnds.push([Rsc.product, 'common', `${this.mQuestWordAry[1]}.mp3`]);
		tSnds.push([Rsc.product, 'common', `${this.mQuestWordAry[2]}.mp3`]);
		tSnds.push([Rsc.product, 'common', `${this.mQuestWordAry[3]}.mp3`]);
		tSnds.push([Rsc.product, this.name, `${Config.subjectNum}_ac_3.mp3`]);
		tSnds.push([Rsc.product, this.name, `${Config.subjectNum}_ac_4.mp3`]);
		await SoundManager.Handle.loadSounds(tSnds);

		const tPreSnds = [];
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
		down ? (tCnt = 5) : (tCnt = 3);
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
		await App.Handle.tweenMotion('delay', delay);
	}

	//뚜루뚜루 디렉션 캐릭터가 나타나 설명하는 애니메이션 처리를 나타낸다.
	private async showTrueTrue() {
		const downY = -130;
		const upY = -30;
		pixiSound.stopAll();

		this.mFingerSp != null ? this.hideFingerGuide() : null;
		this.mTimeOutHnd?.pause();

		this.mTrueDirectionSp.x = downY;

		App.Handle.pauseStageObjs();
		if (this.mAnswerCtAry != null && this.mAnswerCtAry != []) {
			this.mAnswerCtAry[0].isDrag = false;
			this.mAnswerCtAry[1].isDrag = false;
		}
		// const tSndDir01 = ViewerRscManager.Handle.getResource(
		// 	this.name,
		// 	'snd_direction_01.mp3',
		// ).sound;
		this.mIsShowTrue = true;
		// this.mAlphabet.isLock = true;
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
			`pr_ac_dic_2.mp3`,
		);
		tDirection01.play();
		await App.Handle.tweenMotion('delay', tDirection01.duration + 0.5);
		// this.mAlphabet.showTracingGuide();
		// this.mAlphabet.isLock = false;
		App.Handle.playStageObjs();
		this.mSpeechBubbleSp.visible = true;
		if (this.mAnswerCtAry != null && this.mAnswerCtAry != []) {
			this.mAnswerCtAry[0].isDrag = true;
			this.mAnswerCtAry[1].isDrag = true;
		}
		this.mTimeOutHnd?.resume();
		this.mIsShowTrue = false;
	}

	//Quest 설정을 나타낸다.
	private async setQuest() {
		App.Handle.pauseStageObjs();

		this.mIsQuest = true;
		this.mQuestAry = Util.shuffleArray(this.mQuestAry);
		const tQuestNum = this.mQuestAry[0];
		this.mQuestText = this.mQuestSentenceAry[tQuestNum] as string;
		const tIdxNum = this.mQuestText.indexOf('_');
		// const tIdxNum = 0;
		let tFirstQuestText = '';
		tIdxNum > 0
			? (tFirstQuestText = this.mQuestText.slice(0, tIdxNum - 1))
			: null;

		const tLastQuestText = this.mQuestText.slice(
			tIdxNum + 1,
			this.mQuestText.length,
		);

		const tSelectSkinNum = this.mSkinNum - 1;
		const tStartX = this.mQuestBgStartXAry[tSelectSkinNum];

		// console.log(`${Config.subjectNum}_ac_${tQuestNum + 3}.png`);
		this.mQuestImg = new PIXI.Sprite(
			ProductRscManager.Handle.getResource(
				'common',
				`${Config.subjectNum}_ac_${tQuestNum + 3}.png`,
			).texture,
		);
		this.mQuestImg.anchor.set(0.5);
		this.mQuestImg.position.set(639, 212.5);
		// this.mQuestImg.scale.set(0.8);
		this.mQuestImg.alpha = 0;
		App.Handle.addChilds(this, this.mQuestImg);

		this.mQuestImg.scale.set(1.3);
		gsap.to(this.mQuestImg, { alpha: 1, duration: 0.5 });
		gsap.to(this.mQuestImg.scale, { x: 0.7, y: 0.7, duration: 0.5 });

		const tQuestCt = new PIXI.Container();
		const tNineRect = PhonicsConf.skinblocks[tSelectSkinNum].back.nineslice;
		this.mQuestBackBlock = new PIXI.NineSlicePlane(
			this.mViewSheet.textures[`${this.mSkinNum}_under_block.png`],
			tNineRect[0],
			tNineRect[1],
			tNineRect[2],
			tNineRect[3],
		);
		App.Handle.addChilds(tQuestCt, this.mQuestBackBlock);

		//First Block Setting을 나타낸다.
		const tFirstBlock = new Block(
			tFirstQuestText,
			`${this.mSkinNum}_f_block_1.png`,
			tSelectSkinNum,
			0,
			tStartX,
			tQuestCt,
		);
		if (tFirstQuestText == '') {
			console.log('tFirstQuestText is blank');
			// tFirstBlock.mNextX = tStartX;
			// tFirstBlock.setWidth(0);
			// tFirstBlock.visible = false;
		}
		this.mAnswerCtAry[2] = tFirstBlock;
		tFirstBlock.mBlockCt.alpha = 0;
		gsap.to(tFirstBlock.mBlockCt, { alpha: 1, duration: 1 });

		//Middle Block Setting을 나타낸다.
		// this.mAnswerCtAry[2] = new PIXI.Container();
		const tMiddleStartX =
			tFirstBlock.mNextX -
			PhonicsConf.skinblocks[tSelectSkinNum].middle.combineX;

		const tMiddleBlock = new Block(
			this.mCorrectAnswerAry[tQuestNum],
			`${this.mSkinNum}_m_block_1.png`,
			tSelectSkinNum,
			1,
			tMiddleStartX,
			tQuestCt,
		);
		// App.Handle.addChilds(tQuestCt, this.mAnswerCtAry[2]);
		this.mAnswerCtAry[3] = tMiddleBlock;
		this.mAnswerCtAry[3].mBlockCt.alpha = 0;

		//Last Block Setting을 나타낸다.
		const tLastStartX =
			tMiddleBlock.mNextX -
			PhonicsConf.skinblocks[tSelectSkinNum].last.combineX;
		const tLastBlock = new Block(
			tLastQuestText,
			`${this.mSkinNum}_l_block_1.png`,
			tSelectSkinNum,
			2,
			tLastStartX,
			tQuestCt,
		);
		this.mAnswerCtAry[4] = tLastBlock;
		tLastBlock.mBlockCt.alpha = 0;
		gsap.to(tLastBlock.mBlockCt, { alpha: 1, duration: 1 });

		//Block Background를 나타낸다.
		const tSentenceWidth =
			tFirstBlock.blockWidth +
			tMiddleBlock.blockWidth +
			tLastBlock.blockWidth -
			PhonicsConf.skinblocks[tSelectSkinNum].middle.combineX -
			PhonicsConf.skinblocks[tSelectSkinNum].last.combineX;
		const tFixWidth = tLastBlock.reLocBlock(tStartX, tSentenceWidth);
		this.mQuestBackBlock.width = tLastBlock.mNextX - tStartX;
		// console.log('tBlock.width = ' + tBlock.width);
		this.mQuestBackBlock.position.set(
			tStartX,
			408 - this.mQuestBackBlock.height / 2,
		);
		App.Handle.addChilds(this, tQuestCt);

		//문장길이에 따른 Quest 콘테이너의 위치 재설정을 나타낸다.
		tQuestCt.x = (Config.width - tSentenceWidth) / 2;
		if (tSelectSkinNum === 1) {
			tQuestCt.x = 0;
			if (tSentenceWidth < 406) {
				tQuestCt.x = 111 * 2;
			} else if (tSentenceWidth < 628) {
				tQuestCt.x = 111;
			} else if (tSentenceWidth > 961) {
				tQuestCt.x = -111;
			}
		}

		//문장길이에 따른 스피커 버튼의 위치 재설정을 나타낸다.
		this.mSndPlayBtn.position.set(
			this.mQuestBackBlock.x + tQuestCt.x - 33,
			411,
		);
		this.mSndPlayBtn.visible = true;
		// console.log('tQuestCt =' + tQuestCt.x);

		tMiddleBlock.fixWidth(tFixWidth);

		const tQuestRectArea = new PIXI.Graphics();
		// tQuestRectArea.lineStyle(2, 0xff0000, 1);
		// tQuestRectArea.drawRect(
		// 	tStartX + tQuestCt.x,
		// 	tMiddleBlock.mBlockCt.y - tMiddleBlock.mBlockCt.height / 2,
		// 	tSentenceWidth + tFixWidth,
		// 	tMiddleBlock.mBlockCt.height,
		// );
		// App.Handle.addChilds(this, tQuestRectArea);
		tQuestRectArea.hitArea = new PIXI.Rectangle(
			tStartX + tQuestCt.x,
			tMiddleBlock.mBlockCt.y - tMiddleBlock.mBlockCt.height / 2,
			tSentenceWidth + tFixWidth,
			tMiddleBlock.mBlockCt.height,
		);

		// this.mAnswerCtAry[1] = new PIXI.Container();
		//답변 블록의 기본 위치 설정을 나타낸다.
		const tAnswerCenterX =
			(Config.width / 2 - 115 - tMiddleBlock.blockWidth) / 2;

		// 답변 블록의 랜덤 위치 설정을 나타낸다.
		let tAnswerPosAry = [
			115 + tAnswerCenterX + 50,
			Config.width / 2 + tAnswerCenterX - 50,
		];
		tAnswerPosAry = Util.shuffleArray(tAnswerPosAry);
		const tCorrectBlock = new Block(
			this.mCorrectAnswerAry[tQuestNum],
			`${this.mSkinNum}_m_block_1.png`,
			tSelectSkinNum,
			1,
			tAnswerPosAry[0],
			this,
			582.5,
			true,
			tQuestRectArea,
		);
		// tCorrectBlock.pivot.set(0.5);
		tCorrectBlock.setWidth(tMiddleBlock.blockWidth);
		App.Handle.addChilds(this, tCorrectBlock, true);
		this.mAnswerCtAry[0] = tCorrectBlock;
		tCorrectBlock.addCustomEventListener(EventType.ReceiveData, evt =>
			this.eventReceive(evt),
		);
		const tCorrectBlockX = tCorrectBlock.mBlockCt.x;
		let tGapX = 0;
		tCorrectBlockX > 600 ? (tGapX = 200) : (tGapX = -200);
		tCorrectBlock.mBlockCt.alpha = 0;
		tCorrectBlock.mBlockCt.x = tCorrectBlockX + tGapX;
		gsap.to(tCorrectBlock.mBlockCt, {
			alpha: 1,
			x: tCorrectBlockX,
			duration: 0.5,
		});

		// this.mAnswerCtAry[2] = new PIXI.Container();
		const tWrongBlock = new Block(
			this.mWrongAnswerAry[tQuestNum],
			`${this.mSkinNum}_m_block_1.png`,
			tSelectSkinNum,
			1,
			tAnswerPosAry[1],
			this,
			582.5,
			false,
			tQuestRectArea,
		);
		tWrongBlock.setWidth(tMiddleBlock.blockWidth);
		App.Handle.addChilds(this, tWrongBlock, true);
		this.mAnswerCtAry[1] = tWrongBlock;

		tWrongBlock.addCustomEventListener(EventType.ReceiveData, evt =>
			this.eventReceive(evt),
		);
		const tWrongBlockX = tWrongBlock.mBlockCt.x;
		tWrongBlockX > 600 ? (tGapX = 200) : (tGapX = -200);
		tWrongBlock.mBlockCt.alpha = 0;
		tWrongBlock.mBlockCt.x = tWrongBlockX + tGapX;
		gsap.to(tWrongBlock.mBlockCt, {
			alpha: 1,
			x: tWrongBlockX,
			duration: 0.5,
		});

		const questStyle = new PIXI.TextStyle({
			align: 'left',
			fill: '#ffffff',
			fontFamily: 'minigate Bold ver2',
			fontStyle: 'normal',
			fontSize: 36,
			padding: 10,
		});
		this.mQuestText = this.mQuestText.replace(
			'_',
			this.mCorrectAnswerAry[tQuestNum],
		);
		this.mQuestTxtSp = new PIXI.Text(this.mQuestText);
		this.mQuestTxtSp.style = questStyle;
		this.mQuestTxtSp.anchor.set(0.5, 0.5);
		this.mQuestTxtSp.position.set(
			tStartX + tQuestCt.x + (tSentenceWidth + tFixWidth) / 2,
			tMiddleBlock.mBlockCt.y,
		);
		this.mQuestTxtSp.alpha = 0;
		App.Handle.addChilds(this, this.mQuestTxtSp);

		if (this.mQuestNum === 0) {
			await App.Handle.tweenMotion('delay', 0.5);
			await this.showTrueTrue();
		} else {
			await App.Handle.tweenMotion('delay', 0.5);
		}

		tCorrectBlock.isDrag = true;
		tWrongBlock.isDrag = true;

		// console.log(`${Config.subjectNum}_ac_${this.mQuestAry[0] + 3}.mp3`);
		this.mQuestSound = SoundManager.Handle.getSound(
			this.name,
			`${Config.subjectNum}_ac_${this.mQuestAry[0] + 3}.mp3`,
		);
		if (!this.mQuestSound.isPlaying) this.mQuestSound.play();

		this.mSndPlayBtn.selected = true;
		App.Handle.playStageObjs();
		this.mGuideNum = 0;
		this.showFingerGuide();

		await App.Handle.tweenMotion('delay', this.mQuestSound.duration);
		this.mSndPlayBtn.selected = false;
	}

	// Quest 종료를 나타낸다.
	private async questEnd() {
		App.Handle.pauseStageObjs();
		this.mSpeechBubbleSp.visible = false;
		this.hideFingerGuide();

		this.mAnswerCtAry[0].isDrag = false;
		this.mAnswerCtAry[1].isDrag = false;
		gsap.to(this.mAnswerCtAry[0].mBlockCt, { alpha: 0, duration: 0.5 });
		gsap.to(this.mAnswerCtAry[3].mBlockCt, { alpha: 1, duration: 0.5 });

		await App.Handle.tweenMotion('delay', 1);
		const tMiddleText = this.mAnswerCtAry[3].mTxtSp;
		const tFirstGap = tMiddleText.x;
		const tLastGap = tMiddleText.x;

		gsap.to(this.mAnswerCtAry[2].mTxtSp, {
			x: tFirstGap,
			alpha: 0,
			duration: 1,
		});

		gsap.to(this.mAnswerCtAry[3].mTxtSp, {
			alpha: 0,
			duration: 1,
		});

		gsap.to(this.mAnswerCtAry[4].mTxtSp, {
			x: tLastGap,
			alpha: 0,
			duration: 1,
		});

		await App.Handle.tweenMotion('delay', 0.2);
		gsap.to(this.mQuestTxtSp, {
			alpha: 1,
			duration: 1,
		});

		await App.Handle.tweenMotion('delay', 1);

		const tSound = SoundManager.Handle.getSound(
			this.name,
			`${Config.subjectNum}_ac_${this.mQuestAry[0] + 3}.mp3`,
		);
		tSound.play();

		await App.Handle.tweenMotion('delay', tSound.duration + 0.5);

		await this.mScoreStar[this.mQuestNum].showStar();
		this.mScoreStarBg[this.mQuestNum].hideStar();
		await App.Handle.tweenMotion('delay', 1);

		this.mIsQuest = false;
		this.mQuestNum++;
		if (this.mQuestNum == this.mFinStarCnt) {
			console.log('clearActivity');
			// this.mTrueDirectionCt.zIndex = 0;
			this.clearActivity();
			return;
		}

		gsap.to(this.mQuestImg, { alpha: 0, duration: 1 });
		gsap.to(this.mQuestTxtSp, { alpha: 0, duration: 1 });
		for (let i = 0; i < 5; i++) {
			gsap.to(this.mAnswerCtAry[i].mBlockCt, { alpha: 0, duration: 1 });
		}

		await App.Handle.tweenMotion('delay', 1);

		App.Handle.removeChild(this.mQuestImg);
		this.mQuestImg = null;
		App.Handle.removeChild(this.mQuestBackBlock);
		this.mQuestBackBlock = null;
		for (let tData of this.mAnswerCtAry) {
			App.Handle.removeChild(tData.mBlockSp);
			App.Handle.removeChild(tData.mTxtSp);
			App.Handle.removeChild(tData);
			tData = null;
		}
		this.mAnswerCtAry = [];
		this.mQuestAry.shift();
		this.setQuest();
		this.mSpeechBubbleSp.visible = true;
	}

	private async doFailed() {
		await App.Handle.tweenMotion('delay', 1);
		this.startTimeOut(10, true);
	}

	private async twoFailed() {
		// console.log('twoFailed');
		this.mAnswerCtAry[1].isDrag = false;
		// App.Handle.pauseStageObjs();
		App.Handle.tweenMotion('delay', 0.5);
		if (this.mAniTimeLine) {
			this.mAniTimeLine.kill();
			this.mAniTimeLine = null;
		}
		// this.mAnswerCtAry[1].pivot.set(0.5, 0.5);
		// this.mAnswerCtAry[0].mBlockCt.pivot.set(
		// 	this.mAnswerCtAry[0].mBlockCt.width / 2,
		// 	this.mAnswerCtAry[0].mBlockCt.height / 2,
		// );

		this.mAniTimeLine = gsap.timeline({});
		this.mAniTimeLine.to(this.mAnswerCtAry[0].mBlockCt, {
			angle: -10,
			duration: 0.2,
		});
		this.mAniTimeLine.to(this.mAnswerCtAry[0].mBlockCt, {
			angle: 10,
			duration: 0.3,
			repeat: 2,
			yoyo: true,
		});
		this.mAniTimeLine.to(this.mAnswerCtAry[0].mBlockCt, {
			angle: 0,
			duration: 0.4,
		});
		this.mAnswerCtAry[1].isDrag = true;
	}
	// 10초마다 손가락 디렉션 보여주기를 나타낸다.
	private startTimeOut(tTime: number, tStart?: boolean) {
		// this.mTimeOutHnd = setTimeout(() => {
		// 	this.showFingerGuide();
		// }, 1000 * tTime);
		if (this.mTimeOutHnd !== null) {
			this.mTimeOutHnd?.clear();
			this.mTimeOutHnd?.destroy();
			this.mTimeOutHnd = null;
		}

		if (tStart) this.mGuideNum = 0;

		this.mTimeOutHnd = new Timer(() => {
			this.showFingerGuide();
		}, 1000 * tTime);
	}

	//손가락 보이기를 나타낸다.
	private async showFingerGuide() {
		// console.log('showfingerguide', this.mGuideNum);
		if (!this.mIsQuest) {
			this.mFingerSp.visible = false;
			return;
		}

		if (this.mGuideNum > 5) return;
		if (this.mFingerSp === null) return;
		let tPosX = 0;
		let tPosY = 0;
		const tNowGuideNum = this.mGuideNum % 2;
		// console.log(
		// 	'!!! x = ' + this.mAnswerCtAry[tNowGuideNum].mBlockCt.x,
		// 	this.mAnswerCtAry[tNowGuideNum].mBlockCt.y,
		// );
		const tPosXAry = [402, 827];

		tPosX = tPosXAry[tNowGuideNum];
		tPosY = 582.5;

		this.mFingerSp.position.x = tPosX + 10;
		this.mFingerSp.position.y = tPosY + 20;
		this.mFingerSp.alpha = 1;
		this.mFingerSp.visible = true;
		this.mFingerSp.scale.set(1.3);
		gsap.killTweensOf(this.mFingerSp);
		gsap.to(this.mFingerSp, { x: tPosX, y: tPosY, duration: 0.5 });
		await App.Handle.tweenMotion('delay', 0.5);
		gsap.to(this.mFingerSp.scale, {
			x: 1,
			y: 1,
			duration: 0.5,
			// ease: 'back.out(4)',
		});
		await App.Handle.tweenMotion('delay', 0.5);
		gsap.to(this.mFingerSp, {
			y: 500,
			alpha: 0,
			duration: 0.5,
			// ease: 'back.out(4)',
		});
		await App.Handle.tweenMotion('delay', 0.5);

		this.mFingerSp.visible = false;
		// clearTimeout(this.mTimeOutHnd);
		// this.mTimeOutHnd?.clear();
		// this.mTimeOutHnd = null;

		if (this.mGuideNum < 5) {
			this.mGuideNum++;
			this.startTimeOut(0.5);
		} else {
			// this.mGuideNum = 0;
			this.startTimeOut(10, true);
		}
	}

	//손가락 감추기를 나타낸다.
	private hideFingerGuide() {
		// clearTimeout(this.mTimeOutHnd);
		this.mTimeOutHnd?.clear();
		this.mTimeOutHnd = null;
		this.mFingerSp.visible = false;
		this.mGuideNum = 10;
	}

	//액티비티 클리어 했을때의 처리를 나타낸다.
	private async clearActivity() {
		SoundManager.Handle.stopAll();
		this.mSpeechBubbleSp.visible = false;
		this.dispatchEvent(EventType.ReceiveData, 'ClearMode');

		console.log(`eop${this.mEopNum}`);
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
			case 'CorrectAnswer':
				this.questEnd();
				break;
			case 'TwoFailed':
				this.twoFailed();
				break;
			case 'Failed':
				this.doFailed();
				break;
			case 'MoveBlock':
				this.hideFingerGuide();
				break;
			default: {
				//
			}
		}
	}

	private destroyGsapAni() {
		if (this.mAniTimeLine) {
			this.mAniTimeLine.kill();
			this.mAniTimeLine = null;
		}

		gsap.killTweensOf(this.mTrueDirectionSp);
		gsap.killTweensOf(this.mFingerSp);
		for (let i = 0; i < 5; i++) {
			gsap.killTweensOf(this.mAnswerCtAry[i].mBlockCt);
		}
		gsap.killTweensOf(this.mQuestImg);
		gsap.killTweensOf(this.mQuestTxtSp);
		gsap.killTweensOf(this.mQuestTxtSp);
	}

	async onEnd() {
		this.mGuideNum = 10;
		if (this.mTimeOutHnd !== null) {
			this.mTimeOutHnd?.clear();
			this.mTimeOutHnd?.destroy();
			this.mTimeOutHnd = null;
		}
		this.mEffect.removeEffect();
		this.destroyGsapAni();
		SoundManager.Handle.removeAll();
		App.Handle.clearStagObjs();
		App.Handle.removeMotionDelay();
		await App.Handle.removeChilds();
	}
}
