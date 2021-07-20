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
import pixiSound from 'pixi-sound';
import { spine } from 'pixi.js';
import { Effect } from '@/com/widget/Effect';

export class ActivityOne extends SceneBase {
	private mSndPlayBtn: Button;
	private mScoreStarCt: PIXI.Container;
	private mScoreStarBg: Array<Star>;
	private mScoreStar: Array<Star>;
	private mFinStarCnt = 2;

	private mCorrectAnswerAry: Array<string>;
	private mWrongAnswerAry: Array<string>;
	private mAnswerImgAry: Array<PIXI.Sprite>;
	private mBoardCtAry: Array<PIXI.Container>;
	private mQuestAry: Array<number>;
	private mQuestNum: number;
	private mFailCnt: number;

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
	private mViewSheet: PIXI.Spritesheet;

	private mBtnEffSpine: spine.Spine;
	private mQuestSound: pixiSound.Sound;
	private mEffect: Effect;

	constructor() {
		super();
		this.name = 'ActivityOne';

		this.sortableChildren = true; // zIndex 처리를 위한 준비과정을 나타낸다.
	}

	async onInit() {
		this.mCorrectAnswerAry = [];
		this.mWrongAnswerAry = [];
		this.mAnswerImgAry = [];
		this.mQuestAry = [0, 1];
		this.mFailCnt = 0;
		this.mQuestNum = 0;
		this.mGuideNum = 0;
		this.mIsQuest = false;

		this.selectEop();

		const bgGraphics = new PIXI.Graphics();

		bgGraphics.beginFill(0xffb8aa);
		bgGraphics.drawRect(0, 0, App.Handle.appWidth, App.Handle.appHeight);
		bgGraphics.endFill();
		this.addChild(bgGraphics);

		this.mViewSheet = ViewerRscManager.Handle.getResource(
			'common',
			`ap_view.json`,
		).spritesheet;

		this.mSndPlayBtn = new Button(
			this.mViewSheet.textures['speaker_normal.png'],
			this.mViewSheet.textures['speaker_down.png'],
			null,
			false,
			true,
		);
		this.mSndPlayBtn.setAnchor(0.5, 0.5);
		this.mSndPlayBtn.position.set(Config.width / 2, 164);
		// this.addChild(this.closeBtn);
		this.mSndPlayBtn.visible = false;
		App.Handle.addChilds(this, this.mSndPlayBtn, true);

		// console.log(
		// 	`@@@@@ Config.subjectNum = ${Config.subjectNum}_ac_${this.mQuestAry[0] +
		// 		1}`,
		// );
		this.mSndPlayBtn.addCustomEventListener(EventType.ButtonDown, evt => {
			this.mEffect.createEffect(evt.data);
		});
		this.mSndPlayBtn.addCustomEventListener(EventType.ButtonUp, async () => {
			// this.destroy();
			// this.dispatchEvent(EventType.ReceiveData, 'Quit');
			if (this.mQuestSound?.isPlaying) return;

			this.mQuestSound = SoundManager.Handle.getSound(
				this.name,
				`${Config.subjectNum}_ac_${this.mQuestAry[0] + 1}.mp3`,
			);

			if (!this.mQuestSound.isPlaying) this.mQuestSound.play();

			this.mSndPlayBtn.selected = true;
			await App.Handle.tweenMotion('delay', this.mQuestSound.duration);
			this.mSndPlayBtn.selected = false;
		});

		this.mScoreStarCt = new PIXI.Container();
		this.mScoreStarCt.position.set(App.Handle.appWidth - 117, 88.5);
		const tScoreBgImg = new PIXI.Sprite(
			this.mViewSheet.textures['2star_bg.png'],
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

		this.mCorrectAnswerAry = [
			...(ProductRscManager.Handle.getResource(this.name, 'correctstr') as any),
		];
		this.mWrongAnswerAry = [
			...(ProductRscManager.Handle.getResource(this.name, 'wrongstr') as any),
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

		this.mTrueDirectionCt.zIndex = 1;
		// this.addChild(tTrueDirectionCt);
		App.Handle.addChilds(this, this.mTrueDirectionCt, true);

		this.mFingerSp = new PIXI.Sprite(this.mViewSheet.textures['finger.png']);
		this.mFingerSp.visible = false;
		this.mFingerSp.zIndex = 2;
		// this.addChild(this.mFingerSp);
		App.Handle.addChilds(this, this.mFingerSp);

		this.setQuest();
		// this.showTrueTrue();
	}

	//사운드 미리 불러오기를 나타낸다.
	private async preLoadSound() {
		if (window['Android']) {
			if (App.Handle.loading === null || App.Handle.loading === undefined)
				window['Android'].showLoading();
		}

		const tSnds = [];
		tSnds.push([Rsc.viewer, 'common', 'button_click.mp3']);
		tSnds.push([Rsc.viewer, this.name, 'pr_ac_dic_1.mp3']);
		tSnds.push([Rsc.viewer, 'common', `eop_${this.mEopNum}.mp3`]);
		tSnds.push([Rsc.viewer, 'common', `eop_sfx.mp3`]);
		tSnds.push([Rsc.viewer, 'common', 'gain_star.mp3']);
		tSnds.push([Rsc.viewer, 'common', `activity_correct.mp3`]);
		tSnds.push([Rsc.viewer, 'common', `activity_wrong.mp3`]);
		tSnds.push([Rsc.product, this.name, `${Config.subjectNum}_ac_1.mp3`]);
		tSnds.push([Rsc.product, this.name, `${Config.subjectNum}_ac_2.mp3`]);
		// tSnds.push([Rsc.product, 'common', `1_ac_3.mp3`]);
		// tSnds.push([Rsc.product, 'common', `1_ac_4.mp3`]);
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
		down ? (tCnt = 8) : (tCnt = 3);
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
			`pr_ac_dic_1.mp3`,
		);
		tDirection01.play();
		await App.Handle.tweenMotion('delay', tDirection01.duration + 0.8);
		// this.mAlphabet.showTracingGuide();
		// this.mAlphabet.isLock = false;
		App.Handle.playStageObjs();
		this.mSpeechBubbleSp.visible = true;
		this.mTimeOutHnd?.resume();
		this.mIsShowTrue = false;
	}

	private async setQuest() {
		// console.log('setQuest Start');
		this.mQuestAry = Util.shuffleArray(this.mQuestAry);
		const tQuestNum = this.mQuestAry[0];

		// const tAnswerAry = [0, 1, 2, 3];
		// tAnswerAry.splice(tQuestNum, 1);
		// const tWrongAnswerAry = Util.shuffleArray(tAnswerAry);

		// console.log(this.mQuestAry, tWrongAnswerAry);
		this.mSndPlayBtn.visible = true;
		// const tAniStartPosX = [-400, Config.width + 400];
		const tPosX = [368, 916];
		this.mBoardCtAry = [];

		const tSuffleAry = Util.shuffleArray([
			this.mCorrectAnswerAry[tQuestNum],
			this.mWrongAnswerAry[tQuestNum],
		]);
		for (let i = 0; i < 2; i++) {
			const tAnswerBoxCt = new PIXI.Container();
			const tAnswerBox = new PIXI.Sprite(
				this.mViewSheet.textures['ex_box.png'],
			);
			tAnswerBox.anchor.set(0.5);
			tAnswerBox.position.set(tPosX[i], 425);
			// tAnswerBox.zIndex = 20 + i;

			App.Handle.addChilds(tAnswerBoxCt, tAnswerBox);

			const tAnswerImg = new PIXI.Sprite(
				ProductRscManager.Handle.getResource(
					'common',
					`${tSuffleAry[i]}.png`,
				).texture,
			);
			tAnswerImg.anchor.set(0.5);
			tAnswerImg.position.set(tPosX[i], 425);
			// tAnswerBox.zIndex = 30 + i;
			// tAnswerImg.visible = false;

			App.Handle.addChilds(tAnswerBoxCt, tAnswerImg);
			this.mAnswerImgAry[i] = tAnswerImg;

			tAnswerBoxCt.interactive = true;
			tAnswerBoxCt.buttonMode = true;
			tAnswerBoxCt.on('pointertap', (evt: PIXI.InteractionEvent) => {
				this.selectAnswer(
					i,
					`${Config.subjectNum}_ac_${tQuestNum + 1}` === tSuffleAry[i],
				);
				this.mEffect.createEffect(evt);
			});
			// tAnswerBoxCt.pivot.set(0.5);
			this.mBoardCtAry[i] = tAnswerBoxCt;
			// tAnswerBoxCt.zIndex = 40 + i;
			App.Handle.addChilds(this, tAnswerBoxCt, true);
			const tAniStartPosX = [-Config.width / 2, Config.width / 2];
			this.mBoardCtAry[i].x = tAniStartPosX[i];
			gsap.to(this.mBoardCtAry[i], { x: 0, alpha: 1, duration: 0.5 });
			// await App.Handle.tweenMotion('delay', 0.5);
			// tAnswerImg.visible = true;
		}

		if (this.mQuestNum === 0) {
			await App.Handle.tweenMotion('delay', 0.5);
			await this.showTrueTrue();
		} else {
			await App.Handle.tweenMotion('delay', 0.5);
		}
		// await App.Handle.tweenMotion('delay', 1.5);

		// for (let i = 0; i < 2; i++) {
		// }

		// await App.Handle.tweenMotion('delay', 0.5)
		// tAnswerImg.visible = false;

		this.mQuestSound = SoundManager.Handle.getSound(
			this.name,
			`${Config.subjectNum}_ac_${this.mQuestAry[0] + 1}.mp3`,
		);

		this.mQuestSound.play();

		App.Handle.playStageObjs();
		this.mSpeechBubbleSp.visible = true;

		this.mIsQuest = true;
		this.mGuideNum = 0;
		this.showFingerGuide();

		this.mSndPlayBtn.selected = true;
		await App.Handle.tweenMotion('delay', this.mQuestSound.duration);
		this.mSndPlayBtn.selected = false;
		// console.log('setQuest End');
	}

	private async endQuest() {
		// console.log('endQuest');
		this.mQuestNum++;
		this.mFailCnt = 0;
		this.mIsQuest = false;

		if (this.mQuestNum == this.mFinStarCnt) {
			console.log('clearActivity');
			this.mTrueDirectionCt.zIndex = 0;
			this.clearActivity();
			return;
		}

		const tAniStartPosX = [-Config.width / 2, Config.width / 2];
		for (let i = 0; i < 2; i++) {
			gsap.to(this.mBoardCtAry[i], {
				x: tAniStartPosX[i],
				alpha: 1,
				duration: 0.5,
			});
		}

		await App.Handle.tweenMotion('delay', 1);
		this.setQuest();
	}

	private async selectAnswer(tIdx: number, tBool: boolean) {
		this.hideFingerGuide();
		if (tBool) {
			App.Handle.pauseStageObjs();
			this.mSpeechBubbleSp.visible = false;

			// console.log('정답입니다.', this.mQuestAry.length);
			SoundManager.Handle.getSound('common', 'activity_correct.mp3').play();

			gsap.to(this.mAnswerImgAry[tIdx].scale, {
				x: 1.1,
				y: 1.1,
				duration: 0.3,
				repeat: 1,
				yoyo: true,
			});
			await App.Handle.tweenMotion('delay', 1);

			// console.log(`${Config.subjectNum}_ac_${this.mQuestAry[0] + 1}.mp3`);
			this.mSndPlayBtn.selected = false;
			pixiSound.stopAll();
			const tWordsSound = SoundManager.Handle.getSound(
				this.name,
				`${Config.subjectNum}_ac_${this.mQuestAry[0] + 1}.mp3`,
			);
			tWordsSound.play();
			await App.Handle.tweenMotion('delay', tWordsSound.duration + 0.5);
			await this.mScoreStar[this.mQuestNum].showStar();
			this.mScoreStarBg[this.mQuestNum].hideStar();
			await App.Handle.tweenMotion('delay', 1);

			this.mQuestAry.splice(0, 1);
			this.endQuest();
		} else {
			// console.log('오답입니다.');
			SoundManager.Handle.getSound('common', 'activity_wrong.mp3').play();

			// this.mGuideNum = 0;

			this.mFailCnt++;
			// this.mAnswerImgAry[tIdx].angle = -20;
			if (this.mFailCnt >= 2) {
				//
				this.mFailCnt = 0;
				if (this.mAniTimeLine) {
					this.mAniTimeLine.kill();
					this.mAniTimeLine = null;
				}

				const tNum = 1 - tIdx;
				this.mAniTimeLine = gsap.timeline({});
				this.mAniTimeLine.to(this.mAnswerImgAry[tNum], {
					angle: -10,
					duration: 0.2,
				});
				this.mAniTimeLine.to(this.mAnswerImgAry[tNum], {
					angle: 10,
					duration: 0.3,
					repeat: 2,
					yoyo: true,
				});
				this.mAniTimeLine.to(this.mAnswerImgAry[tNum], {
					angle: 0,
					duration: 0.4,
				});
			}

			await App.Handle.tweenMotion('delay', 1);

			this.startTimeOut(10, true);
		}
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
		if (!this.mIsQuest) {
			this.mFingerSp.visible = false;
			return;
		}
		if (this.mGuideNum > 5) return;

		let tPosX = 0;
		let tPosY = 0;
		const tNowGuideNum = this.mGuideNum % 2;
		// console.log('tNowGuideNum = ' + tNowGuideNum);
		const tPosXAry = [368, 916];
		tPosX = tPosXAry[tNowGuideNum];
		tPosY = 505;
		// if (this.mFingerSp != null) {
		this.mFingerSp.position.x = tPosX + 10;
		this.mFingerSp.position.y = tPosY + 20;
		this.mFingerSp.alpha = 1;
		this.mFingerSp.visible = true;
		this.mFingerSp.scale.set(1.3);
		// }

		gsap.killTweensOf(this.mFingerSp);
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
		// console.log(
		// 	`this.mGuideNum = ${this.mGuideNum}, this.mTimeOutHnd  = ${this.mTimeOutHnd} `,
		// );
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
		// console.log(`hideFingerGuide`);
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
		gsap.killTweensOf(this.mBoardCtAry[0]);
		gsap.killTweensOf(this.mBoardCtAry[1]);
		gsap.killTweensOf(this.mAnswerImgAry[0]);
		gsap.killTweensOf(this.mAnswerImgAry[1]);
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
