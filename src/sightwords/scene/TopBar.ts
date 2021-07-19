import { SceneBase } from '../../com/core/SceneBase';
import { ViewerRscManager } from '../../com/manager/ViewerRscManager';
import { SoundManager } from '../../com/manager/SoundManager';

import { Button } from '../../com/widget/Button';
import { EventType } from '../../com/core/EventType';
import gsap from 'gsap';
import { App } from '../../com/core/App';
import AppConf from '../SightWordsConf';
import Config from '../../com/util/Config';

export class TopBar extends SceneBase {
	private mTitleCt: PIXI.Container;
	private mTitleBarBtn: Button;
	private mIntroBtn: Button;
	private mStoryBtn: Button;
	private mActivityBtn: Button;
	private mChantBtn: Button;
	private mBtnOffStyle: PIXI.TextStyle;
	private mBtnOnStyle: PIXI.TextStyle;
	private mPatternTxtSp: PIXI.Text;
	private mPracticeTxtSp: PIXI.Text;
	private mChantTxtSp: PIXI.Text;
	private mMainTitleTxtSp: PIXI.Text;
	private mSubTitleTxtSp: PIXI.Text;

	private mSoundMuteCt: PIXI.Container;
	private mSoundOnSp: PIXI.Sprite;
	private mSoundOffSp: PIXI.Sprite;
	private mSoundBtn: Button;
	private mSoundMute: boolean;

	private mCloseBtn: Button;

	private mBtnAry: Array<Button>;
	private mBtnTxtAry: Array<PIXI.Text>;

	private mTitleBarFlag: boolean;
	private mViewSheet: PIXI.Spritesheet;

	constructor() {
		super();
		this.name = 'TopBar';
	}

	async onInit() {
		this.mTitleBarFlag = false;
		this.mSoundMute = false;

		this.mViewSheet = ViewerRscManager.Handle.getResource(
			'common',
			`ap_view.json`,
		).spritesheet;

		// 탑바 배경
		const bg = new PIXI.Sprite(this.mViewSheet.textures['topbarBg.png']);
		bg.width = App.Handle.appWidth;
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
			fill: '#ff2300',
			fontFamily: 'NanumSquareRound',
			fontWeight: 'normal',
			fontSize: 28 * 2,
			// padding: 20,
			// wordWrap: true,
		});

		// Words 버튼
		this.mIntroBtn = new Button(
			this.mViewSheet.textures['Pattern_btn_off.png'],
			this.mViewSheet.textures['Pattern_btn_on.png'],
		);
		this.mIntroBtn.setAnchor(0.5, 0.5);
		this.mIntroBtn.x = 217;
		this.mIntroBtn.y = 32;
		this.addChild(this.mIntroBtn);

		this.mPatternTxtSp = new PIXI.Text('Pattern');
		this.mPatternTxtSp.style = this.mBtnOffStyle;
		this.mPatternTxtSp.anchor.set(0.5);
		this.mPatternTxtSp.position.set(217, 31);
		this.mPatternTxtSp.scale.set(0.5);
		this.mPatternTxtSp.roundPixels = true;
		this.addChild(this.mPatternTxtSp);

		// Animation 버튼
		this.mStoryBtn = new Button(
			this.mViewSheet.textures['Practice_btn_off.png'],
			this.mViewSheet.textures['Practice_btn_on.png'],
		);
		this.mStoryBtn.setAnchor(0.5, 0.5);
		this.mStoryBtn.x = 409;
		this.mStoryBtn.y = 32;
		this.addChild(this.mStoryBtn);

		this.mPracticeTxtSp = new PIXI.Text('Practice');
		this.mPracticeTxtSp.style = this.mBtnOffStyle;
		this.mPracticeTxtSp.anchor.set(0.5);
		this.mPracticeTxtSp.position.set(409, 31);
		this.mPracticeTxtSp.scale.set(0.5);
		this.mPracticeTxtSp.roundPixels = true;
		this.addChild(this.mPracticeTxtSp);

		// Chant 버튼
		this.mActivityBtn = new Button(
			this.mViewSheet.textures['chant_btn_off.png'],
			this.mViewSheet.textures['chant_btn_on.png'],
		);
		this.mActivityBtn.setAnchor(0.5, 0.5);
		this.mActivityBtn.x = 598;
		this.mActivityBtn.y = 32;
		this.addChild(this.mActivityBtn);

		this.mChantTxtSp = new PIXI.Text('Chant');
		this.mChantTxtSp.style = this.mBtnOffStyle;
		this.mChantTxtSp.anchor.set(0.5);
		this.mChantTxtSp.position.set(598, 31);
		this.mChantTxtSp.scale.set(0.5);
		this.mChantTxtSp.roundPixels = true;
		this.addChild(this.mChantTxtSp);
		this.mSoundMuteCt = new PIXI.Container();
		this.mSoundOnSp = new PIXI.Sprite(
			this.mViewSheet.textures['big_sound_on.png'],
		);
		this.mSoundOnSp.anchor.set(0.5);
		this.mSoundOnSp.position.set(Config.width / 2, Config.height / 2);
		this.mSoundOnSp.visible = false;
		this.mSoundMuteCt.addChild(this.mSoundOnSp);

		this.mSoundOffSp = new PIXI.Sprite(
			this.mViewSheet.textures['big_sound_off.png'],
		);
		this.mSoundOffSp.anchor.set(0.5);
		this.mSoundOffSp.position.set(Config.width / 2, Config.height / 2);
		this.mSoundOffSp.visible = false;
		this.mSoundMuteCt.addChild(this.mSoundOffSp);
		this.addChild(this.mSoundMuteCt);

		// 사운드 뮤트 버튼
		this.mSoundBtn = new Button(
			this.mViewSheet.textures['sound_on.png'],
			this.mViewSheet.textures['sound_off.png'],
		);
		this.mSoundBtn.addCustomEventListener(EventType.ButtonUp, () => {
			this.soundMute();
		});
		this.mSoundBtn.setAnchor(0.5, 0.5);
		this.mSoundBtn.position.set(1194, 32);
		this.addChild(this.mSoundBtn);

		// 앱 종료 버튼
		this.mCloseBtn = new Button(this.mViewSheet.textures['close_btn.png']);
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
		const titleBar = new PIXI.Sprite(this.mViewSheet.textures['titlebar.png']);
		titleBar.position.set(25, 12);
		this.mTitleCt.addChild(titleBar);

		const titleSubStyle = new PIXI.TextStyle({
			align: 'left',
			fill: '#ffffff',
			fontFamily: 'NanumSquareRound',
			fontWeight: 'normal',
			fontSize: 24 * 2,
		});

		const tTitleTxt = `${AppConf.LCMS.content.title}`;
		const titleTxt = tTitleTxt.split('. ');
		let tTitleSubTxt = '';
		if (Config.devMode) {
			tTitleSubTxt = Config.subjectName;
		} else {
			tTitleSubTxt = titleTxt[1].slice(0, -1);
		}
		this.mSubTitleTxtSp = new PIXI.Text(tTitleSubTxt);
		this.mSubTitleTxtSp.style = titleSubStyle;
		this.mSubTitleTxtSp.anchor.set(0, 0.5);
		this.mSubTitleTxtSp.position.set(130, 32);
		this.mSubTitleTxtSp.scale.set(0.5);
		this.mSubTitleTxtSp.roundPixels = true;
		this.mTitleCt.addChild(this.mSubTitleTxtSp);

		this.addChild(this.mTitleCt);
		this.mTitleCt.position.x = tTitleLocH;

		//뚜루뚜루 아바타를 나타낸다.
		const avatarImg = new PIXI.Sprite(
			this.mViewSheet.textures['topavatar.png'],
		);
		avatarImg.position.set(0, 0);
		this.addChild(avatarImg);

		const titleMainStyle = new PIXI.TextStyle({
			align: 'left',
			fill: '#ffffff',
			fontFamily: 'NanumSquareRound',
			fontWeight: 'normal',
			fontSize: 24 * 2,
		});

		let tTitleMainTxt = '';
		if (Config.devMode) {
			tTitleMainTxt = `${Config.subjectNum}장`;
		} else {
			tTitleMainTxt = titleTxt[0];
		}
		this.mMainTitleTxtSp = new PIXI.Text(tTitleMainTxt);
		this.mMainTitleTxtSp.style = titleMainStyle;
		this.mMainTitleTxtSp.anchor.set(1, 0.5);
		this.mMainTitleTxtSp.position.set(85, 30);
		this.mMainTitleTxtSp.scale.set(0.5);
		this.mMainTitleTxtSp.roundPixels = true;
		// console.log(this.mMainTitleTxtSp.width);
		this.addChild(this.mMainTitleTxtSp);

		// const titleBarIcon = new PIXI.Sprite( ViewerRscManager.Handle.getResource( this.name, 'titlebaricon.png').texture );
		// titleBarIcon.position.set(150,18);
		// this.addChild(titleBarIcon);
		this.mTitleBarBtn = new Button(
			this.mViewSheet.textures['titlebaricon.png'],
		);
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
		this.mBtnAry = [this.mIntroBtn, this.mStoryBtn, this.mActivityBtn];
		this.mBtnTxtAry = [
			this.mPatternTxtSp,
			this.mPracticeTxtSp,
			this.mChantTxtSp,
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
		// console.log(`settingButton ${idx}`);
		for (let i = 0; i < this.mBtnAry.length; i++) {
			const btn = this.mBtnAry[i];

			// console.log(`===== idx = ${idx}, btn.index = ${btn.index}`);
			btn.disabled = true;
			if (btn.index <= idx) {
				btn.disabled = false;
			}
		}
	}

	// 타이틀 바꾸기를 나타낸다.
	reSetTitle() {
		const tTitleTxt = `${AppConf.LCMS.content.title}`;
		const titleTxt = tTitleTxt.split('. ');
		let tTitleSubTxt = '';
		if (Config.devMode) {
			tTitleSubTxt = Config.subjectName;
		} else {
			tTitleSubTxt = titleTxt[1].slice(0, -1);
		}
		this.mSubTitleTxtSp.text = tTitleSubTxt;

		let tTitleMainTxt = '';
		if (Config.devMode) {
			tTitleMainTxt = `${Config.subjectNum}장`;
		} else {
			tTitleMainTxt = titleTxt[0];
		}
		this.mMainTitleTxtSp.text = tTitleMainTxt;
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
