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
	private subjectTxt: PIXI.Text;
	private tTitleCt: PIXI.Container;
	private bgImg: PIXI.Sprite;
	private aniBigAlphabet: PIXI.Sprite;
	private aniSmallAlphabet: PIXI.Sprite;

	private mIntroMotion: any;
	private mViewSheet: PIXI.Spritesheet;

	constructor() {
		super();
		this.name = 'Intro';
	}

	async onInit() {
		const bgGraphics = new PIXI.Graphics();

		// const tColorAry = ProductRscManager.Handle.getResource(
		// 	this.name,
		// 	'bgcolor',
		// ) as any;

		// bgGraphics.beginFill(tColorAry[0]);
		bgGraphics.beginFill(0x48bfb0);
		bgGraphics.drawRect(0, 0, App.Handle.appWidth, App.Handle.appHeight);
		bgGraphics.endFill();
		App.Handle.addChilds(this, bgGraphics);

		this.mViewSheet = ViewerRscManager.Handle.getResource(
			'common',
			`ap_view.json`,
		).spritesheet;

		this.closeBtn = new Button(this.mViewSheet.textures['big_close_btn.png']);

		this.closeBtn.addCustomEventListener(EventType.ButtonUp, () => {
			this.dispatchEvent(EventType.ReceiveData, 'Quit');
		});

		this.closeBtn.setAnchor(0.5, 0.5);
		this.closeBtn.position.set(1234, 38);
		// this.addChild(this.closeBtn);
		App.Handle.addChilds(this, this.closeBtn);

		const style = new PIXI.TextStyle({
			align: 'center',
			fill: 0x1b4943,
			fontFamily: 'minigate Bold ver2',
			fontWeight: 'normal',
			fontSize: 64,
			padding: 10,
		});
		this.tTitleCt = new PIXI.Container();
		const tTitleTxt = new PIXI.Text('PHONICS READING');
		tTitleTxt.style = style;
		// this.tempTxt.text = 'ALPHABET';
		tTitleTxt.anchor.set(0.5, 0.5);
		// tTitleTxt.position.set(App.Handle.appWidth / 2, -tTitleTxt.height);
		tTitleTxt.position.set(App.Handle.appWidth / 2, 0);
		// this.addChild(this.tempTxt);
		App.Handle.addChilds(this.tTitleCt, tTitleTxt);

		const styleEx = new PIXI.TextStyle({
			align: 'center',
			fill: 0x1b4943,
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

		const subjectStyle = new PIXI.TextStyle({
			align: 'center',
			fill: 0xffffff,
			fontFamily: 'minigate Bold ver2',
			fontWeight: 'normal',
			fontSize: 126,
			padding: 10,
		});
		this.subjectTxt = new PIXI.Text(Config.subjectName);
		this.subjectTxt.style = subjectStyle;
		this.subjectTxt.anchor.set(0.5);
		this.subjectTxt.position.set(App.Handle.appWidth / 2, -100);
		App.Handle.addChilds(this, this.subjectTxt, true);
	}
	async onStart() {
		await this.preLoadSound();
		this.showMotion();
	}

	//사운드 미리 불러오기를 나타낸다.
	private async preLoadSound() {
		if (window['Android']) {
			if (App.Handle.loading === null || App.Handle.loading === undefined)
				window['Android'].showLoading();
		}
		const tPreSnds = [];
		tPreSnds.push([Rsc.viewer, 'common', 'intro_bgm.mp3', false, true]);
		// tPreSnds.push([Rsc.viewer, 'common', 'activity_bgm.mp3', true]);
		await SoundManager.Handle.loadPreSounds(tPreSnds);

		const tSnds = [];
		tSnds.push([Rsc.viewer, 'common', 'button_click.mp3']);
		tSnds.push([Rsc.viewer, this.name, 'title_phonics_reading.mp3']);
		tSnds.push([Rsc.product, 'common', `pr_in_${Config.subjectNum}.mp3`]);
		await SoundManager.Handle.loadSounds(tSnds);

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

		await App.Handle.tweenMotion('delay', 0.5);
		gsap.to(this.tTitleCt, { y: 127.5, duration: 1.5, ease: 'bounce.out' });
		await App.Handle.tweenMotion('delay', 0.5);
		SoundManager.Handle.getSound(this.name, 'title_phonics_reading.mp3').play();

		const tDuration = SoundManager.Handle.getSound(
			this.name,
			'title_phonics_reading.mp3',
		).duration;

		await App.Handle.tweenMotion('delay', tDuration > 1.5 ? tDuration : 1.5);

		gsap.to(this.subjectTxt, { y: 290, duration: 1.5, ease: 'bounce.out' });
		await App.Handle.tweenMotion('delay', 0.5);
		SoundManager.Handle.getSound(
			'common',
			`pr_in_${Config.subjectNum}.mp3`,
		).play();

		const tSubDuration = SoundManager.Handle.getSound(
			'common',
			`pr_in_${Config.subjectNum}.mp3`,
		).duration;

		await App.Handle.tweenMotion(
			'delay',
			tSubDuration > 0.5 ? tSubDuration : 0.5,
		);

		const tCharacterCt = new PIXI.Container();
		const tCharacterShadowCt = new PIXI.Container();
		const tCharPos = [
			[137, 482.5],
			[287.5, 528],
			[488, 557.5],
			[737.5, 522.5],
			[942, 535],
			[1132, 452],
		];
		const tCharShadowPos = [
			[136.5, 561],
			[280.5, 653],
			[467.5, 709.5],
			[745.5, 705.5],
			[965.5, 653],
			[1098.5, 561],
		];

		for (let i = 0; i < 6; i++) {
			const tChaSpr = new PIXI.Sprite(
				this.mViewSheet.textures[`char${i + 1}.png`],
			);

			tChaSpr.anchor.set(0.5);
			tChaSpr.position.set(tCharPos[i][0], tCharPos[i][1]);

			const tChaShadowSpr = new PIXI.Sprite(
				this.mViewSheet.textures[`char${i + 1}_shadow.png`],
			);
			tChaShadowSpr.anchor.set(0.5);
			tChaShadowSpr.position.set(tCharShadowPos[i][0], tCharShadowPos[i][1]);

			App.Handle.addChilds(tCharacterShadowCt, tChaShadowSpr);
			App.Handle.addChilds(tCharacterCt, tChaSpr);
		}

		App.Handle.addChilds(this, tCharacterShadowCt);
		App.Handle.addChilds(this, tCharacterCt);

		const tPosY = tCharacterCt.position.y;
		tCharacterCt.position.y = tPosY + 100;
		tCharacterCt.alpha = 0;
		gsap.to(tCharacterCt, { y: tPosY, duration: 1, ease: 'back.out(1.7)' });
		gsap.to(tCharacterCt, { alpha: 1, duration: 1 });

		tCharacterShadowCt.alpha = 0;
		gsap.to(tCharacterShadowCt, { alpha: 1, duration: 1 });
		// const tCharacter = new PIXI.Sprite(
		// 	ViewerRscManager.Handle.getResource(this.name, 'characters.png').texture,
		// );
		// tCharacter.anchor.set(0.5);
		// tCharacter.position.set(Config.width / 2, 900);
		// App.Handle.addChilds(this, tCharacter);

		// gsap.to(tCharacter, { y: 600, duration: 0.5 });

		await App.Handle.tweenMotion('delay', 1);
		this.nextMode();
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
