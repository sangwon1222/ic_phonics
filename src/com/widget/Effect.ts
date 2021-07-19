import { App } from '../../com/core/App';
import { ObjectBase } from '../core/ObjectBase';
import { sound, spine } from 'pixi.js';

// Manager
import { ViewerRscManager } from '../../com/manager/ViewerRscManager';

export class Effect extends ObjectBase {
	private mBtnEffSpine: spine.Spine;

	constructor() {
		super();
		this.mBtnEffSpine = null;
	}

	createEffect(evt: PIXI.InteractionEvent) {
		this.removeEffect();

		this.mBtnEffSpine = new PIXI.spine.Spine(
			ViewerRscManager.Handle.getResource(
				'common',
				`click_effect.json`,
			).spineData,
		);
		// this.mBtnEffSpine.interactive = false;
		// this.mBtnEffSpine.visible = false;
		// App.Handle.addChilds(this, this.mBtnEffSpine);
		this.addChild(this.mBtnEffSpine);

		this.mBtnEffSpine.state.addListener({
			complete: (trackIndex: PIXI.spine.core.TrackEntry) => {
				setTimeout(() => {
					this.mBtnEffSpine.destroy();
					this.mBtnEffSpine = null;
				});
			},
		});

		const point = evt.data.getLocalPosition(this) as PIXI.Point;
		// console.log(point);
		this.mBtnEffSpine.position.set(point.x, point.y);
		// console.log(this.mBtnEffSpine.position);
		// this.mBtnEffSpine.visible = true;
		this.mBtnEffSpine.state.setAnimation(0, `animation`, false);
	}

	removeEffect() {
		if (this.mBtnEffSpine !== null) {
			this.mBtnEffSpine.destroy();
			this.mBtnEffSpine = null;
		}
	}
}
