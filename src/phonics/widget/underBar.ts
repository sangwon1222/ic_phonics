import { ResourceManager } from '../core/resourceManager';

export class Btn extends PIXI.Sprite {
	constructor(texture: string) {
		super();
		this.texture = ResourceManager.Handle.getCommon(texture).texture;
		this.anchor.set(0.5);
	}
}
export class UnderBar extends PIXI.Container {
	private mPrevBtn: PIXI.Sprite;
	private mNextBtn: PIXI.Sprite;
	constructor() {
		super();
	}
	async onInit() {
		this.mPrevBtn = new PIXI.Sprite(
			ResourceManager.Handle.getCommon('next_btn.png').texture,
		);
		this.mPrevBtn.angle = 180;
		this.mNextBtn = new PIXI.Sprite(
			ResourceManager.Handle.getCommon('next_btn.png').texture,
		);

		this.addChild(this.mPrevBtn, this.mNextBtn);
	}
}
