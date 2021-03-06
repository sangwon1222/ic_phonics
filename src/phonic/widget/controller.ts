import * as PIXI from 'pixi.js';
import gsap, { Power0 } from 'gsap/all';
import { PhonicsApp } from '../core/app';
import { ResourceManager } from '../core/resourceManager';
import config from '../../com/util/Config';
import { Btn } from './btn';
import Config from '../../com/util/Config';
import { gameData } from '../core/resource/product/gameData';
import { isIOS } from '../utill/gameUtil';
import pixiSound from 'pixi-sound';

// 게임 라벨 , 클릭하면 해당 게임으로 이동한다.
export class LabelBtn extends PIXI.Sprite {
	private mOn: PIXI.Texture;
	private mOff: PIXI.Texture;

	// 해당 게임을 완료했는지 / 안했는지
	private mCompleted: boolean;
	get completed(): boolean {
		return this.mCompleted;
	}
	set completed(v: boolean) {
		this.mCompleted = v;
		if (v) {
			this.interactive = true;
			this.buttonMode = true;
		}
	}

	// 해당 게임 이름
	private mLabel: string;
	get label(): string {
		return this.mLabel;
	}

	constructor(label: string) {
		super();
		this.mLabel = label;
		this.mOn = ResourceManager.Handle.getCommon(
			`${this.mLabel}_btn_on.png`,
		).texture;
		this.mOff = ResourceManager.Handle.getCommon(
			`${this.mLabel}_btn_off.png`,
		).texture;
		this.texture = this.mOff;

		this.roundPixels = true;
		// this.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

		this.interactive = false;
		this.buttonMode = false;

		this.mCompleted = false;
		this.anchor.set(0.5);

		this.on('pointertap', async () => {
			await this.clickLabelBtn();
		});
	}

	// 게임 활성화 및 클릭가능
	able() {
		this.texture = this.mOn;
		this.completed = true;
	}

	// 완료된 게임이면 활성, 미완료면 비활성
	disable() {
		if (Config.isFreeStudy) {
			this.interactive = true;
			this.buttonMode = true;
		}
		this.texture = this.mOff;
	}

	// 게임라벨을 클릭=> 해당라벨 활성화 후 , 게임 이동
	async clickLabelBtn() {
		if (PhonicsApp.Handle.currectSceneName == this.mLabel) {
			return;
		}
		if (!Config.isFreeStudy && !this.mCompleted) {
			return;
		}

		// 전체 라벨을 비활성화 한 뒤,
		await (this.parent as Controller).labelDisable();
		// 해당 라벨만 활성화 하고.
		this.able();
		// 해당 라벨의 게임으로 이동한다.
		await PhonicsApp.Handle.goScene(this.mLabel);
	}
}

// 왼쪽 빼꼼하는 캐릭터 (게임 시작시 설명해주는 역할)
export class Character extends PIXI.Container {
	private mCha: PIXI.Sprite;
	get cha(): PIXI.Sprite {
		return this.mCha;
	}

	private mBubble: PIXI.Sprite;
	private mBubbleAni: gsap.core.Timeline;

	// 말주머니안의 점을 가리거나 보여주는 역할
	private mBubbleMask: PIXI.Graphics;
	private mMaskBackUpX: number;
	constructor() {
		super();
		this.mCha = new PIXI.Sprite(
			ResourceManager.Handle.getCommon('character.png').texture,
		);
		this.mCha.anchor.set(0.5);
		this.mCha.angle = 34;
		this.mCha.x = -70;

		this.addChild(this.mCha);

		// 캐릭터 말주머니 생성
		this.createSpeech();

		this.on('pointertap', async () => {
			await (this.parent as Controller).clickBlock(true);
			await this.onClickCharacter();
			await (this.parent as Controller).clickBlock(false);
		});

		// 초기 인터렉션 활성화
		this.interactiveFlag(true);
	}

	reset() {
		gsap.killTweensOf(this);
		gsap.killTweensOf(this.mCha);
		this.mCha.anchor.set(0.5);
		this.mCha.angle = 34;
		this.x = -120;
	}
	// 캐릭터 말주머니 생성
	createSpeech() {
		this.mBubble = new PIXI.Sprite(
			ResourceManager.Handle.getCommon(`bubble.png`).texture,
		);
		this.mBubble.anchor.set(0.5);
		this.mBubble.position.set(46, -90);

		// 말주머니 안에 들어가는 점 점 점 이미지
		const dot = new PIXI.Sprite(
			ResourceManager.Handle.getCommon(`bubble_dot.png`).texture,
		);
		dot.anchor.set(0.5);
		dot.position.set(this.mBubble.x, this.mBubble.y);

		// 마스크로 점 하나만 보이게 한뒤, 마스크의 위치설정으로 모션 생성
		this.mBubbleMask = new PIXI.Graphics();
		this.mBubbleMask.beginFill(0x000000, 1);
		this.mBubbleMask.drawRect(0, 0, this.mBubble.width, this.mBubble.height);
		this.mBubbleMask.endFill();
		this.mBubbleMask.pivot.set(this.mBubble.width / 2, this.mBubble.height / 2);
		this.mBubbleMask.position.set(this.mBubble.x - 36, this.mBubble.y);
		this.mMaskBackUpX = this.mBubbleMask.x;

		dot.mask = this.mBubbleMask;

		this.addChild(this.mBubble, dot, this.mBubbleMask);
	}

	// 캐릭터 말주머니 모션
	bubble() {
		const x = this.mMaskBackUpX;
		// 마스크의 위치설정
		if (this.mBubbleAni) {
			this.mBubbleAni.kill();
			this.mBubbleAni = null;
			this.mBubbleMask.x = x;
		}
		this.mBubbleAni = gsap.timeline({ repeat: -1 });
		this.mBubbleAni
			.to(this.mBubbleMask, { x: x, duration: 1 })
			.to(this.mBubbleMask, { x: x + 14, duration: 0 })
			.to(this.mBubbleMask, { x: x + 14, duration: 1 })
			.to(this.mBubbleMask, { x: x + 40, duration: 0 })
			.to(this.mBubbleMask, { x: x + 40, duration: 1 });
	}

	// 캐릭터 클릭하면 화면으로 나와서 설명하는 모션
	async onClickCharacter() {
		// 이벤트 중복 피하기 위해 인터렉션을 끈다.
		this.interactiveFlag(false);
		// 모션 중

		await this.guideMotion();

		// 모션이 끝나면 다시 인터렉션을 켜준다.
		this.interactiveFlag(true);
	}

	guideMotion(): Promise<void> {
		return new Promise<void>(resolve => {
			let duration = 0;

			this.mBubble.visible = false;
			this.mBubbleMask.visible = false;

			pixiSound.resumeAll();

			if (window['guide_snd']) {
				window['guide_snd'].play();
				duration = window['guide_snd'].duration + 1;
			}

			this.mCha.angle = 0;
			gsap.to(this, { x: 100, duration: 0.3 });
			gsap
				.to(this.mCha, {
					angle: 24,
					duration: 0.6,
					ease: Power0.easeNone,
				})
				.yoyo(true)
				.repeat(-1)
				.delay(0.5);
			gsap.delayedCall(duration, () => {
				gsap.killTweensOf(this);
				gsap.killTweensOf(this.mCha);
				gsap.to(this.mCha, { angle: 34, duration: 0.5 });
				gsap
					.to(this, { x: 0, duration: 0.5 })
					.eventCallback('onComplete', () => {
						this.x = 0;
						this.mCha.angle = 34;
						this.mBubble.visible = true;
						this.mBubbleMask.visible = true;
						resolve();
					});
			});
		});
	}

	// 이벤트 활성, 비활성
	interactiveFlag(flag: boolean) {
		this.interactive = flag;
		this.buttonMode = flag;
	}
}

// 이전 (모듈/게임) , 다음 (모듈/게임) 으로 이동하는 버튼
export class PrevNextBtn extends PIXI.Container {
	private mPrevBtn: PIXI.Sprite;
	private mNextBtn: PIXI.Sprite;
	constructor() {
		super();
	}
	async onInit() {
		await this.createBtn();
		await this.registEvent();
	}

	// (이전버튼)과 (다음버튼) 생성
	createBtn(): Promise<void> {
		return new Promise<void>(resolve => {
			this.mPrevBtn = new PIXI.Sprite(
				ResourceManager.Handle.getCommon('next_btn.png').texture,
			);
			this.mPrevBtn.angle = 180;
			this.mPrevBtn.anchor.set(0.5);
			this.mPrevBtn.position.set(38, 712);

			this.mNextBtn = new PIXI.Sprite(
				ResourceManager.Handle.getCommon('next_btn.png').texture,
			);
			this.mNextBtn.anchor.set(0.5);
			this.mNextBtn.position.set(1242, 712);

			this.addChild(this.mPrevBtn, this.mNextBtn);
			resolve();
		});
	}

	// (이전버튼), (다음버튼) 을 클릭했을때, 이벤트 등록
	registEvent() {
		this.mPrevBtn.interactive = true;
		this.mPrevBtn.buttonMode = true;

		this.mNextBtn.interactive = true;
		this.mNextBtn.buttonMode = true;

		this.mPrevBtn.on('pointertap', async () => {
			await this.onClickPrev();
		});

		this.mNextBtn.on('pointertap', async () => {
			await this.onClickNext();
		});
	}

	// 해당 게임 (chant, sound, game) 에서 override
	onClickPrev() {
		//
	}
	// 해당 게임 (chant, sound, game) 에서 override
	onClickNext() {
		//
	}

	resetBtn(): Promise<void> {
		return new Promise<void>(resolve => {
			// this.onClickPrev = () => null;
			// this.onClickNext = () => null;
			this.mPrevBtn.alpha = 1;
			this.mPrevBtn.interactive = true;
			this.mPrevBtn.buttonMode = true;

			this.mNextBtn.alpha = 1;
			this.mNextBtn.interactive = true;
			this.mNextBtn.buttonMode = true;

			resolve();
		});
	}

	disableBtn(btn: string) {
		if (btn == 'prev') {
			this.mPrevBtn.alpha = 0.6;
			this.mPrevBtn.interactive = false;
			this.mPrevBtn.buttonMode = false;
		}
		if (btn == 'next') {
			this.mNextBtn.alpha = 0.6;
			this.mNextBtn.interactive = false;
			this.mNextBtn.buttonMode = false;
		}
	}

	// 게임이나 모듈 완료시 다음 버튼 깜빡이는 모션
	blintNextBtn(flag: boolean) {
		if (Config.isFreeStudy) {
			return;
		}

		gsap.killTweensOf(this.mNextBtn);
		this.mNextBtn.alpha = 1;

		this.mNextBtn.interactive = true;

		if (flag) {
			gsap
				.to(this.mNextBtn, {
					alpha: 0.4,
					duration: 0.5,
					ease: Power0.easeNone,
				})
				.repeat(-1)
				.yoyo(true);
		}
	}

	// 이전, 다음 버튼 클릭이벤트 금지
	lock() {
		gsap.killTweensOf(this.mNextBtn);
		this.mNextBtn.alpha = 1;
		this.mPrevBtn.interactive = false;
		this.mNextBtn.interactive = false;
	}

	// 이전, 다음 버튼 클릭이벤트 허용 & 다음버튼 깜빡거림
	unLock() {
		this.blintNextBtn(true);
		this.mPrevBtn.interactive = true;
		this.mNextBtn.interactive = true;
	}
}

// 게임의 header, bottom
export class Controller extends PIXI.Container {
	// 현재 진행중인 액티비티 이름
	private mCurrentActivity: string;
	get currentAc(): string {
		return this.mCurrentActivity;
	}

	private mStepBg: PIXI.Sprite;
	private mStepArrow: PIXI.Sprite;
	private mLongStep: PIXI.Sprite;
	private mLongStepFlag: boolean;

	private mLabelBtnAry: Array<LabelBtn>;

	private mPrevNextBtn: PrevNextBtn;
	get prevNextBtn(): PrevNextBtn {
		return this.mPrevNextBtn;
	}

	private mCha: Character;

	private mTitleText: PIXI.Text;
	private mSubText: PIXI.Text;

	private mBGMBtn: Btn;
	get bgmBtn(): Btn {
		return this.mBGMBtn;
	}

	private mBGMflag: boolean;
	get bgmFlag(): boolean {
		return this.mBGMflag;
	}
	private mBGMSprite: PIXI.Sprite;
	get bgmSprite(): PIXI.Sprite {
		return this.mBGMSprite;
	}

	private mStudyedStep: {};
	get studyed(): {} {
		return this.mStudyedStep;
	}

	private mClickBlock: PIXI.Graphics;

	constructor() {
		super();
	}

	async onInit() {
		this.mStudyedStep = {};
		await this.createStudyedStep();
		this.mBGMflag = true;

		this.mCurrentActivity = 'chant';

		const bg = new PIXI.Graphics();
		bg.beginFill(0x333333, 1);
		bg.drawRect(0, 0, Config.width, 64);
		bg.endFill();
		this.addChild(bg);

		// header 1장, 버튼 생성
		await this.createStepLabel();
		// 1장 클릭시 나오는 서브텍스트 생성
		this.mLongStepFlag = false;
		await this.createLongStepBar();

		// 닫기버튼 생성
		await this.createCloseBtn();

		// 옆에 빼꼼나오는 캐릭터 생성
		this.createCharacter();

		// header 클릭하면 해당 액티비티로 이동하는 버튼 생성
		await this.createActivityBtn();

		// (1장)버튼 스텝 클릭시 기능 구현
		this.registClickStep();

		this.mPrevNextBtn = new PrevNextBtn();
		await this.mPrevNextBtn.onInit();
		this.addChild(this.mPrevNextBtn);

		this.mClickBlock = new PIXI.Graphics();
		this.mClickBlock.beginFill(0x000000, 0.1);
		this.mClickBlock.drawRect(0, 0, Config.width, Config.height);
		this.mClickBlock.endFill();
		this.mClickBlock.interactive = true;
		this.mClickBlock.zIndex = 3;
	}

	private createStudyedStep(): Promise<void> {
		return new Promise<void>(resolve => {
			const mode = Config.currentMode;
			const idx = Config.currentIdx;
			if (mode !== 0) {
				for (let i = 0; i < mode; i++) {
					const studyed = this.mStudyedStep[i];
					studyed.completed.module1 = true;
					idx == 1
						? (studyed.completed.module2 = true)
						: (studyed.completed.module2 = false);
				}
			} else {
				this.mStudyedStep[0] = {
					label: 'chant',
					completed: { module1: false },
				};
				this.mStudyedStep[1] = {
					label: 'sound',
					completed: { module1: false, module2: false },
				};
				this.mStudyedStep[2] = {
					label: 'game',
					completed: { module1: false, module2: false },
				};
			}
			console.groupCollapsed(
				`%c 현재 액티비티 진도`,
				'padding: 2px; background: #000; color: #fff;',
			);
			for (let i = 0; i < Object.keys(this.mStudyedStep).length; i++) {
				console.log(`%c ${this.mStudyedStep[i].label}`, 'font-weight:800;');
				console.log(this.mStudyedStep[i].completed);
			}
			console.groupEnd();
			resolve();
		});
	}

	updateInfo() {
		this.mBGMSprite.visible = false;

		this.mTitleText.text = `${Config.subjectNum}장`;
		this.mTitleText.pivot.set(
			this.mTitleText.width / 2,
			this.mTitleText.height / 2,
		);

		this.mSubText.text = `  ${gameData[`day${Config.subjectNum}`].title}`;
		this.mSubText.pivot.set(this.mSubText.width / 2, this.mSubText.height / 2);
		this.mSubText.x =
			-this.mLongStep.width / 2 + this.mStepBg.width + this.mSubText.width / 2;
		this.mLongStep.addChild(this.mSubText);
	}

	// 캐릭터 생성
	createCharacter() {
		this.mCha = new Character();
		this.addChild(this.mCha);
		this.mCha.position.set(0, 260 - 20);
		this.mCha.zIndex = 4;
	}

	clickBlock(flag: boolean) {
		flag ? this.addChild(this.mClickBlock) : this.removeChild(this.mClickBlock);
		window['rocket_timer'] ? window['rocket_timer'](!flag) : null;
	}

	async startGuide() {
		if (isIOS()) {
			await this.iosDirection();
		} else {
			await this.mCha.onClickCharacter();
		}
	}

	iosDirection(): Promise<void> {
		return new Promise<void>(resolve => {
			let dimmed = new PIXI.Graphics();
			dimmed.beginFill(0x000000, 0.8);
			dimmed.drawRect(0, 0, Config.width, Config.height);
			dimmed.endFill();
			this.addChild(dimmed);
			dimmed.zIndex = 4;

			let hand = new PIXI.Sprite(
				ResourceManager.Handle.getCommon(`click.png`).texture,
			);
			hand.anchor.set(0.5);
			hand.position.set(Config.width / 2, Config.height / 2);
			hand.scale.set(1.6);
			dimmed.addChild(hand);

			let hanMotion = gsap.timeline({ repeat: -1, repeatDelay: 1 });
			hanMotion
				.to(hand, { alpha: 1, duration: 0.25 })
				.to(hand.scale, { x: 1, y: 1, duration: 0.5 })
				.to(hand, { alpha: 0, duration: 0.25 });

			dimmed.interactive = true;
			dimmed.buttonMode = true;
			dimmed.on('pointertap', async () => {
				hanMotion.kill();
				hanMotion = null;
				gsap.killTweensOf(hand);
				dimmed.removeChild(hand);
				hand = null;
				this.removeChild(dimmed);
				dimmed = null;
				await this.mCha.onClickCharacter();
				resolve();
			});
		});
	}

	settingGuideSnd(snd: string): Promise<void> {
		return new Promise<void>(resolve => {
			if (window['guide_snd']) {
				window['guide_snd'].pause();
				window['guide_snd'] = null;
			}

			let url = '';
			Config.restAPIProd.slice(-2) == 'g/'
				? (url = `${Config.restAPIProd}ps_phonics/viewer/sounds/${snd}`)
				: (url = `${Config.restAPIProd}viewer/sounds/${snd}`);
			window['guide_snd'] = new Audio(url);
			window['guide_snd'].onloadedmetadata = () => {
				window['guide_snd'].onloadedmetadata = () => null;
				resolve();
			};
		});
	}

	// 캐릭터 위치 , 이전다음버튼 리셋
	async reset() {
		this.mBGMSprite.visible = false;
		this.mBGMBtn.interactive = true;
		PhonicsApp.Handle.currectSceneName == 'chant'
			? (this.mCha.visible = false)
			: (this.mCha.visible = true);

		this.mPrevNextBtn ? await this.mPrevNextBtn.resetBtn() : null;
		this.mCha.position.set(0, 260 - 20);
		this.mCha.reset();
		this.mCha.bubble();
		this.mCha.interactiveFlag(true);
	}

	// 캐릭터 위치 , 이전다음버튼 리셋
	async outro() {
		if (window['guide_snd']) {
			window['guide_snd'].pause();
			window['guide_snd'].currentTime = 0;
		}
		this.clickBlock(false);
		this.mCha.position.set(-200, 260 - 20);
		this.mCha.interactiveFlag(false);
	}

	// 닫기버튼 , 사운드버튼 생성
	createCloseBtn(): Promise<void> {
		return new Promise<void>(resolve => {
			const close = new PIXI.Sprite(
				ResourceManager.Handle.getCommon('close_btn.png').texture,
			);
			close.anchor.set(0.5);
			close.position.set(1248, 32);
			close.interactive = true;
			close.buttonMode = true;
			close.on('pointertap', () => {
				PhonicsApp.Handle.exitApp();
				// history.go(-1);
			});

			this.mBGMBtn = new Btn('sound_on.png', 'sound_off.png');
			this.mBGMBtn.position.set(1190, 32);

			this.mBGMSprite = new PIXI.Sprite();
			this.mBGMSprite.position.set(Config.width / 2, Config.height / 2);
			this.mBGMSprite.alpha = 0;
			this.addChild(this.mBGMSprite);

			this.mBGMBtn.onPointerTap = async () => {
				this.mBGMBtn.interactive = false;
				await this.bgmToggle();
				this.mBGMBtn.interactive = true;
			};

			this.addChild(close, this.mBGMBtn);

			resolve();
		});
	}

	bgmToggle(): Promise<void> {
		return new Promise<void>(resolve => {
			if (window['bgm']) {
				this.mBGMflag = !this.mBGMflag;
				this.mBGMBtn.customToggle(this.mBGMflag);

				this.mBGMSprite.visible = true;
				if (this.mBGMflag) {
					window['bgm'].muted = false;
					isIOS() ? window['bgm'].play() : null;
					this.mBGMSprite.texture = ResourceManager.Handle.getCommon(
						'big_sound_on.png',
					).texture;
					this.mBGMSprite.anchor.set(0.5);
				} else {
					window['bgm'].muted = true;
					isIOS() ? window['bgm'].pause() : null;
					this.mBGMSprite.texture = ResourceManager.Handle.getCommon(
						'big_sound_off.png',
					).texture;
					this.mBGMSprite.anchor.set(0.5);
				}

				gsap
					.to(this.mBGMSprite, { alpha: 1, duration: 0.5 })
					.yoyo(true)
					.repeat(1)
					.eventCallback('onComplete', () => {
						this.mBGMSprite.visible = false;
						resolve();
					});
			}
		});
	}

	// 헤더 (1장) 버튼 생성
	createStepLabel(): Promise<void> {
		return new Promise<void>(resolve => {
			this.mStepBg = new PIXI.Sprite(
				ResourceManager.Handle.getCommon('step_bg.png').texture,
			);

			this.mStepBg.anchor.set(0.5);
			this.mStepBg.position.set(64, 32);

			this.mTitleText = new PIXI.Text('1장', {
				fill: 0xffffff,
				fontFamily: 'NanumSquareRound',
				fontSize: 24,
				padding: 20,
			});
			this.mTitleText.roundPixels = true;
			this.mTitleText.pivot.set(
				this.mTitleText.width / 2,
				this.mTitleText.height / 2,
			);
			this.mTitleText.position.set(-14, 0);

			this.mStepArrow = new PIXI.Sprite(
				ResourceManager.Handle.getCommon('step_arrow.png').texture,
			);
			this.mStepArrow.anchor.set(0.5);
			this.mStepArrow.position.set(30, 0);

			this.mStepBg.addChild(this.mTitleText, this.mStepArrow);
			this.addChild(this.mStepBg);

			this.sortableChildren = true;
			this.mStepBg.zIndex = 3;
			resolve();
		});
	}

	// header (1장버튼 누르면 나오는) 서브택스트 생성
	createLongStepBar(): Promise<void> {
		return new Promise<void>(resolve => {
			this.mLongStep = new PIXI.Sprite(
				ResourceManager.Handle.getCommon('long_step_1.png').texture,
			);
			this.mLongStep.anchor.set(0.5);
			this.mLongStep.position.set(-this.mLongStep.width / 2, this.mStepBg.y);

			this.mSubText = new PIXI.Text(
				`  ${gameData[`day${Config.subjectNum}`].title}`,
				{
					fontFamily: 'NanumSquareRound',
					fontSize: 24,
					fill: 0xffffff,
					padding: 20,
				},
			);
			this.mSubText.roundPixels = true;
			this.mSubText.pivot.set(
				this.mSubText.width / 2,
				this.mSubText.height / 2,
			);
			this.mSubText.x =
				-this.mLongStep.width / 2 + this.mStepBg.width + this.mSubText.width;
			this.mLongStep.addChild(this.mSubText);

			const mask = new PIXI.Graphics();
			mask.beginFill(0x000000, 1);
			mask.drawRect(0, 0, this.mLongStep.width, this.mLongStep.height);
			mask.endFill();
			mask.pivot.set(mask.width / 2, mask.height / 2);
			mask.position.set(config.width / 2, this.mStepBg.y);
			this.mLongStep.mask = mask;

			this.addChild(this.mLongStep, mask);
			this.mLongStep.zIndex = 2;
			resolve();
		});
	}

	// 1장 눌렀을때, 서브택스트 show/hide 기능 등록
	private registClickStep() {
		this.mStepBg.interactive = true;
		this.mStepBg.buttonMode = true;
		this.mStepBg.on('pointertap', async () => {
			this.mStepBg.interactive = false;
			this.mStepBg.buttonMode = false;
			this.mLongStepFlag ? await this.hideStepBar() : await this.showStepBar();
			this.mStepBg.interactive = true;
			this.mStepBg.buttonMode = true;
		});
	}

	// 1장 누르면 서브텍스트 show
	private showStepBar(): Promise<void> {
		return new Promise<void>(resolve => {
			gsap.to(this.mStepArrow, { angle: 180, duration: 0.5 });
			gsap
				.to(this.mLongStep, {
					x: config.width / 2 - 50,
					duration: 0.5,
				})
				.eventCallback('onComplete', () => {
					this.mLongStepFlag = true;
					resolve();
				});
		});
	}

	// 1장 서브택스트 hide
	private hideStepBar(): Promise<void> {
		return new Promise<void>(resolve => {
			gsap.to(this.mStepArrow, { angle: 0, duration: 0.5 });
			gsap
				.to(this.mLongStep, {
					x: -this.mLongStep.width / 2,
					duration: 0.5,
				})
				.eventCallback('onComplete', () => {
					this.mLongStepFlag = false;
					resolve();
				});
		});
	}

	// 게임 라벨 생성 (클릭하면 해당 액티비티로 이동)
	createActivityBtn(): Promise<void> {
		return new Promise<void>(resolve => {
			const list = ['chant', 'sound', 'game'];
			const listPos = [
				{ x: 202, y: 32 },
				{ x: 364, y: 32 },
				{ x: 524, y: 32 },
			];
			this.mLabelBtnAry = [];
			for (let i = 0; i < 3; i++) {
				const label = new LabelBtn(list[i]);
				label.position.set(listPos[i].x, listPos[i].y);
				this.addChild(label);
				this.mLabelBtnAry.push(label);
				list[i] == this.mCurrentActivity ? label.able() : label.disable();
			}
			resolve();
		});
	}

	// 게임라벨 누르면, 모든 라벨 비활성화
	labelDisable(): Promise<void> {
		return new Promise<void>(resolve => {
			for (const label of this.mLabelBtnAry) {
				label.disable();
			}
			resolve();
		});
	}

	// app.ts / goScene에서 실행
	// 라벨의 색을 까맣게(disable) , 진행중인 액티비티만 하얀이미지로(able) 변경
	changeLabel(currentScene: string) {
		for (let i = 0; i < this.mLabelBtnAry.length; i++) {
			if (currentScene == this.mLabelBtnAry[i].label) {
				this.mLabelBtnAry[i].able();
			} else {
				this.mLabelBtnAry[i].disable();
			}
		}
	}

	checkAbleLabel() {
		return this.mStudyedStep;
	}

	completedLabel(): Promise<void> {
		return new Promise<void>(resolve => {
			this.mStudyedStep[Config.currentMode].completed[
				`module${Config.currentIdx + 1}`
			] = true;
			resolve();
		});
	}
}
