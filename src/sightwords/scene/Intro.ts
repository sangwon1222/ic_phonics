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
		bgGraphics.beginFill(0xfd4f33);
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
			fill: 0x831300,
			fontFamily: 'minigate Bold ver2',
			fontWeight: 'normal',
			fontSize: 64,
			padding: 10,
		});
		this.tTitleCt = new PIXI.Container();
		const tTitleTxt = new PIXI.Text('SIGHT WORDS');
		tTitleTxt.style = style;
		// this.tempTxt.text = 'ALPHABET';
		tTitleTxt.anchor.set(0.5, 0.5);
		// tTitleTxt.position.set(App.Handle.appWidth / 2, -tTitleTxt.height);
		tTitleTxt.position.set(App.Handle.appWidth / 2, 0);
		// this.addChild(this.tempTxt);
		App.Handle.addChilds(this.tTitleCt, tTitleTxt);

		const styleEx = new PIXI.TextStyle({
			align: 'center',
			fill: 0x831300,
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
		if (this.subjectTxt.width > Config.width - 50) {
			subjectStyle.fontSize = 110;
		}
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
		tSnds.push([Rsc.viewer, 'common', 'title_sight_words.mp3']);
		tSnds.push([Rsc.product, 'common', `sw_in_${Config.subjectNum}.mp3`]);
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
		const tTitleSnd = SoundManager.Handle.getSound(
			'common',
			'title_sight_words.mp3',
		);
		tTitleSnd.play();

		await App.Handle.tweenMotion(
			'delay',
			tTitleSnd.duration > 1.5 ? tTitleSnd.duration : 1.5,
		);

		gsap.to(this.subjectTxt, { y: 290, duration: 1.5, ease: 'bounce.out' });
		await App.Handle.tweenMotion('delay', 0.5);
		const tSubTitleSnd = SoundManager.Handle.getSound(
			'common',
			`sw_in_${Config.subjectNum}.mp3`,
		);
		tSubTitleSnd.play();

		await App.Handle.tweenMotion(
			'delay',
			tSubTitleSnd.duration > 0.5 ? tSubTitleSnd.duration : 0.5,
		);

		const tCharacterCt = new PIXI.Container();
		const tCharacterShadowCt = new PIXI.Container();
		const tCharPos = [
			[245, 603],
			[469, 466.5],
			[573, 626.5],
			[660, 607],
			[722, 596],
			[1041, 597],
		];
		const tCharShadowPos = [
			[223.5, 684],
			null,
			[570.5, 702.5],
			[643, 682],
			[720.5, 672.5],
			[1038, 682],
		];

		const tCharSpAry = [];
		for (let i = 5; i >= 0; i--) {
			const tChaSpr = new PIXI.Sprite(
				this.mViewSheet.textures[`char${i + 1}.png`],
			);

			tChaSpr.anchor.set(0.5);
			tChaSpr.position.set(tCharPos[i][0], tCharPos[i][1]);

			if (tCharShadowPos[i] !== null) {
				const tChaShadowSpr = new PIXI.Sprite(
					this.mViewSheet.textures[`char${i + 1}_shadow.png`],
				);
				tChaShadowSpr.anchor.set(0.5);
				tChaShadowSpr.position.set(tCharShadowPos[i][0], tCharShadowPos[i][1]);

				App.Handle.addChilds(tCharacterShadowCt, tChaShadowSpr);
			}
			App.Handle.addChilds(tCharacterCt, tChaSpr);
			tCharSpAry.push(tChaSpr);
		}

		App.Handle.addChilds(this, tCharacterShadowCt);
		App.Handle.addChilds(this, tCharacterCt);

		const tPosX = tCharacterCt.position.x;
		tCharacterCt.position.x = tPosX - 50;
		tCharacterCt.alpha = 0;
		gsap.to(tCharacterCt, { x: tPosX, duration: 1, ease: 'power4.out' });
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

		await App.Handle.tweenMotion('delay', 0.5);

		for (let i = 0; i < 6; i++) {
			const tPosY = tCharSpAry[i].y - 50;
			gsap.to(tCharSpAry[i], {
				y: tPosY,
				duration: 0.5,
				repeat: 3,
				yoyo: true,
			});
			await App.Handle.tweenMotion('delay', 0.1);
		}
		await App.Handle.tweenMotion('delay', 1.5);
		// gsap.to
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
