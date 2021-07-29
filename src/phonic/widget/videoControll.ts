import * as PIXI from 'pixi.js';

import gsap from 'gsap/all';
import { ResourceManager } from '../core/resourceManager';
import config from '../../com/util/Config';
import { isIOS } from '../utill/gameUtil';

export class Btn extends PIXI.Sprite {
	private mOnTexture: PIXI.Texture;
	private mOffTexture: PIXI.Texture;
	private mFlag: boolean;
	get flag(): boolean {
		return this.mFlag;
	}

	constructor(texture: string, toggleTexture?: string) {
		super();
		this.texture = ResourceManager.Handle.getCommon(texture).texture;

		this.mFlag = false;
		if (toggleTexture) {
			this.mOnTexture = ResourceManager.Handle.getCommon(texture).texture;
			this.mOffTexture = ResourceManager.Handle.getCommon(
				toggleTexture,
			).texture;
		}

		this.anchor.set(0.5);

		this.interactive = true;
		this.buttonMode = true;
		this.on('pointertap', () => {
			this.mOffTexture ? this.onToggleTap() : null;
			this.onPointerTap();
		});
	}

	onToggleTap() {
		this.mFlag = !this.mFlag;
		this.mFlag
			? (this.texture = this.mOffTexture)
			: (this.texture = this.mOnTexture);
	}
	onPointerTap() {
		//
	}
}

export class PlayerBar extends PIXI.Container {
	private mWhiteBar: PIXI.Sprite;
	private mMoveFlag: boolean;
	get moveFlag(): boolean {
		return this.mMoveFlag;
	}

	private mCursor: PIXI.Sprite;
	set cursorX(videoRate: number) {
		this.mCursor.x = this.mWhiteBar.width * videoRate;
		this.mYellowMask.x = this.mCursor.x - this.mYellowMask.width;
	}

	private mYellowBar: PIXI.Sprite;

	private mYellowMask: PIXI.Sprite;

	private mEventRect: PIXI.Graphics;

	constructor() {
		super();
	}
	async onInit() {
		this.mMoveFlag = false;
		await this.createObject();
		await this.registEvent();
	}
	private createObject(): Promise<void> {
		return new Promise<void>(resolve => {
			this.mWhiteBar = new PIXI.Sprite(
				ResourceManager.Handle.getCommon('playbar.png').texture,
			);

			this.mYellowBar = new PIXI.Sprite(
				ResourceManager.Handle.getCommon('progress_1.png').texture,
			);

			this.mYellowMask = new PIXI.Sprite(
				ResourceManager.Handle.getCommon('progress_1.png').texture,
			);
			this.mYellowMask.x = -this.mYellowMask.width;
			this.mYellowBar.mask = this.mYellowMask;

			this.mCursor = new PIXI.Sprite(
				ResourceManager.Handle.getCommon('icon_position.png').texture,
			);
			this.mCursor.anchor.set(0.5);
			this.mCursor.y = 10;

			this.addChild(
				this.mWhiteBar,
				this.mYellowBar,
				this.mYellowMask,
				this.mCursor,
			);
			resolve();
		});
	}

	private registEvent(): Promise<void> {
		return new Promise<void>(resolve => {
			this.mEventRect = new PIXI.Graphics();
			this.mEventRect.beginFill(0x000000, 1);
			this.mEventRect.drawRect(0, -30, this.mWhiteBar.width, 80);
			this.mEventRect.endFill();
			this.mEventRect.alpha = 0;
			this.addChild(this.mEventRect);

			this.mEventRect.interactive = true;
			this.mEventRect.buttonMode = true;
			this.mEventRect
				.on('pointerdown', (evt: PIXI.InteractionEvent) => {
					this.mMoveFlag = true;
					const posX = evt.data.global.x - 200;
					this.mCursor.x = posX;
					this.mYellowMask.x = this.mCursor.x - this.mYellowMask.width;
				})
				.on('pointermove', (evt: PIXI.InteractionEvent) => {
					if (!this.mMoveFlag) return;
					const posX = evt.data.global.x - 200;
					this.mCursor.x = posX;
					this.mYellowMask.x = this.mCursor.x - this.mYellowMask.width;
				})
				.on('pointerup', (evt: PIXI.InteractionEvent) => {
					if (!this.mMoveFlag) return;
					const posX = evt.data.global.x - 200;
					this.mCursor.x = posX;
					this.mMoveFlag = false;
					window['video'].currentTime =
						window['video'].duration * (posX / this.mWhiteBar.width);
					window['video'].paused ? window['video'].play() : null;
				})
				.on('pointerout', () => {
					if (!this.mMoveFlag) return;
					window['video'].paused ? window['video'].play() : null;
					this.mMoveFlag = false;
				})
				.on('touchmove', (evt: PIXI.InteractionEvent) => {
					if (!this.mMoveFlag) return;
					const posX = evt.data.global.x - 200;
					if (posX <= 0 || posX > 744) {
						this.mMoveFlag = false;
					}
					this.mCursor.x = posX;
					this.mYellowMask.x = this.mCursor.x - this.mYellowMask.width;
				})
				.on('touchend', (evt: PIXI.InteractionEvent) => {
					if (!this.mMoveFlag) return;
					const posX = evt.data.global.x - 200;
					this.mCursor.x = posX;
					this.mMoveFlag = false;
					window['video'].currentTime =
						window['video'].duration * (posX / this.mWhiteBar.width);
					window['video'].paused ? window['video'].play() : null;
				})
				.on('touchendoutside', () => {
					if (!this.mMoveFlag) return;
					window['video'].paused ? window['video'].play() : null;
					this.mMoveFlag = false;
				});
			resolve();
		});
	}
}

export class UnderBar extends PIXI.Container {
	private mUnderBar: PIXI.Sprite;

	private mUnderBarMode: boolean;
	get underBarMode(): boolean {
		return this.mUnderBarMode;
	}

	set underBarMode(v: boolean) {
		this.mUnderBar.visible = v;

		this.mHideMode.visible = !v;

		this.mUnderBarMode = v;
	}

	private mHideMode: PIXI.Container;
	private mHideModeMask: PIXI.Sprite;

	private mPlayPauseBtn: Btn;
	private mAgainBtn: Btn;

	private mPlayerBar: PlayerBar;

	private mCurrentMin: PIXI.Text;
	private mCurrentSec: PIXI.Text;

	constructor() {
		super();
	}

	async onInit() {
		this.mUnderBarMode = false;
		this.mUnderBar = new PIXI.Sprite(
			ResourceManager.Handle.getCommon('player_bg.png').texture,
		);

		this.mPlayPauseBtn = new Btn('icon_pause.png', 'icon_play.png');
		this.mPlayPauseBtn.position.set(100, 80 / 2);
		this.mPlayPauseBtn.onPointerTap = async () => {
			if (window['video']) {
				this.mPlayPauseBtn.flag
					? window['video'].pause()
					: window['video'].play();
			}
		};

		this.mAgainBtn = new Btn('icon_position.png');
		this.mAgainBtn.position.set(150, 80 / 2);
		this.mAgainBtn.interactive = true;
		this.mAgainBtn.on('pointertap', () => {
			window['video'].currentTime = 0;
			window['video'] ? window['video'].play() : null;
		});

		this.mPlayerBar = new PlayerBar();
		await this.mPlayerBar.onInit();
		this.mPlayerBar.position.set(200, 80 / 2 - 10);

		this.mUnderBar.addChild(
			this.mPlayPauseBtn,
			this.mAgainBtn,
			this.mPlayerBar,
		);

		this.addChild(this.mUnderBar);
		await this.createHideMode();
		await this.createTimeText();
		await this.timeUpdate();

		const sound = new Btn('icon_speaker_on.png', 'icon_speaker_off.png');
		sound.position.set(1160, 40);
		sound.onPointerTap = () => {
			sound.flag ? (window['video'].volume = 0) : (window['video'].volume = 1);
		};

		this.mUnderBar.addChild(sound);
	}

	// 동영상의 현재진행시간 : 동영상의 총 길이
	createTimeText(): Promise<void> {
		return new Promise<void>(resolve => {
			const style = {
				fill: 0xbcbcbc,
				fontFamily: 'minigate Bold ver2',
				fontSize: 24,
				padding: 20,
			};
			const duration = Math.floor(window['video'].duration);
			let min = `${Math.floor(duration / 60)}`;
			if (`${Math.floor(duration / 60)}`.length == 1) {
				min = `0${Math.floor(duration / 60)}`;
			}
			let sec = `${duration % 60}`;
			if (`${duration % 60}`.length == 1) {
				sec = `0${duration % 60}`;
			}

			const totalMin = min;
			const totalSec = sec;
			const total = new PIXI.Text(`${totalMin} : ${totalSec}`, style);

			this.mCurrentMin = new PIXI.Text(`00 :`, style);
			this.mCurrentSec = new PIXI.Text(`00`, style);
			const colon = new PIXI.Text(`/`, style);
			colon.style.fontSize = 32;
			this.mCurrentMin.position.set(950, 26);
			this.mCurrentSec.position.set(
				this.mCurrentMin.x + this.mCurrentMin.width + 6,
				26,
			);
			colon.position.set(this.mCurrentSec.x + this.mCurrentSec.width, 20);
			total.position.set(colon.x + colon.width, 26);

			this.mUnderBar.addChild(this.mCurrentMin, this.mCurrentSec, colon, total);
			resolve();
		});
	}

	timeUpdate(): Promise<void> {
		return new Promise<void>(resolve => {
			window['video'].addEventListener('timeupdate', () => {
				if (window['video'] && !this.mPlayerBar.moveFlag) {
					const total = Math.floor(window['video'].duration);
					const current = Math.floor(window['video'].currentTime);

					`${Math.floor(current / 60)}`.length == 1
						? (this.mCurrentMin.text = `0${Math.floor(current / 60)} :`)
						: (this.mCurrentMin.text = `${Math.floor(current / 60)} :`);

					`${current % 60}`.length == 1
						? (this.mCurrentSec.text = `0${current % 60}`)
						: (this.mCurrentSec.text = `${current % 60}`);

					this.mPlayerBar.cursorX = current / total;

					if (this.mHideModeMask) {
						this.mHideModeMask.x =
							this.mHideModeMask.width * (current / total) -
							this.mHideModeMask.width;
					}
				}
			});
			resolve();
		});
	}

	createHideMode(): Promise<void> {
		return new Promise<void>(resolve => {
			this.mHideMode = new PIXI.Container();
			this.addChild(this.mHideMode);
			const white = new PIXI.Sprite(
				ResourceManager.Handle.getCommon('under_playerbar_bg.png').texture,
			);

			const red = new PIXI.Sprite(
				ResourceManager.Handle.getCommon('under_playerbar.png').texture,
			);
			this.mHideModeMask = new PIXI.Sprite(
				ResourceManager.Handle.getCommon('under_playerbar_bg.png').texture,
			);

			this.mHideMode.addChild(white, red, this.mHideModeMask);
			this.mHideMode.position.set(
				config.width / 2 - this.mHideMode.width / 2,
				80 - 4,
			);

			this.mHideModeMask.x = -this.mHideModeMask.width;
			red.mask = this.mHideModeMask;
			resolve();
		});
	}
}

export class VideoControll extends PIXI.Container {
	private mDimmed: PIXI.Graphics;
	private mUnderBar: UnderBar;
	private mPlayBtn: Btn;
	private mDelay3: any;

	constructor() {
		super();
	}
	async onInit() {
		window['video_controller'] = this;
		this.registDelay();
		await this.createDimmed();
		await this.createUnderBar();
		await this.mUnderBar.onInit();

		await this.hide();
		isIOS() ? await this.createPlayBtn() : window['video'].play();

		this.mDimmed.interactive = true;
		this.mUnderBar.interactive = true;
	}

	destroyDelay(): Promise<void> {
		return new Promise<void>(resolve => {
			if (this.mDelay3) {
				this.mDelay3.kill();
				this.mDelay3 = null;
			}
			resolve();
		});
	}
	private async registDelay() {
		await this.destroyDelay();
		this.mDelay3 = gsap.delayedCall(3, async () => {
			await this.hide();
		});
	}

	private createUnderBar(): Promise<void> {
		return new Promise<void>(resolve => {
			this.mUnderBar = new UnderBar();
			this.mUnderBar.y = config.height - 80;

			this.mUnderBar
				.on('pointerdown', async () => {
					await this.registDelay();
				})
				.on('pointerup', async () => {
					await this.registDelay();
				});

			this.addChild(this.mUnderBar);

			resolve();
		});
	}

	private createDimmed(): Promise<void> {
		return new Promise<void>(resolve => {
			this.mDimmed = new PIXI.Graphics();
			this.mDimmed.beginFill(0x000000, 1);
			this.mDimmed.drawRect(0, 0, config.width, config.height - 64);
			this.mDimmed.endFill();
			this.mDimmed.y = 64;
			this.mDimmed.alpha = 0;

			this.mDimmed.on('pointertap', async () => {
				if (this.mUnderBar.underBarMode) {
					await this.hide();
				} else {
					await this.show();
				}
			});

			this.addChild(this.mDimmed);

			resolve();
		});
	}

	// 처음 동영상 플레이 누르면 플레이하고 딤드 사라짐
	createPlayBtn(): Promise<void> {
		return new Promise<void>(resolve => {
			this.mDimmed.interactive = false;
			this.mDimmed.buttonMode = false;
			this.mDimmed.alpha = 0.6;
			this.mPlayBtn = new Btn(`btn_play.png`);
			this.mPlayBtn.position.set(config.width / 2, config.height / 2);
			this.addChild(this.mPlayBtn);
			this.mPlayBtn.onPointerTap = () => {
				this.mDimmed.alpha = 0;
				if (window['video'].currentTime == 1) {
					window['video'].currentTime = 0;
				}
				window['video'].play();
				this.mPlayBtn.visible = false;
				this.hide();
				this.mDimmed.interactive = true;
				this.mDimmed.buttonMode = true;
			};
			resolve();
		});
	}

	async waitingPlay() {
		this.mDimmed.alpha = 0.6;
		this.mPlayBtn.visible = true;
	}

	async hide() {
		await this.destroyDelay();
		gsap.killTweensOf(this.mUnderBar);
		this.mUnderBar.underBarMode = false;
	}

	async show() {
		await this.registDelay();
		gsap.killTweensOf(this.mUnderBar);
		this.mUnderBar.underBarMode = true;
	}
}
