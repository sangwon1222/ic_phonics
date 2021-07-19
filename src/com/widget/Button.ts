import { App } from '../../com/core/App';
import { ObjectBase } from '../core/ObjectBase';
import { EventType } from '../core/EventType';
import gsap from 'gsap';

// Manager
import { ViewerRscManager } from '../../com/manager/ViewerRscManager';
import { sound, spine } from 'pixi.js';
import { SoundManager } from '../manager/SoundManager';

export class Button extends ObjectBase {
	private mSprite: PIXI.Sprite;

	private mIndex: number;
	private mSelected: boolean;
	private mDisabled: boolean;
	private mIsBlinked: boolean;

	private mNormalTexture: PIXI.Texture;
	private mSelectTexture: PIXI.Texture;
	private mDisableTexture: PIXI.Texture;

	private mBtnEffSpine: spine.Spine;

	private mClickSnd: string;

	constructor(
		public normal: PIXI.Texture,
		sel?: PIXI.Texture,
		dis?: PIXI.Texture,
		public mNoSnd?: boolean,
		public mEff?: boolean,
	) {
		super();
		this.mSelected = false;
		this.mDisabled = false;
		this.buttonMode = true;
		this.interactive = true;
		this.mIsBlinked = false;
		// this.mBtnEffSpine = null;
		this.on('pointerdown', this.onButtonDown)
			.on('pointerup', this.onButtonUp)
			.on('pointerupoutside', this.onButtonOutSide)
			.on('pointerover', this.onButtonOver)
			.on('pointerout', this.onButtonOut);
		// .on('pointertap', this.onButtonTap);

		this.mNormalTexture = normal;

		sel ? (this.mSelectTexture = sel) : (this.mSelectTexture = normal);
		dis ? (this.mDisableTexture = dis) : (this.mDisableTexture = normal);

		this.mSprite = new PIXI.Sprite();
		this.mSprite.texture = this.mNormalTexture;
		// console.log(`!!! Button = ${}`);
		this.addChild(this.mSprite);

		// this.mClickSnd = ViewerRscManager.Handle.getResource(
		// 	'common',
		// 	'button_click.mp3',
		// ) as any;
	}

	blink(vLoop: number, vTime: number) {
		this.mSprite.alpha = 0.1;
		gsap.to(this.mSprite, {
			alpha: 1,
			duration: vTime,
			repeat: vLoop,
			repeatDelay: vTime,
			yoyo: true,
		});
		// gsap.delayedCall(vTime, () => {
		// 	gsap.to(this.mSprite, {
		// 		alpha: 1,
		// 		duration: vTime * 2,
		// 		repeat: vLoop,
		// 		repeatDelay: vTime,
		// 	});
		// });
		this.mIsBlinked = true;
	}

	stopblink() {
		if (this.mIsBlinked) {
			gsap.killTweensOf(this.mSprite);
			this.mSprite.alpha = 1;
		}
	}

	setAnchor(x: number, y: number) {
		this.mSprite.anchor.set(x, y);
	}

	setDrag() {
		this.on('pointermove', this.onButtonMove);
	}

	set index(idx: number) {
		this.mIndex = idx;
	}
	get index(): number {
		return this.mIndex;
	}

	set disabled(bool: boolean) {
		this.mDisabled = bool;
		this.renewal();
	}
	get disabled(): boolean {
		return this.mDisabled;
	}

	set selected(bool: boolean) {
		// console.log(bool)
		this.mSelected = bool;
		this.renewal();
	}
	get selected(): boolean {
		return this.mSelected;
	}

	private async onButtonDown(evt: PIXI.InteractionEvent) {
		// console.log(this.normal);
		if (this.mDisabled) return;
		if (!this.mNoSnd)
			SoundManager.Handle.getSound('common', 'button_click.mp3').play();

		this.dispatchEvent(EventType.ButtonDown, evt);
	}

	private onButtonUp(evt: PIXI.InteractionEvent) {
		if (this.mDisabled) return;
		this.dispatchEvent(EventType.ButtonUp, evt);
	}

	private onButtonOver(evt: PIXI.InteractionEvent) {
		if (this.mDisabled) return;
	}

	private onButtonOut(evt: PIXI.InteractionEvent) {
		if (this.mDisabled) return;
	}

	private onButtonOutSide(evt: PIXI.InteractionEvent) {
		if (this.mDisabled) return;
		this.dispatchEvent(EventType.ButtonOutSide, evt);
	}

	private onButtonMove(evt: PIXI.InteractionEvent) {
		if (this.mDisabled) return;
		this.dispatchEvent(EventType.ButtonMove, evt);
	}

	// private onButtonTap(evt: PIXI.InteractionEvent) {
	// 	if (this.mDisabled) return;
	// 	if (!this.mNoSnd)
	// 		SoundManager.Handle.getSound('common', 'button_click.mp3').play();
	// 	this.dispatchEvent(EventType.ButtonUp, evt);
	// }

	private renewal() {
		this.stopblink();
		// 버튼 사용불가
		if (this.mDisabled) {
			this.mSprite.texture = this.mDisableTexture;
			return;
		}

		if (this.mSelected) {
			this.mSprite.texture = this.mSelectTexture;
		} else {
			this.mSprite.texture = this.mNormalTexture;
		}
	}
}

//     const current = moveDragData.getLocalPosition(this.parent) as PIXI.Point;
//     const tx = Math.cos(this.rotation) * moveClickLocalPos.x - Math.sin(this.rotation) * moveClickLocalPos.y;
//     const ty = Math.sin(this.rotation) * moveClickLocalPos.x + Math.cos(this.rotation) * moveClickLocalPos.y;
//     this.x = current.x - tx;
//     this.y = current.y - ty;
