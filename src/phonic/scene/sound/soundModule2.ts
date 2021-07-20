import Config from '@/com/util/Config';
import { gameData } from '@/phonic/core/resource/product/gameData';
import { ResourceManager } from '@/phonic/core/resourceManager';
import { Cam } from '@/phonic/widget/cam';
import RecordRTC from 'recordrtc';
import gsap, { Power0 } from 'gsap/all';
import pixiSound from 'pixi-sound';
import * as PIXI from 'pixi.js';
import { Sound } from './sound';
import { SoundModule } from './soundModule';
import { PhonicsApp } from '@/phonic/core/app';
import { debugLine } from '@/phonic/utill/gameUtil';
import { Eop } from '@/phonic/widget/eop';

// 카메라 필터버튼
export class FillterBtn extends PIXI.Sprite {
	private mNormal: PIXI.Texture;
	private mOn: PIXI.Texture;

	get charactor(): string {
		return this.mCharactor;
	}
	constructor(private mCharactor: string) {
		super();
		this.mNormal = ResourceManager.Handle.getCommon(
			`${this.mCharactor}_small.png`,
		).texture;
		this.mOn = ResourceManager.Handle.getCommon(
			`${this.mCharactor}_small_click.png`,
		).texture;

		this.texture = this.mNormal;
		this.anchor.set(0.5);

		this.interactive = true;
		this.buttonMode = true;
		this.on('pointertap', async () => {
			await this.onPointertap();
		});
	}

	// CharactorRemote에서 overwhite
	onPointertap() {
		//
	}

	able() {
		this.texture = this.mOn;
	}

	disable() {
		this.texture = this.mNormal;
	}
}

// 카메라 리모콘 (카메라 필터버튼이 모여 있는 곳)
export class CameraRemote extends PIXI.Container {
	private mBtnAry: Array<FillterBtn>;

	private mBubble: PIXI.Sprite;

	private mCameraFillter: PIXI.Sprite;
	private mBear: PIXI.Texture;
	private mPig: PIXI.Texture;
	private mChick: PIXI.Texture;

	private mTextureAry: Array<PIXI.Texture>;
	private mListAry: Array<string>;

	private mCam: Cam;
	private mMask: PIXI.Sprite;

	private mNowFillter: string;
	set nowFillter(v: string) {
		this.mNowFillter = v;
		this.updateFillterBtn();
	}
	constructor() {
		super();
	}
	async onInit() {
		this.removeChildren();
		await this.createFillter();
		await this.createRemote();

		this.mMask = new PIXI.Sprite(
			ResourceManager.Handle.getCommon('cam_off.png').texture,
		);
		this.mMask.anchor.set(0.5);
		this.mMask.position.set(this.mCameraFillter.x, this.mCameraFillter.y);
		this.addChild(this.mMask);
	}

	startCamera() {
		this.mMask.texture = ResourceManager.Handle.getCommon(
			'cam_mask.png',
		).texture;
		if (this.mCam) {
			return;
		}
		this.mCam = new Cam();
		this.addChild(this.mCam);

		if (Config.mobile) {
			this.mCam.onStart(
				Config.width / 2 - 265 / 2,
				this.mCameraFillter.y - 340 / 2,
				340,
				265,
				this.mMask,
			);
		} else {
			this.mCam.onStart(
				Config.width / 2 - 265 / 2,
				this.mCameraFillter.y - 340 / 2,
				265,
				340,
				this.mMask,
			);
		}
	}

	// 필터 , 말주머니 생성
	private createFillter(): Promise<void> {
		return new Promise<void>(resolve => {
			this.mBear = ResourceManager.Handle.getCommon('bear_big.png').texture;
			this.mPig = ResourceManager.Handle.getCommon('pig_big.png').texture;
			this.mChick = ResourceManager.Handle.getCommon('chick_big.png').texture;

			this.mListAry = ['bear', 'pig', 'chick'];
			this.mTextureAry = [this.mBear, this.mPig, this.mChick];

			const random = Math.floor(Math.random() * 3);

			this.mCameraFillter = new PIXI.Sprite();
			this.mCameraFillter.texture = this.mTextureAry[random];
			this.mCameraFillter.anchor.set(0.5);
			this.mCameraFillter.position.set(Config.width / 2 + 4, 300 - 64);
			this.mNowFillter = this.mListAry[random];

			this.mBubble = new PIXI.Sprite(
				ResourceManager.Handle.getCommon('speech_bubble.png').texture,
			);
			this.mBubble.anchor.set(0, 1);
			this.mBubble.position.set(
				this.mCameraFillter.x + 314 - this.mBubble.width / 2,
				this.mCameraFillter.y - 110 + this.mBubble.height / 2,
			);

			const txt = new PIXI.Text(gameData[`day${Config.subjectNum}`].title, {
				fontFamily: 'minigate Bold ver2',
				padding: 20,
				fontSize: 90,
				fill: 0x0080db,
			});
			txt.pivot.set(txt.width / 2, txt.height / 2);
			txt.position.set(
				20 + this.mBubble.width / 2,
				-6 - this.mBubble.height / 2,
			);

			this.mBubble.addChild(txt);

			this.mBubble.scale.set(0);

			gsap.to(this.mBubble.scale, {
				x: 1,
				y: 1,
				duration: 1,
			});
			this.addChild(this.mCameraFillter, this.mBubble);
			resolve();
		});
	}

	// 리모콘 생성 및 이벤트 등록
	private createRemote(): Promise<void> {
		return new Promise<void>(resolve => {
			const remoteBg = new PIXI.Graphics();
			remoteBg.beginFill(0xffffff, 1);
			remoteBg.drawRoundedRect(0, 0, 106, 300, 300);
			remoteBg.endFill();
			remoteBg.position.set(
				1196 - remoteBg.width / 2,
				390 - 64 - remoteBg.height / 2,
			);

			this.addChild(remoteBg);

			this.mBtnAry = [];

			const center = remoteBg.height / 2;
			const gap = 86 + 10;
			const y = [center - gap, center, center + gap];
			for (let i = 0; i < 3; i++) {
				const btn = new FillterBtn(this.mListAry[i]);
				btn.position.set(remoteBg.width / 2, y[i]);
				remoteBg.addChild(btn);
				this.mBtnAry.push(btn);

				if (btn.charactor == this.mNowFillter) {
					btn.able();
				}

				btn.onPointertap = () => {
					ResourceManager.Handle.getCommon('button_click.mp3').sound.play();
					this.nowFillter = btn.charactor;
				};
			}
			resolve();
		});
	}

	// Btn 클릭하면 필터 교체 (set에서 기능)
	updateFillterBtn() {
		for (let i = 0; i < this.mBtnAry.length; i++) {
			if (this.mNowFillter == this.mBtnAry[i].charactor) {
				this.mCameraFillter.texture = this.mTextureAry[i];
				this.mBtnAry[i].able();
			} else {
				this.mBtnAry[i].disable();
			}
		}
	}
}

// 녹음 버튼
export class RecBtn extends PIXI.Sprite {
	private mOn: PIXI.Texture;
	private mOff: PIXI.Texture;
	private mSpine: PIXI.spine.Spine;
	private mFlag: boolean;
	set flag(v: boolean) {
		this.mFlag = v;
	}

	get idx(): number {
		return this.mIdx;
	}
	get role(): string {
		return this.mRole;
	}
	constructor(private mIdx: number, private mRole: string) {
		super();

		this.mOn = ResourceManager.Handle.getCommon(
			`${this.mRole}_btn_on.png`,
		).texture;
		this.mOff = ResourceManager.Handle.getCommon(
			`${this.mRole}_btn_off.png`,
		).texture;

		this.mFlag = false;

		this.texture = this.mOn;
		this.anchor.set(0.5);

		this.mSpine = new PIXI.spine.Spine(
			ResourceManager.Handle.getCommon('timer_3sec.json').spineData,
		);
		this.addChild(this.mSpine);
		if (this.mRole == 'speacker') {
			this.mSpine.state.timeScale = window['currentAlphabet'].duration * 3;
		}
		this.mSpine.visible = false;
		this.mSpine.state.addListener({
			complete: () => {
				this.mSpine.visible = false;
				(this.parent as RecRemote).next(this.mIdx + 1);
				(this.parent as RecRemote).setBtnFlag(true);
				if (this.mRole == 'fin') {
					(this.parent.parent as Sound2).endGame();
				}
			},
		});

		this.on('pointertap', () => {
			if (this.mFlag) {
				let delay = 0;
				if (this.mRole == 'listen') {
					delay = 1.5;
				}
				this.onPointertap();
				if (window['Android']) {
					gsap.delayedCall(delay, () => {
						this.timeSpine();
					});
				} else {
					this.timeSpine();
				}
			}
		});
	}

	start() {
		this.able(true);
	}

	end() {
		this.able(false);
	}

	timeSpine() {
		if (this.mRole == 'speacker') {
			(this.parent.parent as Sound2).startCamera();
		}
		this.mSpine.state.setAnimation(0, `ani${this.mIdx + 1}`, false);
		this.mSpine.visible = true;
	}

	onPointertap() {
		//
	}

	able(flag: boolean) {
		if (flag) {
			this.texture = this.mOn;
			this.interactive = true;
			this.buttonMode = true;
		} else {
			this.texture = this.mOff;
			this.interactive = false;
			this.buttonMode = false;
		}
	}
}

// 녹음 리모콘 (녹음 버튼이 모여 있는 곳)
export class RecRemote extends PIXI.Container {
	private mBtnAry: Array<RecBtn>;
	private mStep: number;
	private mAffor: PIXI.Sprite;
	private mAfforAni: gsap.core.Timeline;

	get step(): number {
		return this.mStep;
	}
	constructor() {
		super();
	}
	async onInit() {
		this.removeChildren();
		this.sortableChildren = true;
		this.mStep = 0;
		this.mBtnAry = [];
		await this.createBtn();
		this.btnEvent();

		this.mAffor = new PIXI.Sprite(
			ResourceManager.Handle.getCommon('click.png').texture,
		);
		this.mAffor.visible = false;
		this.mAffor.anchor.set(0.5);
		this.mAffor.scale.set(2);
		this.mAffor.zIndex = 3;
		this.addChild(this.mAffor);
		this.mAffor.position.set(
			this.mBtnAry[this.mStep].x + 20,
			this.mBtnAry[this.mStep].y + 20,
		);
	}

	private createBtn(): Promise<void> {
		return new Promise<void>(resolve => {
			const btnList = ['speacker', 'rec', 'listen', 'fin'];
			let offsetX = 118 / 2;

			let startX = offsetX;
			let endX = 0;
			for (let i = 0; i < btnList.length; i++) {
				const btn = new RecBtn(i, btnList[i]);
				this.addChild(btn);
				this.mBtnAry.push(btn);

				i == btnList.length - 1 ? (endX = offsetX) : null;

				btn.position.set(offsetX, 0);
				offsetX += 154;
				btn.zIndex = 2;
			}

			const line = new PIXI.Graphics();
			line.beginFill(0xffffff, 1);
			line.drawRect(startX, 0, endX - startX, 6);
			line.endFill();
			this.addChild(line);
			line.zIndex = 1;

			resolve();
		});
	}

	async start() {
		this.mStep = 0;
		for (const btn of this.mBtnAry) {
			btn.end();
		}
		this.mBtnAry[this.mStep].flag = true;
		this.mBtnAry[this.mStep].start();

		await this.resumeAffor();
	}

	async next(nextStep: number) {
		this.mStep = nextStep;
		if (this.mStep >= this.mBtnAry.length) {
			return;
		}
		this.mAffor.x = this.mBtnAry[this.mStep].x + 20;
		await this.resumeAffor();
		for (const btn of this.mBtnAry) {
			if (btn.idx > this.mStep) {
				btn.end();
			} else {
				btn.start();
			}
		}
	}

	async resumeAffor() {
		await this.stopAffor();
		this.mAffor.visible = true;
		this.mAfforAni = gsap.timeline({ repeat: -1, repeatDelay: 3 });
		this.mAfforAni.to(this.mAffor, { alpha: 1, duration: 0 });
		this.mAfforAni.to(this.mAffor.scale, { x: 1, y: 1, duration: 0.5 });
		this.mAfforAni.to(this.mAffor.scale, { x: 1, y: 1, duration: 1 });
		this.mAfforAni.to(this.mAffor, { alpha: 0, duration: 0.5 });
	}

	stopAffor(): Promise<void> {
		return new Promise<void>(resolve => {
			if (this.mAfforAni) {
				this.mAfforAni.kill();
				this.mAffor.visible = false;
				this.mAffor.alpha = 0;
				this.mAffor.scale.set(2);
			}
			resolve();
		});
	}

	// 스피커 , 녹음 , 듣기 , 완료 버튼 눌렀을때
	async btnEvent() {
		for (const btn of this.mBtnAry) {
			btn.onPointertap = async () => {
				await this.stopAffor();

				// 스피커 눌렀을 때,
				await this.setBtnFlag(false);
				btn.able(true);

				if (PhonicsApp.Handle.controller.bgmFlag) {
					window['bgm'].volume = 0;
				}

				// RecBtn spine 모션이 끝나면 다음단계로 넘긴다. RecBtn=>timeSpine() 에 있음
				if (btn.role == 'speacker') {
					await this.clickSpeacker();
				}

				/**true면 bgm 나와야 할 때, ex_ 녹음하고 듣기버튼 안눌렀을때 */
				/**false면 bgm 멈춰있어야 할 때, ex_ 녹음하고 듣기버튼 바로눌렀을때 */
				// 녹음 눌렀을 때,
				if (btn.role == 'rec') {
					await this.clickRec();
				}

				// 듣기 눌렀을 때,
				if (btn.role == 'listen') {
					await this.clickListen();
				}

				if (PhonicsApp.Handle.controller.bgmFlag) {
					window['bgm'].volume = 1;
				}
				//fin 체크버튼 눌렀을 때는 RecBtn에서 스파인 끝나는 타이밍에 endGame을 켜준다.

				// btn 에서 setBtnFlag(true)가동
				// await this.setBtnFlag(true);
			};
		}
	}

	clickSpeacker(): Promise<void> {
		return new Promise<void>(resolve => {
			let snd = window['currentAlphabet'];
			snd.play();
			gsap.delayedCall(snd.duration, () => {
				snd = null;
				resolve();
			});
		});
	}

	clickRec(): Promise<void> {
		return new Promise<void>(resolve => {
			// 아이스크림 기기에서 실행할 때,
			if (window['Android']) {
				window['Android'].startRecord(1000 * 4.5);
				gsap.delayedCall(5, () => {
					resolve();
				});
			} else {
				// 웹브라우저에서 실행할 때,
				if (window['recSnd']) {
					window['recSnd'].pause();
					window['recSnd'] = null;
				}
				if (window['recorder']) {
					window['recorder'] = null;
				}

				navigator.mediaDevices
					.getUserMedia({
						video: false,
						audio: { echoCancellation: true },
					})
					.then(async function(stream) {
						const recorder = RecordRTC(stream, {
							type: 'audio/webm',
							mimeType: 'audio/webm',
						});
						window['recorder'] = recorder;

						recorder.startRecording();

						const sleep = m => new Promise(r => setTimeout(r, m));
						await sleep(3000);
					})
					.catch(error => {
						console.log(error);
						alert(
							`브라우저 설정에서 해당사이트에 대한 마이크설정을 허용해주세요.`,
						);
						location.reload();
					});
			}
			gsap.delayedCall(3, () => {
				resolve();
			});
		});
	}

	clickListen(): Promise<void> {
		return new Promise<void>(resolve => {
			if (window['Android']) {
				window['Android'].startSound();
			} else {
				if (window['recSnd']) {
					window['recSnd'].play();
				} else {
					window['recorder'].stopRecording(function() {
						const blob = window['recorder'].getBlob();
						const audioSrc = window.URL.createObjectURL(blob);
						const audio = new Audio(audioSrc);
						window['recSnd'] = audio;
						window['recSnd'].play();
					});
				}
			}

			gsap.delayedCall(3, async () => {
				if (window['Android']) {
					// await window['Android'].stopSound();
					gsap.delayedCall(1.5, async () => {
						await window['Android'].stopSound();
						resolve();
					});
				} else {
					window['recSnd'].pause();
					resolve();
				}
				// resolve();
			});
		});
	}

	setBtnFlag(flag: boolean): Promise<void> {
		return new Promise<void>(resolve => {
			for (const btn of this.mBtnAry) {
				if (flag) {
					if (btn.idx <= this.mStep) {
						btn.flag = flag;
					}
				} else {
					btn.able(false);
					btn.flag = flag;
				}
			}
			resolve();
		});
	}
}

export class Sound2 extends SoundModule {
	private mCameraRemote: CameraRemote;
	private mRecRemote: RecRemote;
	constructor() {
		super('sound2');
	}

	// 데이터 리셋 및 재설정
	async onInit() {
		Config.currentMode = 1;
		Config.currentIdx = 1;
		await (this.parent.parent as Sound).controller.reset();

		await pixiSound.resumeAll();
		this.removeChildren();
		const bg = new PIXI.Sprite(
			ResourceManager.Handle.getCommon('sound2_bg.png').texture,
		);
		this.addChild(bg);
	}

	// 게임 UI 생성
	async onStart() {
		await this.createObject();
		await this.mCameraRemote.onInit();
		await this.mRecRemote.onInit();

		await PhonicsApp.Handle.controller.settingGuideSnd(
			ResourceManager.Handle.getCommon('phonics_snd_dic2.mp3').sound,
		);
		await PhonicsApp.Handle.controller.startGuide();

		this.interactive = true;
		const clickEffect = new PIXI.spine.Spine(
			ResourceManager.Handle.getCommon('click_effect.json').spineData,
		);
		this.addChild(clickEffect);
		clickEffect.zIndex = 3;
		clickEffect.visible = false;

		let hideFuction = null;
		this.on('pointertap', (evt: PIXI.InteractionEvent) => {
			if (hideFuction) {
				hideFuction.kill();
				hideFuction = null;
			}
			clickEffect.position.set(evt.data.global.x, evt.data.global.y - 64);
			clickEffect.visible = true;
			clickEffect.state.setAnimation(0, 'animation', false);

			hideFuction = gsap.delayedCall(1, () => {
				clickEffect.visible = false;
			});
		});

		this.mRecRemote.start();
	}

	// 카메라 작동 시작
	startCamera() {
		this.mCameraRemote.startCamera();
	}

	// 카메라 리모콘과 녹음 리모콘을 만든다.
	createObject(): Promise<void> {
		return new Promise<void>(resolve => {
			this.mCameraRemote = new CameraRemote();
			this.mRecRemote = new RecRemote();
			this.mRecRemote.position.set(364, 592 - 64);

			this.addChild(this.mCameraRemote, this.mRecRemote);
			resolve();
		});
	}

	//게임모듈이 끝났을 때 실행, => eop 실행 및 데이터 초기화
	//RecBtn=> constuctor에서 실행

	async endGame() {
		await (this.parent.parent as Sound).controller.outro();
		await gsap.globalTimeline.clear();
		const eop = new Eop();
		eop.zIndex = 20;
		this.addChild(eop);
		await eop.onInit();
		await eop.start();
		await (this.parent.parent as Sound).endGame();
		// this.removeChildren();
		this.mCameraRemote = null;
		this.mRecRemote = null;
	}

	// this.parent.parent as Sound).endGame()=> 에서 실행 [메모리 초기화]
	async deleteMemory() {
		await gsap.globalTimeline.clear();
		this.removeChildren();
		this.mCameraRemote = null;
		this.mRecRemote = null;
	}
}
