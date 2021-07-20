import * as PIXI from 'pixi.js';
import { ResourceManager } from '../core/resourceManager';

export class Btn extends PIXI.Sprite {
	private mOn: PIXI.Texture;
	private mOff: PIXI.Texture;
	private mFlag: boolean;
	get flag(): boolean {
		return this.mFlag;
	}

	private mState: string;
	set state(v: string) {
		this.mState = v;
		if (this.mState == 'sound') {
			this.soundMode();
		}
		if (this.mState == 'stepMode') {
			this.stepMode();
		}
	}

	private mIdx: number;
	get idx(): number {
		return this.mIdx;
	}
	set idx(v: number) {
		this.mIdx = v;
	}

	private mScaleMotion: boolean;
	set scaleMotion(v: boolean) {
		this.mScaleMotion = v;
	}

	constructor(on: string, off: string) {
		super();
		this.mOn = ResourceManager.Handle.getCommon(on).texture;
		this.mOff = ResourceManager.Handle.getCommon(off).texture;

		this.mFlag = false;

		this.texture = this.mOn;
		this.anchor.set(0.5);

		this.interactive = true;
		this.buttonMode = true;

		this.on('pointertap', async () => {
			await this.onPointerTap();
		});
	}

	stepMode() {
		this.mIdx = 0;
	}

	interact(flag: boolean): Promise<void> {
		return new Promise<void>(resolve => {
			flag ? (this.texture = this.mOn) : (this.texture = this.mOff);
			this.interactive = flag;
			this.buttonMode = flag;
			resolve();
		});
	}

	async soundMode() {
		this.on('pointertap', async () => {
			await this.interact(false);
			await this.onPointerTap();
			await this.interact(true);
		});
	}

	toggle() {
		this.mFlag ? (this.texture = this.mOn) : (this.texture = this.mOff);

		this.mFlag = !this.mFlag;
	}

	customToggle(flag: boolean) {
		flag ? (this.texture = this.mOn) : (this.texture = this.mOff);
	}

	onPointerTap() {
		//
	}
}
