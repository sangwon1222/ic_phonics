import { SceneBase } from '../../com/core/SceneBase';
import { App } from '../../com/core/App';
import 'pixi-spine';
import gsap from 'gsap';

// Manager
import { ViewerRscManager } from '../../com/manager/ViewerRscManager';
import { ProductRscManager } from '../../com/manager/ProductRscManager';
import { Rsc, SoundManager } from '../../com/manager/SoundManager';

// Scene
import { Button } from '../../com/widget/Button';
import { EventType } from '../../com/core/EventType';
import { ObjectBase } from '@/com/core/ObjectBase';
import { random } from 'gsap';

import { CustomEvent } from '../../com/core/CustomEvent';
import pixiSound from 'pixi-sound';
import { Extract, Rectangle, utils } from 'pixi.js';
import * as Util from '../../com/util/Util';
import Config from '@/com/util/Config';
import AppConf from '../AlphabetConf';

// 알파벳이 들어간 전구를 생성한다.
class LampAlphabet extends ObjectBase {
	private mLampCt: PIXI.Container;

	private mLampBg: PIXI.Sprite;
	public mLampBtn: Button;
	private mLampText: PIXI.Text;
	private mOnStyle: PIXI.TextStyle;
	private mOffStyle: PIXI.TextStyle;
	private mIsClicked: boolean;

	constructor(
		category: string,
		public alphabetStr: string,
		public mBtnNum: number,
		public mCorrect: boolean,
		skinname: string,
	) {
		super();

		this.mLampCt = new PIXI.Container();
		this.mIsClicked = false;
		// this.mLampBg = new PIXI.Sprite(ProductRscManager.Handle.getResource(category, 'lightoff.png').texture);
		// this.mLampCt.addChild(this.mLampBg);

		const tViewSheet = ViewerRscManager.Handle.getResource(
			'common',
			`ap_view.json`,
		).spritesheet;

		this.mOnStyle = new PIXI.TextStyle({
			align: 'center',
			fill: '#ffffff',
			fontFamily: 'minigate Bold ver2',
			fontWeight: 'normal',
			fontSize: 48,
			padding: 25,
			// stroke: '#ffffff',
			// strokeThickness: 8
		});

		this.mOffStyle = new PIXI.TextStyle({
			align: 'center',
			fill: '#333333',
			fontFamily: 'minigate Bold ver2',
			fontWeight: 'normal',
			fontSize: 48,
			padding: 25,
		});

		// console.log(skinname);
		this.mLampBtn = new Button(
			tViewSheet.textures[`${skinname}_normal.png`],
			tViewSheet.textures[`${skinname}_over.png`],
			null,
			true,
		);

		// const debug = new PIXI.Graphics();
		// debug.lineStyle(2, 0xff0000, 1);
		// debug.drawRect(
		// 	this.mLampBtn.width / 2 - 40,
		// 	this.mLampBtn.height / 2 - 40,
		// 	80,
		// 	80,
		// );
		// this.mLampBtn.addChild(debug);

		this.mLampBtn.addCustomEventListener(EventType.ButtonUp, () => {
			if (this.mIsClicked) return;
			this.onLampBtnUp(true);
			this.mIsClicked == false && mCorrect ? (this.mIsClicked = true) : null;
			this.dispatchEvent(EventType.ReceiveData, this.mBtnNum);
		});
		// this.mLampBtn.setAnchor(0.5, 0.5);
		// this.mLampCt.addChild(this.mLampBtn);
		App.Handle.addChilds(this.mLampCt, this.mLampBtn, true);

		const tExAlphabet = [
			'a',
			'c',
			'e',
			'g',
			'm',
			'n',
			'o',
			'p',
			'q',
			'r',
			's',
			't',
			'u',
			'v',
			'w',
			'x',
			'y',
			'z',
		];
		let tGap = 0;
		this.mLampText = new PIXI.Text(alphabetStr);
		this.mLampText.style = this.mOffStyle;
		// this.mLampText.interactive = false;

		tExAlphabet.indexOf(alphabetStr) >= 0 ? (tGap = 4) : (tGap = 0);

		// this.mLampText.anchor.set(0.5);
		this.mLampText.position.set(
			(this.mLampBtn.width - this.mLampText.width) / 2,
			(this.mLampBtn.height - this.mLampText.height * 0.9) / 2 - tGap,
		);
		// this.mLampCt.addChild(this.mLampText);
		App.Handle.addChilds(this.mLampCt, this.mLampText);

		// this.addChild(this.mLampCt);
		App.Handle.addChilds(this, this.mLampCt, true);
		const hit = new PIXI.Rectangle(
			this.mLampBtn.width / 2 - 40,
			this.mLampBtn.height / 2 - 40,
			80,
			80,
		);
		this.mLampCt.hitArea = hit;
	}

	get btn(): PIXI.Container {
		return this.mLampCt;
	}
	// get btn(): Button { return this.mLampBtn}

	//클릭한 전구 불켜지는 처리를 나타낸다.
	public onLampBtnUp(tVal: boolean) {
		if (!this.mCorrect) return;
		if (tVal) {
			this.mLampBtn.selected = tVal;
			this.mLampText.style = this.mOnStyle;
		} else {
			this.mLampBtn.selected = tVal;
			this.mLampText.style = this.mOffStyle;
		}
	}
}

// 5*7 Matric판을 생성한다.
class DotMatrix extends ObjectBase {
	private mMatrixCt: PIXI.Container;

	private mCorrectPosAry: Array<number>;
	private mCorrectStrAry: Array<string>;
	private mWrongStrAry: Array<string>;
	private mAnswerAry: Array<number>;
	private mRemainAry: Array<number>;

	private mCorrectLampAry: Array<LampAlphabet>;
	private mRemainLampAry: Array<LampAlphabet>;
	private mLampAry: Array<LampAlphabet>;

	private mLampAlphabet: LampAlphabet;
	private mDisabled: boolean;
	private mFailureCnt: number;
	private mGuideLampNum: number;

	private mTimeOutHnd: number;
	private mIsLock: boolean; // 잠긴 상태인지를 나타낸다.

	private mFingerSp: PIXI.Sprite;
	private mWrongSnd: pixiSound.Sound;
	private mClearSnd: pixiSound.Sound;
	private mCorrectSnd: pixiSound.Sound;
	private mWordSnd: pixiSound.Sound;

	private mLampOneRect: { width: number; height: number };

	get isLock(): boolean {
		return this.mIsLock;
	}

	set isLock(tVal: boolean) {
		this.mIsLock = tVal;
		for (const tLamp of this.mLampAry) {
			tLamp.mLampBtn.interactive = !this.mIsLock;
		}
		gsap.killTweensOf(this.mFingerSp);
		clearTimeout(this.mTimeOutHnd);
	}

	constructor(category: string, skinname: string) {
		super();

		// const bg = new PIXI.Graphics();
		// bg.beginFill(0x00ffff);
		// bg.drawRect(0,0,500,600);
		// bg.endFill();
		// bg.position.set(-bg.width /2, 0);
		// this.addChild(bg);
		this.mFailureCnt = 0;
		this.mCorrectLampAry = [];
		this.mLampAry = [];
		this.mAnswerAry = [];
		this.mLampOneRect = { width: 83, height: 80 };

		this.mCorrectPosAry = ProductRscManager.Handle.getResource(
			category,
			'matrix',
		) as any;
		this.mCorrectStrAry = ProductRscManager.Handle.getResource(
			category,
			'correctstr',
		) as any;
		this.mWrongStrAry = ProductRscManager.Handle.getResource(
			category,
			'wrongstr',
		) as any;

		this.mMatrixCt = new PIXI.Container();

		for (let i = 0; i < 7; i++) {
			for (let j = 0; j < 5; j++) {
				const tCompareNum = j + i * 5 + 1;
				const tFindIndex = this.mCorrectPosAry.find(tNum => {
					return tNum === tCompareNum;
				});

				if (tFindIndex > 0) {
					const rnd = Math.floor(Math.random() * this.mCorrectStrAry.length);
					this.mLampAlphabet = new LampAlphabet(
						category,
						this.mCorrectStrAry[rnd],
						tCompareNum,
						true,
						skinname,
					);
					// this.mLampAlphabet.addCustomEventListener(EventType.ReceiveData, (evt)=> this.clearCheck(evt) );
					// console.log(this.mLampAlphabet.alphabetStr);
					// console.log(`FindIndex : ${tFindIndex}`);
					this.mCorrectLampAry.push(this.mLampAlphabet);
				} else {
					const rnd = Math.floor(Math.random() * this.mWrongStrAry.length);
					this.mLampAlphabet = new LampAlphabet(
						category,
						this.mWrongStrAry[rnd],
						tCompareNum,
						false,
						skinname,
					);
					// console.log(`Not FindIndex : ${tFindIndex}`);
				}
				this.mLampAry.push(this.mLampAlphabet);

				this.mLampAlphabet.addCustomEventListener(
					EventType.ReceiveData,
					(evt: CustomEvent) => {
						this.clearCheck(evt, category);
					},
				);
				// this.mLampAlphabet.pivot.set(0.5);
				this.mLampAlphabet.position.set(
					j * (this.mLampOneRect.width + 0.1),
					i * (this.mLampOneRect.height + 0.3),
				);
				// this.mMatrixCt.addChild(this.mLampAlphabet);
				App.Handle.addChilds(this.mMatrixCt, this.mLampAlphabet, true);
			}
		}

		this.mRemainAry = [...this.mCorrectPosAry];
		this.mRemainLampAry = [...this.mCorrectLampAry];

		this.mMatrixCt.position.set(
			(App.Handle.appWidth - this.mMatrixCt.width) / 2,
			100,
		);
		// this.addChild(this.mMatrixCt);
		App.Handle.addChilds(this, this.mMatrixCt, true);

		const tViewSheet = ViewerRscManager.Handle.getResource(
			'common',
			`ap_view.json`,
		).spritesheet;

		this.mFingerSp = new PIXI.Sprite(tViewSheet.textures['finger.png']);
		this.mFingerSp.visible = false;
		// this.addChild(this.mFingerSp);
		this.mFingerSp.anchor.set(0);
		App.Handle.addChilds(this, this.mFingerSp);
	}

	// 단어 완성 체크
	private async clearCheck(evt: CustomEvent, category: string) {
		//
		const tFindAnswerIndex = this.mAnswerAry.indexOf(evt.data);
		const tFindCorrectIndex = this.mCorrectPosAry.indexOf(evt.data);
		const tFindRemainIndex = this.mRemainAry.indexOf(evt.data);

		// console.log('Clicked : ' + evt.data);
		// console.log(
		// 	'Array : ' + this.mRemainLampAry.splice(tFindRemainIndex, 1)[0].position,
		// );
		clearTimeout(this.mTimeOutHnd);

		if (tFindCorrectIndex >= 0) {
			this.mFailureCnt = 0;
			if (tFindAnswerIndex < 0) {
				this.mAnswerAry.push(evt.data);
				// } else {
				// 	this.mAnswerAry.splice(tFindAnswerIndex, 1);
				SoundManager.Handle.getSound(category, 'snd_correct.mp3').play();
				SoundManager.Handle.getSound(
					'common',
					`${App.Handle.getAlphabet}.mp3`,
				).play();
			}

			// console.log(
			// 	`${this.mRemainAry.length} => evt.data : ${
			// 		evt.data
			// 	}, this.mGuideLampNum : ${this.mGuideLampNum}, ${
			// 		this.mRemainAry[this.mGuideLampNum]
			// 	}`,
			// );
			evt.data === this.mGuideLampNum ? (this.mGuideLampNum = undefined) : null;
			this.mRemainAry.splice(tFindRemainIndex, 1);
			this.mRemainLampAry.splice(tFindRemainIndex, 1);
		} else {
			//램프 선택이 틀렸을때 처리를 나타낸다.
			SoundManager.Handle.getSound(category, 'snd_wrong.mp3').play();

			this.mFailureCnt++;
			// console.log(`this.mWrongCnt = ${this.mWrongCnt}`);
			if (this.mFailureCnt > 1) {
				// 두번 틀렸을때의 힌트 처리를 나타낸다.
				// this.isLock = true;
				App.Handle.pauseStageObjs();
				this.mFailureCnt = 0;
				for (const tVal of this.mCorrectLampAry) {
					tVal.onLampBtnUp(true);
				}
				await App.Handle.tweenMotion('delay', 0.2);
				await this.clearAniStart(0, 0.3);
				// await App.Handle.tweenMotion('delay', 0.2);
				for (const tVal of this.mCorrectLampAry) {
					const tFindRemainNum = this.mAnswerAry.indexOf(tVal.mBtnNum);
					if (tFindRemainNum < 0) tVal.onLampBtnUp(false);
				}
				await App.Handle.tweenMotion('delay', 0.6);
				App.Handle.playStageObjs();
				// this.isLock = false;
			}
		}

		this.startTimeOut(10);
		//정답을 모두 맟췄을때 처리를 나타낸다.
		if (this.mCorrectPosAry.length == this.mAnswerAry.length) {
			console.log(`Succes~~!!`);
			clearTimeout(this.mTimeOutHnd);
			// this.dispatchEvent(EventType.ReceiveData, 'ClearTrue');
			App.Handle.pauseStageObjs();

			this.mLampAry.map(tVal => {
				tVal.mLampBtn.selected ? null : (tVal.visible = false);
			});

			this.clearAniStart(-1, 0.3);

			SoundManager.Handle.getSound(category, 'snd_finish.mp3').play();

			// await App.Handle.tweenMotion('delay', 1);

			const tWordSnd = SoundManager.Handle.getSound(
				'common',
				`${App.Handle.getAlphabet}.mp3`,
			);
			await App.Handle.tweenMotion('delay', 2);
			// gsap.delayedCall(2, () => {
			tWordSnd.play();
			// });
			await App.Handle.tweenMotion('delay', tWordSnd.duration + 1);
			// gsap.delayedCall(tWordSnd.duration + 3, () => {
			this.dispatchEvent(EventType.ReceiveData, 'ClearMode');
			// });
		}
		// console.log('Array : ' + this.mRemainLampAry);

		gsap.killTweensOf(this.mFingerSp);
		this.mFingerSp.alpha = 0;
	}

	//전구 애니메이션 처리를 나타낸다.
	clearAniStart(vLoop: number, vTime: number) {
		for (const lamp of this.mCorrectLampAry) {
			if (vTime === 0) {
				gsap.killTweensOf(lamp.btn);
				lamp.btn.alpha = 1;
			} else {
				gsap.to(lamp.btn, {
					alpha: 0,
					duration: vTime * 2,
					repeat: vLoop,
					repeatDelay: vTime,
				});
				gsap.delayedCall(vTime, () => {
					gsap.to(lamp.btn, {
						alpha: 1,
						duration: vTime * 2,
						repeat: vLoop,
						repeatDelay: vTime,
					});
				});
				// lamp.btn.blink();
			}
		}

		// if( this.mTicker == null ){
		//     this.mTicker = new PIXI.Ticker();
		//     this.mTicker.add( (dt)=>{
		//         this.update( dt );
		//     })
		//     this.mTicker.start();
		// }
	}

	// 10초마다 손가락 디렉션 보여주기를 나타낸다.
	private startTimeOut(tTime: number) {
		this.mTimeOutHnd = setTimeout(() => {
			if (!this.isLock) {
				this.mFailureCnt = 0;
				this.showFingerGuide();
			}
		}, 1000 * tTime);
	}

	async showFingerGuide() {
		const tLength = this.mRemainLampAry.length;
		// console.log(this.mRemainLampAry.length);
		const tRandomNum = Math.floor(Math.random() * tLength);
		// const tFindRemainIndex = this.mRemainAry.indexOf(tRandomNum);
		// console.log(`tRandomNum = ${tRandomNum}, this.mGuideLampNum = ${this.mGuideLampNum}`);
		this.mGuideLampNum === undefined
			? (this.mGuideLampNum = this.mRemainAry[tRandomNum])
			: null;
		// this.mGuideLampNum >= tLength ? this.mGuideLampNum = tLength -1 : null;

		// console.log(this.mGuideLampNum, this.mRemainLampAry);
		const tLamp = this.mRemainLampAry[
			this.mRemainAry.indexOf(this.mGuideLampNum)
		];

		this.mFingerSp.alpha = 0;
		await App.Handle.tweenMotion('delay', 0.2);
		// console.log(`showFingerGuide = ${tLamp}`);
		// console.log(this.mGuideLampNum, tLamp.alphabetStr, tLamp.position);
		// this.mFingerSp.anchor.set(0.5);
		const tPosX =
			this.mMatrixCt.position.x + tLamp.position.x + tLamp.mLampBtn.width / 2;
		const tPosY =
			this.mMatrixCt.position.y + tLamp.position.y + tLamp.mLampBtn.height / 2;
		this.mFingerSp.position.x = tPosX + 10;
		this.mFingerSp.position.y = tPosY + 20;
		this.mFingerSp.alpha = 1;
		this.mFingerSp.visible = true;

		// await App.Handle.tweenMotion('delay', 0.5);
		// gsap.killTweensOf(this.mFingerSp);
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
		gsap.to(this.mFingerSp.scale, {
			x: 1,
			y: 1,
			duration: 0.5,
			ease: 'back.out(4)',
		});
		await App.Handle.tweenMotion('delay', 0.5);
		gsap.to(this.mFingerSp.scale, { x: 1.3, y: 1.3, duration: 0.4 });
		await App.Handle.tweenMotion('delay', 0.4);
		gsap.to(this.mFingerSp.scale, {
			x: 1,
			y: 1,
			duration: 0.5,
			ease: 'back.out(4)',
		});
		await App.Handle.tweenMotion('delay', 0.8);
		gsap.to(this.mFingerSp, { alpha: 0, duration: 1 });

		clearTimeout(this.mTimeOutHnd);
		this.startTimeOut(10);
	}
}

export class Game extends SceneBase {
	private mDotMatrix: DotMatrix;

	private mIsShowTrue: boolean;

	private mTrueDirectionCt: PIXI.Container;
	private mTrueDirectionSp: PIXI.Sprite;
	private mSpeechBubbleSp: PIXI.AnimatedSprite;

	// private mClearObj: Array<Button | PIXI.Container>;
	// private mSkinAry: Array<string>;
	// private mSelectSkinNum: number;
	private mIntroMotion: any;
	private mEopNum: number;
	private mViewSheet: PIXI.Spritesheet;

	constructor() {
		super();
		this.name = 'Game';
	}

	async onInit() {
		//
		// this.mClearObj = [];
		this.dispatchEvent(EventType.ReceiveData, 'StartMode');

		const tSkinAry = ['pumkin', 'camping', 'space'];
		const tSelectSkinNum = Math.floor(Math.random() * tSkinAry.length);
		let tSkinStr = '';
		if (
			AppConf.gameActbg === null ||
			AppConf.gameActbg === undefined ||
			AppConf.gameActbg === ''
		) {
			tSkinStr = tSkinAry[tSelectSkinNum];
			AppConf.gameActbg = tSkinStr;
		} else {
			tSkinStr = AppConf.gameActbg;
		}

		this.selectEop();

		const tBgSheet = ViewerRscManager.Handle.getResource(
			'common',
			`ap_game.json`,
		).spritesheet;

		this.mViewSheet = ViewerRscManager.Handle.getResource(
			'common',
			`ap_view.json`,
		).spritesheet;

		//배경 이미지를 나타낸다.
		const tBgImg = new PIXI.Sprite(tBgSheet.textures[`bg_${tSkinStr}.png`]);
		tBgImg.width = App.Handle.appWidth;
		tBgImg.height = App.Handle.appHeight - 64;
		tBgImg.position.set(0, 64);
		// this.addChild(tBgImg);
		App.Handle.addChilds(this, tBgImg);

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

		this.mDotMatrix = new DotMatrix(this.name, tSkinStr);
		// this.mDotMatrix.position.set(App.Handle.appWidth /2, 100);
		// this.addChild(this.mDotMatrix);
		App.Handle.addChilds(this, this.mDotMatrix, true);

		this.mDotMatrix.addCustomEventListener(EventType.ReceiveData, evt =>
			this.eventReceive(evt),
		);
	}

	async onStart() {
		await this.preLoadSound();
		// const BGM = ViewerRscManager.Handle.getResource(this.name, 'snd_bgm.mp3')
		// 	.sound;
		// BGM.play({ loop: true });
		// SoundManager.Handle.play(this.name, 'snd_bgm.mp3');

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

		// this.mAlphabet.makeStroke();

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
		tSnds.push([Rsc.viewer, this.name, 'snd_correct.mp3']);
		tSnds.push([Rsc.viewer, this.name, 'snd_finish.mp3']);
		tSnds.push([Rsc.viewer, this.name, 'snd_wrong.mp3']);
		tSnds.push([Rsc.viewer, 'common', 'scaffolding_sfx.mp3']);
		tSnds.push([Rsc.viewer, 'common', 'gain_star.mp3']);
		tSnds.push([Rsc.product, 'common', `${App.Handle.getAlphabet}.mp3`]);
		tSnds.push([Rsc.viewer, 'common', `eop_${this.mEopNum}.mp3`]);
		tSnds.push([Rsc.viewer, 'common', `eop_sfx.mp3`]);
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
		down ? (tCnt = 5) : (tCnt = 3);
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
		this.mDotMatrix.isLock = true;
		this.mSpeechBubbleSp.visible = false;

		this.mTrueDirectionSp.rotation = 0;
		gsap.to(this.mTrueDirectionSp, { x: upY, duration: 0.3 });

		this.setTrueMotion(true);

		// tSndDir01.play({
		// 	complete: () => {
		// 		gsap.delayedCall(0.8, () => {
		// 			if (this.mDotMatrix === null) return;
		// 			this.mDotMatrix.showFingerGuide();
		// 			this.mDotMatrix.isLock = false;
		// 			App.Handle.playStageObjs();
		// 			this.mSpeechBubbleSp.visible = true;
		// 			this.mIsShowTrue = false;
		// 		});
		// 	},
		// });
		const tSndDir = SoundManager.Handle.getSound(
			this.name,
			`snd_${App.Handle.getAlphabet}_ready.mp3`,
		);
		tSndDir.play();
		await App.Handle.tweenMotion('delay', tSndDir.duration + 0.8);
		if (this.mDotMatrix === null) return;
		this.mDotMatrix.showFingerGuide();
		this.mDotMatrix.isLock = false;
		App.Handle.playStageObjs();
		this.mSpeechBubbleSp.visible = true;
		this.mIsShowTrue = false;
	}

	//액티비티 클리어 했을때의 처리를 나타낸다.
	private async clearActivity() {
		SoundManager.Handle.stopAll();
		this.mSpeechBubbleSp.visible = false;
		this.mDotMatrix.clearAniStart(0, 0);

		const tEopSpine = new PIXI.spine.Spine(
			ViewerRscManager.Handle.getResource('common', 'eop.json').spineData,
		);
		tEopSpine.position.set(App.Handle.appWidth / 2, App.Handle.appHeight / 2);
		App.Handle.addChilds(this, tEopSpine);

		tEopSpine.state.setAnimation(0, `eop${this.mEopNum}`, false);

		SoundManager.Handle.getSound('common', `eop_sfx.mp3`).play();
		await App.Handle.tweenMotion('delay', 1.5);
		SoundManager.Handle.getSound('common', `eop_${this.mEopNum}.mp3`).play();

		App.Handle.pauseStageObjs();
		this.dispatchEvent(EventType.ReceiveData, 'ClearMode');
	}

	//이벤트 받기를 나타낸다.
	private eventReceive(evt: CustomEvent) {
		const tData = evt.data;

		console.log(`getEventData = ${tData}`);
		switch (tData) {
			case 'ClearMode': // 액티비티 클리어후 네비게이션 버튼 처리를 위한 Alphabet 호출을 나타낸다.
				this.clearActivity();
				// this.destroy();
				// this.dispatchEvent(EventType.ReceiveData, evt.data);
				break;
			// case 'ClearTrue':
			// 	this.mSpeechBubbleSp.visible = false;
			// 	this.mTrueDirectionCt.interactive = false;
			// 	break;
			case 'twoFailed': //액티비티 두번 실패시 처리를 나타낸다.
				// this.blinkReviewBtn(true);
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
		this.mDotMatrix.isLock = true;
	}

	async onEnd() {
		this.destroyGsapAni();
		SoundManager.Handle.removeAll();
		App.Handle.playStageObjs();
		App.Handle.clearStagObjs();
		App.Handle.removeMotionDelay();
		this.mDotMatrix?.removeCustomEventListener(EventType.ReceiveData);
		this.mDotMatrix?.removeAllListeners();
		await App.Handle.removeChilds();
	}
}
