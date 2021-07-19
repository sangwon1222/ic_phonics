import { App } from '../../com/core/App';
import { SceneBase } from '../../com/core/SceneBase';
import { Button } from '../../com/widget/Button';
import { EventType } from '../../com/core/EventType';
import { CustomEvent } from '../../com/core/CustomEvent';

// Manager
import { ViewerRscManager } from '../../com/manager/ViewerRscManager';
import { ProductRscManager } from '../../com/manager/ProductRscManager';
import { Rsc, SoundManager } from '../../com/manager/SoundManager';

// Scene
import { Video } from '../../com/widget/Video';
import { VideoPlayer } from '../../com/widget/VideoPlayer';
import gsap from 'gsap';
import pixiSound from 'pixi-sound';
import sound from 'pixi-sound';
import * as Util from '../../com/util/Util';
import { Texture } from 'pixi.js';
import Config from '@/com/util/Config';

export class Chant extends SceneBase {
	private mvideoController: VideoPlayer;
	private mAniTrueImg: PIXI.Sprite;

	private mAniTimeLine: any;
	private mViewSheet: PIXI.Spritesheet;

	constructor() {
		super();
		this.name = 'Chant';
	}

	async onInit() {
		//배경 색상을 나타낸다.
		const tColorAry = ProductRscManager.Handle.getResource(
			this.name,
			'bgcolor',
		) as any;
		const tBackImg = new PIXI.Graphics();
		tBackImg.beginFill(tColorAry[0]);
		tBackImg.drawRect(0, 0, App.Handle.appWidth, App.Handle.appHeight);
		tBackImg.endFill();
		// this.mStageCt.addChild(tBackImg);
		App.Handle.addChilds(this, tBackImg);

		this.mViewSheet = ViewerRscManager.Handle.getResource(
			'common',
			`ap_view.json`,
		).spritesheet;

		if (window['Android']) {
			window['Android'].showLoading();
		}

		this.mvideoController = new VideoPlayer(
			ProductRscManager.Handle.getResource(
				this.name,
				`sw_ch_${Config.subjectNum}.mp4`,
			).data,
			0,
			32,
		);

		// this.mvideoController.mVideo.position.set(500, 400);

		// this.mStageCt.addChild(this.mvideoController);
		App.Handle.addChilds(this, this.mvideoController);
		this.mvideoController.addCustomEventListener(EventType.ReceiveData, evt =>
			this.eventReceive(evt),
		);
		if (window['Android']) {
			window['Android'].hideLoading();
		} // 아이스크림 기기 내장 함수 호출

		this.mAniTrueImg = new PIXI.Sprite(
			this.mViewSheet.textures['truetrueUFO.png'],
		);
		this.mAniTrueImg.position.set(App.Handle.appWidth / 2 + 200, -300);
		// this.mStageCt.addChild(this.mAniTrueImg);
		App.Handle.addChilds(this, this.mAniTrueImg);

		//영상 실행전 모션을 나타낸다.
		// if (this.mTweenFunc !== null) {
		//     gsap.ticker.remove(this.mTweenFunc);
		//     this.mTweenFunc = null;
		// }
		// this.mTweenFunc = () => {this.tweenUpdate()};
		// gsap.ticker.add(this.mTweenFunc)

		this.dispatchEvent(EventType.ReceiveData, 'StartMode');
	}
	async onStart() {
		//
		await this.preLoadSound();
		this.showTrueTrue();
	}

	//사운드 미리 불러오기를 나타낸다.
	private async preLoadSound() {
		if (window['Android']) {
			if (App.Handle.loading === null || App.Handle.loading === undefined)
				window['Android'].showLoading();
		}

		const tSnds = [];
		tSnds.push([Rsc.viewer, 'common', 'button_click.mp3']);
		tSnds.push([Rsc.viewer, this.name, `sw_ch_dic.mp3`]);
		await SoundManager.Handle.loadSounds(tSnds);

		const tPreSnds = [];
		// tPreSnds.push([Rsc.viewer, 'common', 'intro_bgm.mp3', false]);
		// tPreSnds.push([Rsc.viewer, 'common', 'activity_bgm.mp3', true, true]);
		await SoundManager.Handle.loadPreSounds(tPreSnds);

		if (window['Android']) {
			if (App.Handle.loading === null || App.Handle.loading === undefined) {
				window['Android'].hideLoading();
			} else {
				App.Handle.loading.remove();
				App.Handle.loading.destroy();
				App.Handle.loading = null;
			}
		} // 아이스크림 기기 내장 함수 호출
	}

	private async showTrueTrue() {
		pixiSound.stopAll();
		// SoundManager.Handle.stopAll();
		App.Handle.removeMotionDelay();

		// const tReadySnd = ViewerRscManager.Handle.getResource(
		// 	this.name,
		// 	'snd_direction_01.mp3',
		// ) as any;
		this.destroyGsapAni();

		this.mAniTimeLine = gsap.timeline({});
		// gsap.killTweensOf(this.mAniTrueImg);
		this.mAniTimeLine.to(this.mAniTrueImg, {
			x: App.Handle.appWidth / 2 - this.mAniTrueImg.width / 2,
			y: 200,
			duration: 1,
		});
		this.mAniTimeLine.to(this.mAniTrueImg, {
			y: 150,
			duration: 1.5,
			repeat: -1,
			yoyo: true,
			yoyoEase: 'power1',
		});
		await App.Handle.tweenMotion('delay', 1);

		const tReadySnd = SoundManager.Handle.getSound(this.name, `sw_ch_dic.mp3`);

		if (!tReadySnd.isPlaying) {
			tReadySnd.play();
		}
		// const tDuration = await SoundManager.Handle.duration(this.name, tSndName);
		// console.log(tDuration);
		await App.Handle.tweenMotion('delay', tReadySnd.duration);
		// if (!tReadySnd.isPlaying) {

		gsap.to(this.mAniTrueImg, {
			x: App.Handle.appWidth / 2 - 500,
			y: -300,
			duration: 1,
		});

		gsap.to(this.mAniTrueImg, {
			alpha: 0,
			duration: 1,
			ease: 'expo.in',
		});

		console.log('End~~~');
		await App.Handle.tweenMotion('delay', 1);
		// if (this.mAniTrueImg.y < -90) {
		this.mAniTrueImg.visible = false;
		this.startAnimation();
		// }
	}

	//이벤트 받기를 나타낸다.
	private eventReceive(evt: CustomEvent) {
		if (evt.data == 'ClearMode') {
			// this.destroy();
			this.dispatchEvent(EventType.ReceiveData, evt.data);
		}
	}

	private destroyGsapAni() {
		if (this.mAniTimeLine) {
			this.mAniTimeLine.kill();
			this.mAniTimeLine = null;
		}
		gsap.killTweensOf(this.mAniTrueImg);
	}

	//동영상 실행을 나타낸다.
	private startAnimation() {
		// gsap.killTweensOf(this.mAniTrueImg);
		// gsap.ticker.remove(this.mTweenFunc);
		// this.mTweenFunc = null;
		this.destroyGsapAni();
		this.mvideoController?.checkStart(true);
		// if (App.Handle.pauseApp) {
		// 	this.mvideoController?.videoPause();
		// } else {
		// 	this.mvideoController?.videoPlay();
		// }

		// this.dispatchEvent(EventType.ReceiveData, 'ClearMode');
	}

	async onEnd() {
		// console.log('Animation onEnd');
		this.destroyGsapAni();
		SoundManager.Handle.removeAll();
		App.Handle.removeMotionDelay();
		await this.mvideoController?.onDestroy();
		await App.Handle.removeChilds();
		this.mvideoController = null;
	}
}
