import * as PIXI from 'pixi.js';
import { ResourceManager } from '../core/resourceManager';
import pixiSound from 'pixi-sound';

export class ProgressStep extends PIXI.Sprite {
	private mOn: PIXI.Texture;
	private mOff: PIXI.Texture;

	get idx(): number {
		return this.mIdx;
	}
	constructor(off: string, on: string, private mIdx: number) {
		super();
		this.mOn = ResourceManager.Handle.getCommon(on).texture;
		this.mOff = ResourceManager.Handle.getCommon(off).texture;

		this.interactive = true;
		this.buttonMode = true;

		this.on('pointertap', async () => {
			await this.onPointerTap();
		});
	}
	interact(flag: boolean) {
		if (flag) {
			this.texture = this.mOff;
		} else {
			this.texture = this.mOn;
			this.interactive = false;
		}
		this.anchor.set(0.5);
	}

	onPointerTap() {
		//
	}
}
