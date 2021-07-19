import { App } from '../../com/core/App';
//Base Module
import { SceneBase } from '../../com/core/SceneBase';
import { EventType } from '../../com/core/EventType';
import { CustomEvent } from '../../com/core/CustomEvent';
import { Button } from '../../com/widget/Button';
//Pixi Module
import { spine, Texture } from 'pixi.js';
import 'pixi-spine';
import RichText from 'pixi-multistyle-text';
import pixiSound from 'pixi-sound';
import gsap from 'gsap';
//Manager Module
import { ViewerRscManager } from '../../com/manager/ViewerRscManager';
import { ProductRscManager } from '../../com/manager/ProductRscManager';
import { Rsc, SoundManager } from '../../com/manager/SoundManager';
//Scene Module
import { Timer } from '../../com/widget/Timer';
import { Star } from '../../com/widget/Star';
import * as Util from '../../com/util/Util';
import Config from '@/com/util/Config';
import { Effect } from '@/com/widget/Effect';
import { VideoCam } from '@/com/widget/VideoCam';

export class Practice extends SceneBase {
	private mQuestCt: PIXI.Container;
	private mRecEffSpine: spine.Spine;
	private mSndRecBtn: Button;
	private mSndPlayBtn: Button;
	private mSndRePlayBtn: Button;
	private mSndEndBtn: Button;
	private mSpeechbubbleSp: PIXI.Sprite;
	private mSpeechBalloonImg: PIXI.NineSlicePlane;
	private mQuestTxtSp: PIXI.Text;
	private mAnswerTxtSp: PIXI.Text;
	private mAnswerAniTxtSp: RichText;
	private mAnswerCharSp: PIXI.Sprite;
	private mStudyWordsAry: Array<string>;
	private mQuestStrAry: Array<string>;
	private mCorrectStrAry: Array<string>;

	private mScoreStarCt: PIXI.Container;
	private mScoreStarBg: Array<Star>;
	private mScoreStar: Array<Star>;
	private mFinStarCnt = 3;

	private mQuestAry: Array<number>;
	private mQuestNum: number;
	private mFailCnt: number;
	private mBlinkWordNum: number;

	private mEopNum: number;
	private mAniTimeLine: any;
	private mTrueDirectionCt: PIXI.Container;
	private mTrueDirectionSp: PIXI.Sprite;
	private mIsShowTrue: boolean;
	private mSpeechBubbleSp: PIXI.AnimatedSprite;
	private mIsQuest: boolean;
	private mFingerSp: PIXI.Sprite;
	private mTimeOutHnd: Timer;
	private mRecTimerHnd: Timer;
	private mGuideNum: number;
	private mViewSheet: PIXI.Spritesheet;

	private mQuestSound: pixiSound.Sound;
	private mAnswerSnd: pixiSound.Sound;
	private mEffect: Effect;
	private mPlayMode: string;
	private mVideoCam: VideoCam;
	private mVideoCamMask: PIXI.Sprite;

	constructor() {
		super();
		this.name = 'Practice';
	}

	async onInit() {
		this.mPlayMode = 'init';
		this.mQuestAry = [0, 1, 2];
		this.mBlinkWordNum = 0;
		this.mQuestNum = 0;
		this.mIsQuest = false;

		this.selectEop();

		//배경 색상을 나타낸다.
		const tColorAry = ProductRscManager.Handle.getResource(
			this.name,
			'bgcolor',
		) as any;
		const tBackImg = new PIXI.Graphics();
		tBackImg.beginFill(tColorAry[0]);
		tBackImg.drawRect(0, 0, App.Handle.appWidth, App.Handle.appHeight);
		tBackImg.endFill();
		// this.mStageCt.addChild(tBackImg);
		App.Handle.addChilds(this, tBackImg);

		this.mViewSheet = ViewerRscManager.Handle.getResource(
			'common',
			`ap_view.json`,
		).spritesheet;

		//녹음버튼 클릭시의 애니메이션을 나타낸다.
		this.mRecEffSpine = new PIXI.spine.Spine(
			ViewerRscManager.Handle.getResource(
				'common',
				`timer_10sec.json`,
			).spineData,
		);
		this.mRecEffSpine.visible = false;
		this.mRecEffSpine.position.set(640, 655);
		App.Handle.addChilds(this, this.mRecEffSpine);

		//사운드 녹음하기 버튼을 나타낸다.
		this.mSndRecBtn = new Button(
			this.mViewSheet.textures['mic_btn.png'],
			null,
			this.mViewSheet.textures['mic_stop_btn.png'],
			false,
			true,
		);
		this.mSndRecBtn.setAnchor(0.5, 0.5);
		this.mSndRecBtn.position.set(Config.width / 2, 655);
		App.Handle.addChilds(this, this.mSndRecBtn, true);

		this.mSndRecBtn.addCustomEventListener(EventType.ButtonDown, evt => {
			this.mEffect.createEffect(evt.data);
		});
		this.mSndRecBtn.addCustomEventListener(EventType.ButtonUp, async () => {
			this.startRecSnd();
		});

		//사운드 녹음 플레이 버튼을 나타낸다.
		this.mSndPlayBtn = new Button(
			this.mViewSheet.textures['play_btn.png'],
			this.mViewSheet.textures['play_btn_down.png'],
			null,
			false,
			true,
		);
		this.mSndPlayBtn.setAnchor(0.5, 0.5);
		this.mSndPlayBtn.position.set(Config.width / 2, 655);
		this.mSndPlayBtn.visible = false;
		App.Handle.addChilds(this, this.mSndPlayBtn, true);

		this.mSndPlayBtn.addCustomEventListener(EventType.ButtonDown, evt => {
			this.mEffect.createEffect(evt.data);
		});
		this.mSndPlayBtn.addCustomEventListener(EventType.ButtonUp, async () => {
			this.mSndPlayBtn.selected = true;
			this.playRecSound();
		});

		//사운드 다시하기 버튼을 나타낸다.
		this.mSndRePlayBtn = new Button(
			this.mViewSheet.textures['replay_btn_normal.png'],
			this.mViewSheet.textures['replay_btn_down.png'],
			null,
			false,
			true,
		);
		this.mSndRePlayBtn.setAnchor(0.5, 0.5);
		this.mSndRePlayBtn.position.set(456.5, 659.5);
		this.mSndRePlayBtn.visible = false;
		App.Handle.addChilds(this, this.mSndRePlayBtn, true);

		this.mSndRePlayBtn.addCustomEventListener(EventType.ButtonDown, evt => {
			this.mSndRePlayBtn.selected = true;
			this.mEffect.createEffect(evt.data);
		});
		this.mSndRePlayBtn.addCustomEventListener(EventType.ButtonUp, async () => {
			this.mSndRecBtn.visible = true;
			this.mSndPlayBtn.visible = false;
			this.mSndPlayBtn.selected = false;

			this.mSndRePlayBtn.selected = false;
			this.mSndRePlayBtn.visible = false;
			this.mSndEndBtn.visible = false;
			this.startRecSnd();
		});

		this.mSndEndBtn = new Button(
			this.mViewSheet.textures['end_btn_normal.png'],
			this.mViewSheet.textures['end_btn_down.png'],
			null,
			false,
			true,
		);
		this.mSndEndBtn.setAnchor(0.5, 0.5);
		this.mSndEndBtn.position.set(823.5, 659.5);
		this.mSndEndBtn.visible = false;
		App.Handle.addChilds(this, this.mSndEndBtn, true);

		//사운드 다했어요 버튼을 나타낸다.
		this.mSndEndBtn.addCustomEventListener(EventType.ButtonDown, evt => {
			this.mSndEndBtn.selected = true;
			this.mEffect.createEffect(evt.data);
		});
		this.mSndEndBtn.addCustomEventListener(EventType.ButtonUp, async () => {
			this.mSndRecBtn.visible = true;
			this.mSndPlayBtn.visible = false;
			this.mSndPlayBtn.selected = false;

			this.mSndEndBtn.selected = false;
			this.mSndRePlayBtn.visible = false;
			this.mSndEndBtn.visible = false;

			this.hideFingerGuide();
			this.uploadRecSound();
			this.endQuest();
		});

		this.mSpeechbubbleSp = new PIXI.Sprite(
			this.mViewSheet.textures['speechbubble_img.png'],
		);
		this.mSpeechbubbleSp.anchor.set(0.5);
		this.mSpeechbubbleSp.position.set(209, 134);
		App.Handle.addChilds(this, this.mSpeechbubbleSp, true);

		this.mQuestCt = new PIXI.Container();
		this.mSpeechBalloonImg = new PIXI.NineSlicePlane(
			this.mViewSheet.textures['speechbubble.png'],
			50,
			15,
			50,
			15,
		);
		this.mSpeechBalloonImg.position.set(262, 106);
		this.mSpeechBalloonImg.visible = false;
		App.Handle.addChilds(this.mQuestCt, this.mSpeechBalloonImg, true);

		const style = new PIXI.TextStyle({
			align: 'center',
			fill: 0x333333,
			fontFamily: 'minigate Bold ver2',
			fontWeight: 'normal',
			fontSize: 32,
			padding: 10,
		});

		this.mQuestTxtSp = new PIXI.Text(``);
		this.mQuestTxtSp.style = style;
		this.mQuestTxtSp.position.set(287, 113);
		App.Handle.addChilds(this.mQuestCt, this.mQuestTxtSp, true);
		App.Handle.addChilds(this, this.mQuestCt, true);

		const tExBoxSp = new PIXI.Sprite(this.mViewSheet.textures['ex_box.png']);
		tExBoxSp.anchor.set(0.5);
		tExBoxSp.position.set(505, 336);
		App.Handle.addChilds(this, tExBoxSp);

		this.mVideoCamMask = new PIXI.Sprite(
			this.mViewSheet.textures['camera_off_box.png'],
		);
		this.mVideoCamMask.anchor.set(0.5);
		this.mVideoCamMask.position.set(929, 331.5);
		App.Handle.addChilds(this, this.mVideoCamMask);

		const bigStyle = new PIXI.TextStyle({
			align: 'center',
			fill: 0x333333,
			fontFamily: 'minigate Bold ver2',
			fontWeight: 'normal',
			fontSize: 62,
			padding: 10,
		});

		this.mAnswerTxtSp = new PIXI.Text(``);
		this.mAnswerTxtSp.style = bigStyle;
		this.mAnswerTxtSp.anchor.set(0.5);
		this.mAnswerTxtSp.position.set(639.5, 541.5);
		App.Handle.addChilds(this, this.mAnswerTxtSp, true);

		this.mScoreStarCt = new PIXI.Container();
		this.mScoreStarCt.position.set(App.Handle.appWidth - 160, 88.5);
		const tScoreBgImg = new PIXI.Sprite(
			this.mViewSheet.textures['star_bg.png'],
		);
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
			App.Handle.addChilds(tScoreBgImg, star, true);
			this.mScoreStarBg.push(star);
		}
		this.mScoreStar = [];
		for (let i = 0; i < this.mFinStarCnt; i++) {
			const star = new Star(this.mViewSheet.textures['star.png'], false);
			star.anchor.set(0.5);
			star.position.set(27 + i * 38, 22);
			App.Handle.addChilds(tScoreBgImg, star, true);
			this.mScoreStar.push(star);
		}
		App.Handle.addChilds(this, this.mScoreStarCt, true);

		this.mEffect = new Effect();
		this.mEffect.zIndex = 3;
		App.Handle.addChilds(this, this.mEffect);

		this.mStudyWordsAry = [
			...(ProductRscManager.Handle.getResource(this.name, 'studywords') as any),
		];
		this.mQuestStrAry = [
			...(ProductRscManager.Handle.getResource(this.name, 'queststr') as any),
		];
		this.mCorrectStrAry = [
			...(ProductRscManager.Handle.getResource(this.name, 'correctstr') as any),
		];

		this.dispatchEvent(EventType.ReceiveData, 'StartMode');
	}
	async onStart() {
		await this.preLoadSound();

		this.mPlayMode = 'StartScene';
		// 뚜루두루 디렉션 캐릭터를 나타낸다.
		this.mTrueDirectionCt = new PIXI.Container();

		const tTrueTrueSheet = ViewerRscManager.Handle.getResource(
			'common',
			`ap_view.json`,
		).spritesheet;

		this.mTrueDirectionSp = new PIXI.Sprite(
			tTrueTrueSheet.textures['truetrue.png'],
		);
		this.mTrueDirectionSp.position.set(-130, 225);
		this.mTrueDirectionSp.anchor.set(0.2, 0.5);
		App.Handle.addChilds(this.mTrueDirectionCt, this.mTrueDirectionSp, true);

		this.mSpeechBubbleSp = new PIXI.AnimatedSprite(
			tTrueTrueSheet.animations['speechBubble'],
		);
		this.mSpeechBubbleSp.animationSpeed = 0.06;
		this.mSpeechBubbleSp.play();
		this.mSpeechBubbleSp.position.set(47.5, 154.5);
		this.mSpeechBubbleSp.visible = false;
		App.Handle.addChilds(this.mTrueDirectionCt, this.mSpeechBubbleSp, true);

		this.mTrueDirectionCt.interactive = true;
		this.mTrueDirectionCt.on('pointertap', (evt: PIXI.InteractionEvent) => {
			if (this.mIsShowTrue) {
				// console.log(`tTrueDirectionCt TAB`);
			} else {
				this.showTrueTrue(false);
			}
		});

		this.mTrueDirectionCt.zIndex = 1;
		App.Handle.addChilds(this, this.mTrueDirectionCt, true);

		this.mFingerSp = new PIXI.Sprite(this.mViewSheet.textures['finger.png']);
		this.mFingerSp.visible = false;
		this.mFingerSp.zIndex = 2;
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
		tSnds.push([Rsc.viewer, this.name, 'sw_pr_dic1.mp3']);
		tSnds.push([Rsc.viewer, this.name, 'sw_pr_dic2.mp3']);
		tSnds.push([Rsc.viewer, this.name, 'practice_record.mp3']);
		tSnds.push([Rsc.viewer, 'common', `eop_${this.mEopNum}.mp3`]);
		tSnds.push([Rsc.viewer, 'common', `eop_sfx.mp3`]);
		tSnds.push([Rsc.viewer, 'common', 'scaffolding_sfx.mp3']);
		tSnds.push([Rsc.viewer, 'common', 'gain_star.mp3']);
		tSnds.push([Rsc.viewer, 'common', `activity_correct.mp3`]);
		tSnds.push([Rsc.viewer, 'common', `activity_wrong.mp3`]);
		tSnds.push([Rsc.product, this.name, `sw_pr_${Config.subjectNum}_1.mp3`]);
		tSnds.push([Rsc.product, this.name, `sw_pr_${Config.subjectNum}_2.mp3`]);
		tSnds.push([Rsc.product, this.name, `sw_pr_${Config.subjectNum}_3.mp3`]);
		tSnds.push([Rsc.product, this.name, `sw_pr_${Config.subjectNum}_4.mp3`]);
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

	private async setTrueMotion(down: boolean, tDicDelayCnt: number) {
		if (this.mAniTimeLine) {
			this.mAniTimeLine.kill();
			this.mAniTimeLine = null;
		}
		let delay = 0;
		let tCnt = 0;
		down ? (tCnt = tDicDelayCnt) : (tCnt = 3);
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

			this.mAniTimeLine.to(this.mTrueDirectionSp, {
				x: -130,
				duration: 0.3,
			});
			delay = 0.6 + 0.7 * tCnt;
		} else {
			delay = 0.3 + 0.7 * tCnt;
		}
		await App.Handle.tweenMotion('delay', delay);
	}

	//뚜루뚜루 디렉션 캐릭터가 나타나 설명하는 애니메이션 처리를 나타낸다.
	private async showTrueTrue(tFirst: boolean) {
		const downY = -130;
		const upY = -30;

		let tDicSndName = '';
		let tDicSndDelay = 0;
		let tDicDelayCnt = 0;
		if (tFirst) {
			tDicSndName = `sw_pr_dic1.mp3`;
			tDicSndDelay = 0.5;
			tDicDelayCnt = 5;
		} else {
			tDicSndName = `sw_pr_dic2.mp3`;
			tDicSndDelay = 0.5;
			tDicDelayCnt = 2;
		}

		pixiSound.stopAll();
		this.mFingerSp != null ? this.hideFingerGuide() : null;
		this.mTimeOutHnd?.pause();

		this.mTrueDirectionSp.x = downY;

		this.mSndRecBtn.disabled = true;
		App.Handle.pauseStageObjs();
		this.mIsShowTrue = true;
		this.mSpeechBubbleSp.visible = false;

		this.mTrueDirectionSp.rotation = 0;
		gsap.to(this.mTrueDirectionSp, { x: upY, duration: 0.3 });

		this.setTrueMotion(true, tDicDelayCnt);

		const tDirection01 = SoundManager.Handle.getSound(this.name, tDicSndName);
		tDirection01.play();
		await App.Handle.tweenMotion('delay', tDirection01.duration + tDicSndDelay);
		if (this.mIsQuest) {
			App.Handle.playStageObjs();
			this.mSndRecBtn.disabled = false;
			this.mSpeechBubbleSp.visible = true;
		}

		this.mTimeOutHnd?.resume();
		this.mIsShowTrue = false;
	}

	private async setQuest() {
		App.Handle.pauseStageObjs();
		this.mAnswerTxtSp.alpha = 1;
		this.mSndRecBtn.interactive = false;
		this.mSndRecBtn.disabled = true;
		this.mSpeechBubbleSp.visible = false;

		this.mQuestTxtSp.text = this.mQuestStrAry[0];
		this.mSpeechBalloonImg.visible = true;
		this.mSpeechBalloonImg.width = this.mQuestTxtSp.width + 45;

		this.mQuestAry = Util.shuffleArray(this.mQuestAry);
		const tQuestNum = this.mQuestAry[0];
		const tAnswerTxt = this.mCorrectStrAry[0]
			.replace('_', this.mStudyWordsAry[tQuestNum])
			.trim();

		this.mAnswerTxtSp.text = tAnswerTxt;

		this.mAnswerCharSp = new PIXI.Sprite(
			ProductRscManager.Handle.getResource(
				this.name,
				`sw_pr_${Config.subjectNum}_${tQuestNum + 2}.png`,
			).texture,
		);
		this.mAnswerCharSp.alpha = 0;
		this.mAnswerCharSp.anchor.set(0.5);
		this.mAnswerCharSp.position.set(505, 336 + 30);
		this.addChild(this.mAnswerCharSp);

		gsap.to(this.mAnswerCharSp, {
			y: 336,
			duration: 0.7,
			ease: 'back.out(1.7)',
		});
		gsap.to(this.mAnswerCharSp, { alpha: 1, duration: 0.7 });
		if (this.mPlayMode === 'StartScene') {
			await this.showTrueTrue(true);
		}
		this.mPlayMode = 'setQuest';

		const tQuestSnd = SoundManager.Handle.getSound(
			this.name,
			`sw_pr_${Config.subjectNum}_1.mp3`,
		);
		tQuestSnd.play();

		this.mQuestCt.pivot.set(this.mQuestCt.width, 0);
		this.mQuestCt.position.set(this.mQuestCt.width, this.mQuestCt.y);
		let tRepeatDelay;
		tRepeatDelay = tQuestSnd.duration - 0.5;
		gsap.to(this.mQuestCt.scale, {
			x: 1.1,
			y: 1.1,
			duration: 0.5,
			repeatDelay: tRepeatDelay,
			repeat: 1,
			yoyo: true,
		});
		gsap.to(this.mQuestCt, {
			y: this.mQuestCt.y - this.mQuestCt.height / 4,
			duration: 0.5,
			repeatDelay: tRepeatDelay,
			repeat: 1,
			yoyo: true,
		});

		await App.Handle.tweenMotion('delay', tQuestSnd.duration + 0.3);

		this.mAnswerSnd = SoundManager.Handle.getSound(
			this.name,
			`sw_pr_${Config.subjectNum}_${tQuestNum + 2}.mp3`,
		);
		this.mAnswerTxtSp.interactive = true;
		this.mAnswerTxtSp.buttonMode = true;
		this.mAnswerTxtSp.on('pointertap', (evt: PIXI.InteractionEvent) => {
			if (!this.mAnswerSnd.isPlaying) this.mAnswerSnd.play();
		});

		this.mAnswerSnd.play();
		tRepeatDelay = this.mAnswerSnd.duration - 0.5;
		if (tRepeatDelay < 0) tRepeatDelay = 0;
		gsap.to(this.mAnswerTxtSp.scale, {
			x: 1.1,
			y: 1.1,
			duration: 0.5,
			repeatDelay: tRepeatDelay,
			repeat: 1,
			yoyo: true,
		});

		await App.Handle.tweenMotion('delay', this.mAnswerSnd.duration + 0.3);

		await this.showTrueTrue(false);

		this.blinkText(tAnswerTxt, false);

		App.Handle.playStageObjs();
		this.mIsQuest = true;
		this.mGuideNum = 0;
		this.showFingerGuide();

		this.mSndRecBtn.interactive = true;
		this.mSndRecBtn.disabled = false;
		this.mSpeechBubbleSp.visible = true;
	}

	// 현재 퀘스트 종료 체크를 나타낸다.
	private async endQuest() {
		App.Handle.pauseStageObjs();
		this.mPlayMode = 'endQuest';
		this.mSndRecBtn.disabled = true;
		await this.mScoreStar[this.mQuestNum].showStar();
		this.mScoreStarBg[this.mQuestNum].hideStar();
		await App.Handle.tweenMotion('delay', 1);

		this.mQuestNum++;
		if (this.mQuestNum > 2) {
			this.mTrueDirectionCt.zIndex = 0;
			this.hideFingerGuide();
			this.clearActivity();
		} else {
			gsap.to(this.mAnswerCharSp, { alpha: 0, duration: 0.5 });
			gsap.to(this.mAnswerTxtSp, { alpha: 0, duration: 0.5 });
			await App.Handle.tweenMotion('delay', 1);
			this.mAnswerCharSp.destroy();
			this.mAnswerCharSp = null;
			this.mAnswerTxtSp.text = '';

			this.mQuestAry.splice(0, 1);
			this.setQuest();
		}
	}

	//녹음 시작을 나타낸다.
	private async startRecSnd() {
		this.mSndRecBtn.interactive = false;
		this.mSndRecBtn.disabled = true;
		this.hideFingerGuide();
		App.Handle.pauseStageObjs();
		this.mSpeechBubbleSp.visible = false;

		if (window['Android']) {
			await window['Android'].stopSound();
		}

		gsap.killTweensOf(this.mAnswerAniTxtSp);
		this.mAnswerAniTxtSp?.destroy();
		this.mAnswerAniTxtSp = null;
		this.blinkText(this.mAnswerTxtSp.text, true);
		this.mSndRecBtn.selected = true;

		if (this.mVideoCam === null || this.mVideoCam === undefined) {
			this.mVideoCam = new VideoCam();
			this.mVideoCamMask.texture = this.mViewSheet.textures[
				'camera_on_box.png'
			];

			if (Config.mobile) {
				this.mVideoCam.onStart(
					609, // 929 - 640 / 2,
					91.5, // 331.5 - 480 / 2,
					640,
					480,
					this.mVideoCamMask,
				);
			} else {
				this.mVideoCam.onStart(805, 177.5, 248, 308, this.mVideoCamMask);
			}

			App.Handle.addChilds(this, this.mVideoCam);
		}

		this.clearRecTimer();

		// 다시 녹음하기시 앞부분이 잘린다는 요청이 있어서 녹음시간을 10.5로 늘리고 앞부분에 0.5초 정도의 애니메이션 대기 시간을 준다.
		this.mRecTimerHnd = new Timer(() => {
			this.stopRecSnd();
		}, 1000 * 10.5);

		if (window['Android']) {
			await window['Android'].startRecord(1000 * 10.5);
		}
		await App.Handle.tweenMotion('delay', 0.5);
		this.mRecEffSpine.state.setAnimation(0, `animation`, false);
		this.mRecEffSpine.visible = this.mSndRecBtn.selected;
	}

	private clearRecTimer() {
		if (this.mRecTimerHnd !== null) {
			this.mRecTimerHnd?.clear();
			this.mRecTimerHnd?.destroy();
			this.mRecTimerHnd = null;
		}
	}

	//녹음 완료를 나타낸다.
	private stopRecSnd() {
		this.mBlinkWordNum = 0;
		this.hideFingerGuide();
		this.mRecEffSpine.visible = false;
		this.mSndRecBtn.selected = false;
		this.mSndRecBtn.visible = false;
		this.mSndPlayBtn.visible = true;
		this.mSndRePlayBtn.visible = true;
		this.mSndEndBtn.visible = true;

		this.mAnswerAniTxtSp.alpha = 0;
		gsap.killTweensOf(this.mAnswerAniTxtSp);

		this.mGuideNum = 0;
		this.showFingerGuide();
		this.mRecTimerHnd.pause();
		App.Handle.playStageObjs();
		this.mSpeechBubbleSp.visible = true;
	}

	// 녹음 파일 로컬 저장을 나타낸다.
	private async saveRecSound() {
		if (window['Android']) {
			await window['Android'].stopRecord();
		}
	}

	// 녹음 파일 플레이를 나타낸다.
	private async playRecSound() {
		if (window['Android']) {
			await window['Android'].startSound();
		}

		this.hideFingerGuide();
		const tDuration = this.mRecTimerHnd.leaveTime / 1000;
		await App.Handle.tweenMotion('delay', tDuration);
		this.mSndPlayBtn.selected = false;
		this.mGuideNum = 0;
		this.startTimeOut(10, true);
	}

	// 녹음 파일 서버 업로드를 나타낸다.
	private async uploadRecSound() {
		if (window['Android']) {
			await window['Android'].stopSound();
			const tSndBase64 = await window['Android'].getAudioFileBase64();
			App.Handle.netModule.addSndFileData(this.mQuestNum, tSndBase64);
			console.log(`uploadRecSound = ${tSndBase64}`);
			console.log(tSndBase64);
		}
	}

	//답변 텍스트 위에 더미 텍스트 만드는 과정을 나타낸다.
	private blinkText(tAnswerTxt: string, tSlice: boolean) {
		const tTextAry = tAnswerTxt.split(' ');
		let tViewTxt = '';
		if (tSlice) {
			this.mBlinkWordNum >= tTextAry.length ? (this.mBlinkWordNum = 0) : null;
			for (let i = 0; i < tTextAry.length; i++) {
				i > 0 ? (tViewTxt += ' ') : null;
				if (this.mBlinkWordNum === i) {
					tViewTxt += `<ani>${tTextAry[i]}</ani>`;
				} else {
					tViewTxt += `<noani>${tTextAry[i]}</noani>`;
				}
			}
		} else {
			tViewTxt = `<ani>${tAnswerTxt}</ani>`;
		}

		this.mAnswerAniTxtSp = new RichText(tViewTxt, {
			default: {
				align: 'center',
				fill: 0x333333,
				fontFamily: 'minigate Bold ver2',
				fontWeight: 'normal',
				fontSize: 62,
				padding: 10,
			},
			ani: {
				fill: 0xffffff,
			},
			noani: {
				fill: 0x333333,
			},
		});
		this.mAnswerAniTxtSp.anchor.set(0.5);
		this.mAnswerAniTxtSp.position.set(639.5, 541.5);
		this.mAnswerAniTxtSp.alpha = 1;
		this.addChild(this.mAnswerAniTxtSp);
		this.blinkAni(tAnswerTxt, tSlice);
	}

	//답변 텍스트의 반짝이는 애니메이션을 나타낸다.
	private async blinkAni(tAnswerTxt: string, tSlice: boolean) {
		await gsap.to(this.mAnswerAniTxtSp, {
			alpha: 0,
			duration: 1,
			delay: 0.5,
		});
		App.Handle.tweenMotion('delay', 2);
		tSlice ? this.mBlinkWordNum++ : null;
		this.blinkText(tAnswerTxt, tSlice);
	}

	// 10초마다 손가락 디렉션 보여주기를 나타낸다.
	private startTimeOut(tTime: number, tStart?: boolean) {
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
		if (!this.mIsQuest) {
			this.mFingerSp.visible = false;
			return;
		}
		if (this.mGuideNum > 5) return;

		let tPosX = 0;
		let tPosY = 0;
		const tNowGuideNum = this.mGuideNum % 2;
		tPosX = 640;
		tPosY = 660;
		// if (this.mFingerSp != null) {
		this.mFingerSp.position.x = tPosX + 10;
		this.mFingerSp.position.y = tPosY + 20;
		this.mFingerSp.alpha = 1;
		this.mFingerSp.visible = true;
		this.mFingerSp.scale.set(1.3);
		// }

		this.mFingerSp.scale.set(1.3);
		gsap.to(this.mFingerSp, { x: tPosX, y: tPosY, duration: 0.5 });
		await App.Handle.tweenMotion('delay', 0.5);

		SoundManager.Handle.getSound('common', `scaffolding_sfx.mp3`).play();

		gsap.to(this.mFingerSp.scale, {
			x: 1,
			y: 1,
			duration: 0.5,
			ease: 'back.out(4)',
		});
		await App.Handle.tweenMotion('delay', 0.5);

		gsap.to(this.mFingerSp.scale, { x: 1.3, y: 1.3, duration: 0.4 });
		await App.Handle.tweenMotion('delay', 0.4);
		gsap.to(this.mFingerSp, { alpha: 0, duration: 1 });

		this.startTimeOut(10, true);
		// }
	}

	//손가락 감추기를 나타낸다.
	private hideFingerGuide() {
		this.mTimeOutHnd?.clear();
		this.mTimeOutHnd = null;
		if (this.mFingerSp === null || this.mFingerSp === undefined) return;
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

		App.Handle.netModule.uploadSndFile();
	}

	//이벤트 받기를 나타낸다.
	private eventReceive(evt: CustomEvent) {
		console.log(`eventReceive = ${evt.data}`);

		switch (evt.data) {
			case 'ClearMode':
				this.dispatchEvent(EventType.ReceiveData, evt.data);
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
		gsap.killTweensOf(this.mAnswerAniTxtSp);
		gsap.killTweensOf(this.mQuestCt);
		gsap.killTweensOf(this.mAnswerCharSp);
		gsap.killTweensOf(this.mAnswerTxtSp);
	}

	async onEnd() {
		this.mGuideNum = 10;
		if (this.mTimeOutHnd !== null) {
			this.mTimeOutHnd?.clear();
			this.mTimeOutHnd?.destroy();
			this.mTimeOutHnd = null;
		}
		this.clearRecTimer();

		if (this.mVideoCam !== null) {
			this.mVideoCam?.onEnd();
			this.mVideoCam?.destroy();
			this.mVideoCam = null;
		}
		this.mEffect.removeEffect();
		this.destroyGsapAni();
		SoundManager.Handle.removeAll();
		App.Handle.clearStagObjs();
		App.Handle.removeMotionDelay();
		await App.Handle.removeChilds();
	}
}
