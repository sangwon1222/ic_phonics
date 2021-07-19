import { App } from '../../com/core/App';
import { SceneBase } from '../../com/core/SceneBase';

// Manager
import { ProductRscManager } from '../../com/manager/ProductRscManager';
import { ViewerRscManager } from '../../com/manager/ViewerRscManager';
import { Rsc, SoundManager } from '../../com/manager/SoundManager';

// Scene
import { Button } from '../../com/widget/Button';
import { EventType } from '../../com/core/EventType';
import gsap from 'gsap';

export class Outro extends SceneBase {
	private mCloseBtn: Button;
	private mTitleTxt: PIXI.Text;
	private mTureTrue: PIXI.Sprite;

	private mIntroMotion: any;
	private mViewSheet: PIXI.Spritesheet;

	constructor() {
		super();
		this.name = 'Outro';
	}

	async onInit() {
		//

		const bgGraphics = new PIXI.Graphics();

		// this.getDataInfo();

		// bgGraphics.beginFill(
		// 	ProductRscManager.Handle.getResource(this.name, 'bgcolor') as any,
		// );
		bgGraphics.beginFill(0xfd4f33);
		bgGraphics.drawRect(0, 0, App.Handle.appWidth, App.Handle.appHeight);
		bgGraphics.endFill();
		this.addChild(bgGraphics);
		// this.bgImg = new PIXI.Sprite(ViewerRscManager.Handle.getResource("intro", "intro_bg.png").texture);
		// this.addChild(this.bgImg);

		this.mViewSheet = ViewerRscManager.Handle.getResource(
			'common',
			`ap_view.json`,
		).spritesheet;

		this.mCloseBtn = new Button(this.mViewSheet.textures['big_close_btn.png']);

		this.mCloseBtn.addCustomEventListener(EventType.ButtonUp, () => {
			// this.destroy();
			this.dispatchEvent(EventType.ReceiveData, 'Quit');
		});

		this.mCloseBtn.setAnchor(0.5, 0.5);
		this.mCloseBtn.position.set(1234, 38);
		// this.addChild(this.closeBtn);
		App.Handle.addChilds(this, this.mCloseBtn);

		this.mTureTrue = new PIXI.Sprite(this.mViewSheet.textures['outro_cha.png']);
		this.mTureTrue.anchor.set(0.5);
		this.mTureTrue.position.set(640.5, 508);
		this.mTureTrue.alpha = 0;
		this.addChild(this.mTureTrue);

		// const BGM = ViewerRscManager.Handle.getResource(this.name, 'snd_bgm.mp3')
		// 	.sound;

		// BGM.play({ loop: true });

		const style = new PIXI.TextStyle({
			align: 'center',
			fill: '#FFFFFF',
			fontFamily: 'minigate Bold ver2',
			fontWeight: 'normal',
			fontSize: 127,
			// stroke: '#C45F52',
			// strokeThickness: 8,
			// lineJoin: 'round',
		});

		this.mTitleTxt = new PIXI.Text('See you next time');
		this.mTitleTxt.style = style;
		// this.tempTxt.text = 'ALPHABET';
		this.mTitleTxt.anchor.set(0.5, 0.5);
		this.mTitleTxt.position.set(App.Handle.appWidth / 2 - 10, 216.5);
		App.Handle.addChilds(this, this.mTitleTxt);

		const styleEx = new PIXI.TextStyle({
			align: 'center',
			fill: '#FFFFFF',
			fontFamily: 'minigate Bold ver2',
			fontStyle: 'italic',
			fontWeight: '',
			fontSize: 127,
			// stroke: '#C45F52',
			// strokeThickness: 8,
			// lineJoin: 'round',
			padding: 20,
		});

		const tTitleTxt2 = new PIXI.Text('!');
		tTitleTxt2.style = styleEx;
		// this.tempTxt.text = 'ALPHABET';
		tTitleTxt2.anchor.set(0.5, 0.5);
		// tTitleTxt2.position.set(App.Handle.appWidth / 2 200, -tTitleTxt2.height);
		tTitleTxt2.position.set(
			App.Handle.appWidth / 2 + this.mTitleTxt.width / 2,
			216.5,
		);
		App.Handle.addChilds(this, tTitleTxt2);
	}
	async onStart() {
		await this.preLoadSound();

		// SoundManager.Handle.play(this.name, 'snd_bgm.mp3');
		// SoundManager.Handle.getSound(this.name, 'snd_bgm.mp3').play();
		this.mTureTrue.scale.set(0.5);
		gsap.to(this.mTureTrue, { alpha: 1, duration: 1 });
		gsap.to(this.mTureTrue.scale, {
			x: 1,
			y: 1,
			duration: 1,
			ease: 'back.out',
		});

		SoundManager.Handle.play(this.name, 'snd_word.mp3');
		// SoundManager.Handle.getSound(this.name, 'snd_word.mp3').play();
		// gsap
		// 	.to(this.tempTxt, { y: 216.5, duration: 1.5, ease: 'bounce.out' })
		// 	.eventCallback('onComplete', () => {
		// 		const tBigAniY = this.aniBigAlphabet.y;
		// 		const wordSnd = ProductRscManager.Handle.getResource(
		// 			'common',
		// 			`snd_${App.Handle.getAlphabet}_word.mp3`,
		// 		).sound;
		// 		wordSnd.play();
		// 		gsap
		// 			.to(this.aniBigAlphabet, { y: tBigAniY - 100, duration: 0.5 })
		// 			.repeat(3)
		// 			.yoyo(true);
		// 		// gsap.to(this.aniSmallAlphabet, {y: tBigAniY - 100, duration: 0.5, delay: 0.5}).repeat(3).yoyo(true).eventCallback('onComplete', ()=>{ this.nextMode() });
		// 		// gsap.to(this.aniBigAlphabet, {y: 250, duration: 2.5,  ease: CustomEase.create("custom", "M0,0 C0.126,0.382 0.04,1 0.15,1 0.312,1 0.304,0.001 0.46,0 0.501,0 0.49,0 0.54,0 0.654,0.002 0.603,0.5 0.7,0.5 0.832,0.5 0.84,0 1,0 ")});
		// 		// gsap.to(this.aniSmallAlphabet, {y: 250, duration: 2.5, delay: 0.6, ease: CustomEase.create("custom", "M0,0 C0.126,0.382 0.04,1 0.15,1 0.312,1 0.304,0.001 0.46,0 0.501,0 0.49,0 0.54,0 0.654,0.002 0.603,0.5 0.7,0.5 0.832,0.5 0.84,0 1,0 ")});
		// 	});
		// if (this.mIntroMotion){
		//     this.mIntroMotion.kill();
		//     this.mIntroMotion = null;
		// }
		// const tBigAniY =  this.aniBigAlphabet.y;
		// this.mIntroMotion = gsap.timeline({});
		// this.mIntroMotion.to(this.tempTxt, {y: 130, duration: 1.5, ease: "bounce.out"});
		// const wordSnd = ProductRscManager.Handle.getResource('intro', 'snd_a_word.mp3').sound;
		// wordSnd.play();
		// this.mIntroMotion.to(this.aniBigAlphabet, {y: tBigAniY-100, duration: 0.5 }).repeat(3).yoyo(true);
		// this.mIntroMotion.to(this.aniSmallAlphabet, {y: tBigAniY - 100, duration: 0.5 }).repeat(3).yoyo(true);
	}

	//사운드 미리 불러오기를 나타낸다.
	private async preLoadSound() {
		if (window['Android']) {
			if (App.Handle.loading === null || App.Handle.loading === undefined)
				window['Android'].showLoading();
		}
		const tSnds = [];
		tSnds.push([Rsc.viewer, 'common', 'intro_bgm.mp3', false, true]);
		tSnds.push([Rsc.viewer, 'common', 'button_click.mp3']);
		tSnds.push([Rsc.viewer, this.name, 'snd_word.mp3']);
		await SoundManager.Handle.loadPreSounds(tSnds);
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

	private nextMode() {
		// gsap.delayedCall(0.5, ()=>{ this.dispatchEvent(EventType.ReceiveData, this.name); })
	}

	private destroyGsapAni() {
		gsap.killTweensOf(this.mTureTrue);
	}

	async onEnd() {
		SoundManager.Handle.removeAll();
		App.Handle.removeMotionDelay();
		this.destroyGsapAni();
		this.mCloseBtn?.removeCustomEventListener(EventType.ButtonUp);
		await App.Handle.removeChilds();
	}
}
