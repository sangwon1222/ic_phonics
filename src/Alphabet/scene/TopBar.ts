import { SceneBase } from '../../com/core/SceneBase';
import { ViewerRscManager } from '../../com/manager/ViewerRscManager';
import { SoundManager } from '../../com/manager/SoundManager';

import { Button } from '../../com/widget/Button';
import { EventType } from '../../com/core/EventType';
import gsap from 'gsap';
import { App } from '@/com/core/App';
import AlphabetConf from '../AlphabetConf';
import Config from '@/com/util/Config';

export class TopBar extends SceneBase {
	private mTitleCt: PIXI.Container;
	private mTitleBarBtn: Button;
	private mIntroBtn: Button;
	private mStoryBtn: Button;
	private mActivityBtn: Button;
	private mChantBtn: Button;
	private mBtnOffStyle: PIXI.TextStyle;
	private mBtnOnStyle: PIXI.TextStyle;
	private mAnimationTxtSp: PIXI.Text;
	private mBigLetterTxtSp: PIXI.Text;
	private mSmallLetterTxtSp: PIXI.Text;
	private mGameTxtSp: PIXI.Text;

	private mSoundMuteCt: PIXI.Container;
	private mSoundOnSp: PIXI.Sprite;
	private mSoundOffSp: PIXI.Sprite;
	private mSoundBtn: Button;
	private mSoundMute: boolean;

	private mCloseBtn: Button;

	private mBtnAry: Array<Button>;
	private mBtnTxtAry: Array<PIXI.Text>;

	private mTitleBarFlag: boolean;

	constructor() {
		super();
		this.name = 'TopBar';
	}

	async onInit() {
		this.mTitleBarFlag = false;
		this.mSoundMute = false;

		// console.log(`TopBar ap_view.json`);
		const tViewSheet = ViewerRscManager.Handle.getResource(
			'common',
			`ap_view.json`,
		).spritesheet;

		// console.log(`TopBar ap_view.json loaded`);
		// 탑바 배경
		// const bg = new PIXI.Sprite(
		// 	ViewerRscManager.Handle.getResource('common', 'topbarBg.png').texture,
		// );
		const bg = new PIXI.Sprite(tViewSheet.textures['topbarBg.png']);
		bg.width = App.Handle.appWidth;
		bg.anchor.set(0);
		bg.position.set(0, 0);
		this.addChild(bg);

		this.mBtnOffStyle = new PIXI.TextStyle({
			align: 'left',
			fill: '#999999',
			fontFamily: 'NanumSquareRound',
			fontWeight: 'normal',
			fontSize: 28 * 2,
			// padding: 20,
			// wordWrap: true,
		});

		this.mBtnOnStyle = new PIXI.TextStyle({
			align: 'left',
			// fill: '#fcb612',
			fill: '#ff5a00',
			fontFamily: 'NanumSquareRound',
			fontWeight: 'normal',
			fontSize: 28 * 2,
			// padding: 20,
			// wordWrap: true,
		});

		// Animation 버튼
		// this.mIntroBtn = new Button(
		// 	ViewerRscManager.Handle.getResource(
		// 		'common',
		// 		'animation_btn_off.png',
		// 	).texture,
		// 	ViewerRscManager.Handle.getResource(
		// 		'common',
		// 		'animation_btn_on.png',
		// 	).texture,
		// );
		this.mIntroBtn = new Button(
			tViewSheet.textures['animation_btn_off.png'],
			tViewSheet.textures['animation_btn_on.png'],
		);
		this.mIntroBtn.setAnchor(0.5, 0.5);
		this.mIntroBtn.x = 238;
		this.mIntroBtn.y = 32;
		this.addChild(this.mIntroBtn);

		this.mAnimationTxtSp = new PIXI.Text('Animation');
		this.mAnimationTxtSp.style = this.mBtnOffStyle;
		this.mAnimationTxtSp.anchor.set(0.5);
		this.mAnimationTxtSp.position.set(238, 31);
		this.mAnimationTxtSp.scale.set(0.5);
		this.mAnimationTxtSp.roundPixels = true;
		this.addChild(this.mAnimationTxtSp);

		// Big Letter 버튼
		// this.mStoryBtn = new Button(
		// 	ViewerRscManager.Handle.getResource(
		// 		'common',
		// 		'bigletter_btn_off.png',
		// 	).texture,
		// 	ViewerRscManager.Handle.getResource(
		// 		'common',
		// 		'bigletter_btn_on.png',
		// 	).texture,
		// );
		this.mStoryBtn = new Button(
			tViewSheet.textures['bigletter_btn_off.png'],
			tViewSheet.textures['bigletter_btn_on.png'],
		);
		this.mStoryBtn.setAnchor(0.5, 0.5);
		this.mStoryBtn.x = 456;
		this.mStoryBtn.y = 32;
		this.addChild(this.mStoryBtn);

		this.mBigLetterTxtSp = new PIXI.Text('BIG LETTER');
		this.mBigLetterTxtSp.style = this.mBtnOffStyle;
		this.mBigLetterTxtSp.anchor.set(0.5);
		this.mBigLetterTxtSp.position.set(456, 31);
		this.mBigLetterTxtSp.scale.set(0.5);
		this.mBigLetterTxtSp.roundPixels = true;
		this.addChild(this.mBigLetterTxtSp);

		// Small Letter 버튼
		// this.mActivityBtn = new Button(
		// 	ViewerRscManager.Handle.getResource(
		// 		'common',
		// 		'smallletter_btn_off.png',
		// 	).texture,
		// 	ViewerRscManager.Handle.getResource(
		// 		'common',
		// 		'smallletter_btn_on.png',
		// 	).texture,
		// );
		this.mActivityBtn = new Button(
			tViewSheet.textures['smallletter_btn_off.png'],
			tViewSheet.textures['smallletter_btn_on.png'],
		);
		this.mActivityBtn.setAnchor(0.5, 0.5);
		this.mActivityBtn.x = 682;
		this.mActivityBtn.y = 32;
		this.addChild(this.mActivityBtn);

		this.mSmallLetterTxtSp = new PIXI.Text('small letter');
		this.mSmallLetterTxtSp.style = this.mBtnOffStyle;
		this.mSmallLetterTxtSp.anchor.set(0.5);
		this.mSmallLetterTxtSp.position.set(682, 31);
		this.mSmallLetterTxtSp.scale.set(0.5);
		this.mSmallLetterTxtSp.roundPixels = true;
		this.addChild(this.mSmallLetterTxtSp);

		// Game 버튼
		// this.mChantBtn = new Button(
		// 	ViewerRscManager.Handle.getResource('common', 'Game_btn_off.png').texture,
		// 	ViewerRscManager.Handle.getResource('common', 'Game_btn_on.png').texture,
		// );
		this.mChantBtn = new Button(
			tViewSheet.textures['Game_btn_off.png'],
			tViewSheet.textures['Game_btn_on.png'],
		);
		this.mChantBtn.setAnchor(0.5, 0.5);
		this.mChantBtn.x = 873;
		this.mChantBtn.y = 32;
		this.addChild(this.mChantBtn);

		this.mGameTxtSp = new PIXI.Text('Game');
		this.mGameTxtSp.style = this.mBtnOffStyle;
		this.mGameTxtSp.anchor.set(0.5);
		this.mGameTxtSp.position.set(873, 31);
		this.mGameTxtSp.scale.set(0.5);
		this.mGameTxtSp.roundPixels = true;
		this.addChild(this.mGameTxtSp);

		this.mSoundMuteCt = new PIXI.Container();
		this.mSoundOnSp = new PIXI.Sprite(tViewSheet.textures['big_sound_on.png']);
		this.mSoundOnSp.anchor.set(0.5);
		this.mSoundOnSp.position.set(Config.width / 2, Config.height / 2);
		this.mSoundOnSp.visible = false;
		this.mSoundMuteCt.addChild(this.mSoundOnSp);

		this.mSoundOffSp = new PIXI.Sprite(
			tViewSheet.textures['big_sound_off.png'],
		);
		this.mSoundOffSp.anchor.set(0.5);
		this.mSoundOffSp.position.set(Config.width / 2, Config.height / 2);
		this.mSoundOffSp.visible = false;
		this.mSoundMuteCt.addChild(this.mSoundOffSp);
		this.addChild(this.mSoundMuteCt);

		// 사운드 뮤트 버튼
		this.mSoundBtn = new Button(
			tViewSheet.textures['sound_on.png'],
			tViewSheet.textures['sound_off.png'],
		);
		this.mSoundBtn.addCustomEventListener(EventType.ButtonUp, () => {
			this.soundMute();
		});
		this.mSoundBtn.setAnchor(0.5, 0.5);
		this.mSoundBtn.position.set(1194, 32);
		this.addChild(this.mSoundBtn);

		// 앱 종료 버튼
		// this.mCloseBtn = new Button(
		// 	ViewerRscManager.Handle.getResource('common', 'close_btn.png').texture,
		// );
		this.mCloseBtn = new Button(tViewSheet.textures['close_btn.png']);
		this.mCloseBtn.addCustomEventListener(EventType.ButtonUp, () => {
			// 앱 종료
			// window["Android"].confirm('나갈래?',
			//     'popUpYes()',
			//     'funcNo()',
			//     'yes', 'no');
			this.dispatchEvent(EventType.ReceiveData, 'Quit');
		});
		this.mCloseBtn.setAnchor(0.5, 0.5);
		this.mCloseBtn.position.set(1249, 32);
		this.addChild(this.mCloseBtn);

		// 타이틀바를 나타낸다.
		const tTitleLocH = -1035;
		this.mTitleCt = new PIXI.Container();
		// const titleBar = new PIXI.Sprite(
		// 	ViewerRscManager.Handle.getResource('common', 'titlebar.png').texture,
		// );
		const titleBar = new PIXI.Sprite(tViewSheet.textures['titlebar.png']);
		titleBar.anchor.set(0);
		titleBar.position.set(25, 12);
		this.mTitleCt.addChild(titleBar);

		const titleSubStyle = new PIXI.TextStyle({
			align: 'left',
			fill: '#ffffff',
			fontFamily: 'NanumSquareRound',
			fontWeight: 'normal',
			fontSize: 24 * 2,
			// padding: 20,
			// wordWrap: true,
		});

		// const titleTxt = `${AlphabetConf.LCMS.intro.subject} ${AlphabetConf.LCMS.stepInfo[0].study_course_nm}`;
		const tTitleTxt = `${AlphabetConf.LCMS.content.title}`;
		const titleTxt = tTitleTxt.split('. ');
		let tTitleSubTxt = '';
		if (Config.devMode) {
			tTitleSubTxt = Config.subjectName;
		} else {
			tTitleSubTxt = titleTxt[1].slice(0, -1);
		}
		// const titleTxt = '알파벳 Aa';
		const titleTxtSp = new PIXI.Text(tTitleSubTxt);
		titleTxtSp.style = titleSubStyle;
		titleTxtSp.anchor.set(0, 0.5);
		titleTxtSp.position.set(130, 32);
		titleTxtSp.scale.set(0.5);
		titleTxtSp.roundPixels = true;
		// titleTxtSp.resolution = 2;

		this.mTitleCt.addChild(titleTxtSp);

		this.addChild(this.mTitleCt);
		this.mTitleCt.position.x = tTitleLocH;

		//뚜루뚜루 아바타를 나타낸다.
		// const avatarImg = new PIXI.Sprite(
		// 	ViewerRscManager.Handle.getResource('common', 'topavatar.png').texture,
		// );
		const avatarImg = new PIXI.Sprite(tViewSheet.textures['topavatar.png']);
		avatarImg.anchor.set(0);
		avatarImg.position.set(0, 0);
		this.addChild(avatarImg);

		const titleMainStyle = new PIXI.TextStyle({
			align: 'left',
			fill: '#ffffff',
			fontFamily: 'NanumSquareRound',
			fontWeight: 'normal',
			fontSize: 24 * 2,
			// padding: 20,
			// wordWrap: true,
		});

		let tTitleMainTxt = '';
		if (Config.devMode) {
			tTitleMainTxt = `${Config.subjectNum}장`;
		} else {
			tTitleMainTxt = titleTxt[0];
		}
		// const titleMainTxt = `${AlphabetConf.LCMS.stepInfo[0].order_no}${AlphabetConf.LCMS.stepInfo[0].lv_nm}`;
		// const titleMainTxt = '1장'
		const titleMainTxtSp = new PIXI.Text(tTitleMainTxt);
		titleMainTxtSp.style = titleMainStyle;
		titleMainTxtSp.anchor.set(1, 0.5);
		titleMainTxtSp.position.set(85, 30);
		titleMainTxtSp.scale.set(0.5);
		titleMainTxtSp.roundPixels = true;
		// titleMainTxtSp.resolution =2
		// console.log(titleMainTxtSp.width);
		this.addChild(titleMainTxtSp);

		// const titleBarIcon = new PIXI.Sprite( ViewerRscManager.Handle.getResource( this.name, 'titlebaricon.png').texture );
		// titleBarIcon.position.set(150,18);
		// this.addChild(titleBarIcon);
		// this.mTitleBarBtn = new Button(
		// 	ViewerRscManager.Handle.getResource('common', 'titlebaricon.png').texture,
		// );
		this.mTitleBarBtn = new Button(tViewSheet.textures['titlebaricon.png']);
		this.mTitleBarBtn.setAnchor(0.5, 0.5);
		this.mTitleBarBtn.position.set(103, 32.5);

		this.mTitleBarBtn.addCustomEventListener(EventType.ButtonUp, () => {
			if (this.mTitleBarFlag) {
				// console.log(`mTitleBarFlag true`);
				gsap.to(this.mTitleBarBtn, { rotation: 0, duration: 0.5 });
				gsap.to(this.mTitleCt, { x: tTitleLocH, duration: 0.5 });
				this.mTitleBarFlag = false;
				this.setVisibleBtn(true);
			} else {
				// console.log(`mTitleBarFlag false`);
				gsap.to(this.mTitleBarBtn, { rotation: 1 * Math.PI, duration: 0.5 });
				gsap.to(this.mTitleCt, { x: 0, duration: 0.5 });
				this.mTitleBarFlag = true;
				this.setVisibleBtn(false);
			}
		});

		this.addChild(this.mTitleBarBtn);

		// 씬 버튼 이벤트 생성
		this.mBtnAry = [
			this.mIntroBtn,
			this.mStoryBtn,
			this.mActivityBtn,
			this.mChantBtn,
		];
		this.mBtnTxtAry = [
			this.mAnimationTxtSp,
			this.mBigLetterTxtSp,
			this.mSmallLetterTxtSp,
			this.mGameTxtSp,
		];

		for (let i = 0; i < this.mBtnAry.length; i++) {
			const btn = this.mBtnAry[i];
			btn.index = i + 1; // Title이 0번 고정이므로 1부터 시작해야 함.
			btn.addCustomEventListener(EventType.ButtonUp, () => {
				// this.selectButton(btn.index);
				this.dispatchEvent(EventType.ReceiveData, btn.index);
			});
		}
	}

	// 서브 타이틀 보여질때 버튼 설정을 나타낸다.
	private setVisibleBtn(tFlag: boolean) {
		for (const tBtn of this.mBtnAry) {
			tBtn.visible = tFlag;
		}
	}

	// 모드 이동시 버튼 누름 설정을 나타낸다.
	selectButton(idx: number) {
		//
		if (idx === 0) return;
		for (let i = 0; i < this.mBtnAry.length; i++) {
			const btn = this.mBtnAry[i];
			const btnTxtSp = this.mBtnTxtAry[i];
			// console.log(`selectButton = ${btn.index} , idx = ${idx}`);
			if (btn.index == idx) {
				btnTxtSp.style = this.mBtnOnStyle;
				btn.selected = true;
			} else {
				btnTxtSp.style = this.mBtnOffStyle;
				btn.selected = false;
			}
		}
	}

	// 오늘의 학습시 버튼 비활성화 처리를 나타낸다.
	settingButton(idx: number) {
		for (let i = 0; i < this.mBtnAry.length; i++) {
			const btn = this.mBtnAry[i];

			// console.log(`===== idx = ${idx}, btn.index = ${btn.index}`);
			btn.disabled = true;
			if (btn.index <= idx) {
				// if (btn.index === 3) this.mSmallLetterTxtSp.style = this.mBtnOffStyle;
				btn.disabled = false;
			}
		}
	}

	// 사운드 뮤트 버튼을 설정을 나타낸다.
	async soundMute() {
		gsap.killTweensOf(this.mSoundMuteCt);

		this.mSoundMute = !this.mSoundMute;
		console.log(`soundMute = ${this.mSoundMute}`);
		this.mSoundBtn.selected = this.mSoundMute;
		if (this.mSoundMute) {
			this.mSoundOnSp.visible = false;
			this.mSoundOffSp.visible = true;
			SoundManager.Handle.muteBgm(true);
		} else {
			this.mSoundOnSp.visible = true;
			this.mSoundOffSp.visible = false;
			SoundManager.Handle.muteBgm(false);
		}

		this.mSoundMuteCt.alpha = 1;
		// await App.Handle.tweenMotion('delay', 1);
		gsap.to(this.mSoundMuteCt, { alpha: 0, duration: 1, delay: 1 });
	}

	// 사운드 뮤트 버튼의 보여주기 설정을 나타낸다.
	soundMuteShow(tFlag: boolean) {
		this.mSoundBtn.visible = tFlag;
	}
}
