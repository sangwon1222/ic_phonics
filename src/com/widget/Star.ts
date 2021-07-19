// Manager
import { ViewerRscManager } from '../../com/manager/ViewerRscManager';
import { Rsc, SoundManager } from '../../com/manager/SoundManager';
// Scene
import gsap from 'gsap';

export class Star extends PIXI.Sprite {
	// private mTexture: PIXI.Texture;
	private mState: boolean;

	constructor(texture: PIXI.Texture, tBool: boolean) {
		super();

		this.texture = texture;
		this.mState = tBool;
		this.visible = this.mState;
	}

	showStar() {
		// if(this.mState){ this.texture = this.mTexture; }
		// else { this.texture = this.mDisTexture; }
		// this.mState = !this.mState;
		this.scale.set(2);
		this.visible = true;
		SoundManager.Handle.getSound('common', 'gain_star.mp3').play();
		gsap.to(this.scale, {
			x: 1,
			y: 1,
			duration: 0.3,
			ease: 'back.in(1.7)',
		});
	}

	hideStar() {
		this.visible = false;
	}
}
