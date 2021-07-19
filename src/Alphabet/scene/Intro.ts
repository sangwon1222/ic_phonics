import { App } from '../../com/core/App';
import { SceneBase } from '../../com/core/SceneBase';

// Manager
import { ViewerRscManager } from '../../com/manager/ViewerRscManager';
import { ProductRscManager } from '../../com/manager/ProductRscManager';
import { Rsc, SoundManager } from '../../com/manager/SoundManager';

// Scene
import { Button } from '../../com/widget/Button';
import { EventType } from '../../com/core/EventType';
import gsap from 'gsap';
import pixiSound from 'pixi-sound';
import Config from '@/com/util/Config';

export class Intro extends SceneBase {
	private tempBtn: Button;
	private closeBtn: Button;
	private tempTxt: PIXI.Text;
	private tTitleCt: PIXI.Container;
	private bgImg: PIXI.Sprite;
	private aniBigAlphabet: PIXI.Sprite;
	private aniSmallAlphabet: PIXI.Sprite;

	private mIntroMotion: any;

	constructor() {
		super();
		this.name = 'Intro';
	}

	async onInit() {
		//
		const bgGraphics = new PIXI.Graphics();

		// this.getDataInfo();
		const tViewSheet = ViewerRscManager.Handle.getResource(
			'common',
			`ap_view.json`,
		).spritesheet;

		const tProductSheet = ProductRscManager.Handle.getResource(
			'common',
			`ap_${App.Handle.getAlphabet}.json`,
		).spritesheet;

		const tColorAry = ProductRscManager.Handle.getResource(
			this.name,
			'bgcolor',
		) as any;

		bgGraphics.beginFill(tColorAry[0]);
		bgGraphics.drawRect(0, 0, App.Handle.appWidth, App.Handle.appHeight);
		bgGraphics.endFill();
		// this.addChild(bgGraphics);
		App.Handle.addChilds(this, bgGraphics);
		// this.bgImg = new PIXI.Sprite(ViewerRscManager.Handle.getResource("intro", "intro_bg.png").texture);
		// this.addChild(this.bgImg);

		// this.closeBtn = new Button(
		// 	ViewerRscManager.Handle.getResource(
		// 		'common',
		// 		'big_close_btn.png',
		// 	).texture,
		// );
		this.closeBtn = new Button(tViewSheet.textures['big_close_btn.png']);

		this.closeBtn.addCustomEventListener(EventType.ButtonUp, () => {
			this.dispatchEvent(EventType.ReceiveData, 'Quit');
		});

		this.closeBtn.setAnchor(0.5, 0.5);
		this.closeBtn.position.set(1234, 38);
		// this.addChild(this.closeBtn);
		App.Handle.addChilds(this, this.closeBtn);

		// const tSndPath = ViewerRscManager.Handle.getResource(
		// 	this.name,
		// 	'snd_bgm.mp3',
		// ) as any;

		// SoundManager.Handle.loadSound(tSndPath, 0, true);

		const style = new PIXI.TextStyle({
			align: 'center',
			fill: tColorAry[1],
			fontFamily: 'minigate Bold ver2',
			fontWeight: 'normal',
			fontSize: 64,
			padding: 10,
		});
		this.tTitleCt = new PIXI.Container();
		const tTitleTxt = new PIXI.Text('ALPHABET');
		tTitleTxt.style = style;
		// this.tempTxt.text = 'ALPHABET';
		tTitleTxt.anchor.set(0.5, 0.5);
		// tTitleTxt.position.set(App.Handle.appWidth / 2, -tTitleTxt.height);
		tTitleTxt.position.set(App.Handle.appWidth / 2, 0);
		// this.addChild(this.tempTxt);
		App.Handle.addChilds(this.tTitleCt, tTitleTxt);

		const styleEx = new PIXI.TextStyle({
			align: 'center',
			fill: tColorAry[1],
			fontFamily: 'minigate Bold ver2',
			fontStyle: 'italic',
			fontWeight: '',
			fontSize: 64,
			padding: 10,
		});

		const tTitleTxt2 = new PIXI.Text('!');
		tTitleTxt2.style = styleEx;
		// this.tempTxt.text = 'ALPHABET';
		tTitleTxt2.anchor.set(0.5, 0.5);
		// tTitleTxt2.position.set(App.Handle.appWidth / 2 200, -tTitleTxt2.height);
		tTitleTxt2.position.set(
			App.Handle.appWidth / 2 + tTitleTxt.width / 2 + 5,
			0,
		);
		// this.addChild(this.tempTxt);
		App.Handle.addChilds(this.tTitleCt, tTitleTxt2);

		this.tTitleCt.position.set(0, -100);
		App.Handle.addChilds(this, this.tTitleCt);

		const tPointsAry = ProductRscManager.Handle.getResource(
			this.name,
			'points',
		) as any;

		// this.aniBigAlphabet = new PIXI.Sprite(
		// 	ProductRscManager.Handle.getResource(
		// 		this.name,
		// 		`${App.Handle.getAlphabet}_cha1.png`,
		// 	).texture,
		// );
		this.aniBigAlphabet = new PIXI.Sprite(
			tProductSheet.textures[`${App.Handle.getAlphabet}_cha1.png`],
		);
		this.aniBigAlphabet.anchor.set(0.5);
		this.aniBigAlphabet.position.set(tPointsAry[0][0], tPointsAry[0][1]);
		// this.addChild(this.aniBigAlphabet);
		App.Handle.addChilds(this, this.aniBigAlphabet);

		// this.aniSmallAlphabet = new PIXI.Sprite(
		// 	ProductRscManager.Handle.getResource(
		// 		this.name,
		// 		`${App.Handle.getAlphabet}_cha2.png`,
		// 	).texture,
		// );
		this.aniSmallAlphabet = new PIXI.Sprite(
			tProductSheet.textures[`${App.Handle.getAlphabet}_cha2.png`],
		);
		this.aniSmallAlphabet.anchor.set(0.5);
		this.aniSmallAlphabet.position.set(tPointsAry[1][0], tPointsAry[1][1]);
		// this.addChild(this.aniSmallAlphabet);
		App.Handle.addChilds(this, this.aniSmallAlphabet);
	}
	async onStart() {
		await this.preLoadSound();
		// SoundManager.Handle.play(this.name, 'snd_bgm.mp3');
		// SoundManager.Handle.getSound(this.name, 'snd_bgm.mp3').play({ loop: true });
		this.showMotion();
		//
		// gsap
		// 	.to(this.tempTxt, { y: 127.5, duration: 1.5, ease: 'bounce.out' })
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
		// 		gsap
		// 			.to(this.aniSmallAlphabet, {
		// 				y: tBigAniY - 100,
		// 				duration: 0.5,
		// 				delay: 0.5,
		// 			})
		// 			.repeat(3)
		// 			.yoyo(true)
		// 			.eventCallback('onComplete', () => {
		// 				this.nextMode();
		// 			});
		// 		// gsap.to(this.aniBigAlphabet, {y: 250, duration: 2.5,  ease: CustomEase.create("custom", "M0,0 C0.126,0.382 0.04,1 0.15,1 0.312,1 0.304,0.001 0.46,0 0.501,0 0.49,0 0.54,0 0.654,0.002 0.603,0.5 0.7,0.5 0.832,0.5 0.84,0 1,0 ")});
		// 		// gsap.to(this.aniSmallAlphabet, {y: 250, duration: 2.5, delay: 0.6, ease: CustomEase.create("custom", "M0,0 C0.126,0.382 0.04,1 0.15,1 0.312,1 0.304,0.001 0.46,0 0.501,0 0.49,0 0.54,0 0.654,0.002 0.603,0.5 0.7,0.5 0.832,0.5 0.84,0 1,0 ")});
		// 	});
	}

	//사운드 미리 불러오기를 나타낸다.
	private async preLoadSound() {
		if (window['Android']) {
			if (App.Handle.loading === null || App.Handle.loading === undefined)
				window['Android'].showLoading();
		}

		const tSnds = [];
		tSnds.push([Rsc.viewer, 'common', 'button_click.mp3']);
		tSnds.push([Rsc.viewer, this.name, 'title_alphabet.mp3']);
		tSnds.push([Rsc.product, 'common', `${App.Handle.getAlphabet}.mp3`]);
		await SoundManager.Handle.loadSounds(tSnds);

		const tPreSnds = [];
		// tPreSnds.push([Rsc.viewer, 'common', 'letter_bgm.mp3', true]);
		tPreSnds.push([Rsc.viewer, 'common', 'intro_bgm.mp3', false, true]);
		// tPreSnds.push([Rsc.viewer, 'Game', 'snd_bgm.mp3', true]);
		// tPreSnds.push([Rsc.viewer, 'Outro', 'snd_bgm.mp3', true]);
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

	private async showMotion() {
		// pixiSound.stopAll();
		App.Handle.removeMotionDelay();

		// this.destroyGsapAni();

		const tBigAniY = this.aniBigAlphabet.y;
		// const tWordSnd = ProductRscManager.Handle.getResource(
		// 	'common',
		// 	`${App.Handle.getAlphabet}.mp3`,
		// ) as any;
		// const titleSnd = ViewerRscManager.Handle.getResource(
		// 	this.name,
		// 	'snd_ready.mp3',
		// ) as any;
		// // titleSnd.play();
		await App.Handle.tweenMotion('delay', 1);
		SoundManager.Handle.getSound(this.name, 'title_alphabet.mp3').play();
		// SoundManager.Handle.play(this.name, 'title_alphabet.mp3');
		gsap.to(this.tTitleCt, { y: 127.5, duration: 1.5, ease: 'bounce.out' });
		// this.mIntroMotion = gsap.timeline({});
		// this.mIntroMotion.to(this.tempTxt, {
		// 	y: 127.5,
		// 	duration: 1.5,
		// 	ease: 'bounce.out',
		// });

		const tDuration = SoundManager.Handle.getSound(
			this.name,
			'title_alphabet.mp3',
		).duration;
		// const tDuration = await SoundManager.Handle.duration(
		// 	this.name,
		// 	'title_alphabet.mp3',
		// );
		await App.Handle.tweenMotion('delay', tDuration > 1.5 ? tDuration : 1.5);
		// tWordSnd.play();
		await App.Handle.tweenMotion('delay', 0.5);
		SoundManager.Handle.getSound(
			'common',
			`${App.Handle.getAlphabet}.mp3`,
		).play();
		// this.mIntroMotion
		// 	.to(this.aniBigAlphabet, { y: tBigAniY - 100, duration: 0.5 })
		// 	.repeat(3)
		// 	.yoyo(true);
		// this.mIntroMotion
		// 	.to(this.aniSmallAlphabet, { y: tBigAniY - 100, duration: 0.5 })
		// 	.repeat(3)
		// 	.yoyo(true);
		gsap
			.to(this.aniBigAlphabet, { y: tBigAniY - 100, duration: 0.5 })
			.repeat(3)
			.yoyo(true);
		gsap
			.to(this.aniSmallAlphabet, {
				y: tBigAniY - 100,
				duration: 0.5,
				delay: 0.5,
			})
			.repeat(3)
			.yoyo(true)
			.eventCallback('onComplete', () => {
				this.nextMode();
			});
	}

	private getDataInfo() {
		console.log(this.name);
		// const tData = ProductRscManager.Handle.getResource( this.name, 'data') as any;
		// console.log(tData);
	}

	private nextMode() {
		gsap.delayedCall(0.5, () => {
			// this.destroy();
			this.dispatchEvent(EventType.ReceiveData, this.name);
		});
	}

	private destroyGsapAni() {
		gsap.killTweensOf(this.tTitleCt);
		gsap.killTweensOf(this.aniBigAlphabet);
		gsap.killTweensOf(this.aniSmallAlphabet);
	}

	async onEnd() {
		// console.log('Intro onEnd');
		SoundManager.Handle.removeAll();
		App.Handle.removeMotionDelay();
		this.destroyGsapAni();
		this.closeBtn?.removeCustomEventListener(EventType.ButtonUp);
		await App.Handle.removeChilds();
	}
}
