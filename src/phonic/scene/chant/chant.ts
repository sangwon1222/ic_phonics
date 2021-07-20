import gsap from 'gsap/all';
import { SceneBase } from '../../core/sceneBase';
import config from '../../../com/util/Config';
import { VideoControll } from '../../widget/videoControll';
import Config from '../../../com/util/Config';
import { Eop } from '@/phonic/widget/eop';
import { PhonicsApp } from '@/phonic/core/app';
import { ResourceManager } from '@/phonic/core/resourceManager';

export class Chant extends SceneBase {
	private mVideoSprite: PIXI.Sprite;
	private mVideoControll: VideoControll;
	constructor() {
		super('chant');
	}
	async onInit() {
		Config.currentMode = 0;
		Config.currentIdx = 0;
		await this.controller.reset();

		this.prevNextBtn.onClickNext = async () => null;
		this.prevNextBtn.onClickPrev = async () => null;

		if (window['ticker']) gsap.ticker.remove(window['ticker']);
		await this.resetBtn();
		this.removeChildren();
		await this.createDimmed();
	}

	async onStart() {
		if (window['Android']) {
			window['Android'].showLoading();
		} else {
			await PhonicsApp.Handle.loddingFlag(true);
		}

		await this.settingVideo();

		await ResourceManager.Handle.loadCommonResource({
			sounds: [`title/chant_b_1.mp3`],
		});

		await PhonicsApp.Handle.controller.settingGuideSnd(
			ResourceManager.Handle.getCommon(`title/chant_b_1.mp3`).sound,
		);

		this.interactive = true;
		const clickEffect = new PIXI.spine.Spine(
			ResourceManager.Handle.getCommon('click_effect.json').spineData,
		);
		this.addChild(clickEffect);
		clickEffect.zIndex = 3;
		clickEffect.visible = false;

		let hideFuction = null;
		this.on('pointertap', (evt: PIXI.InteractionEvent) => {
			if (hideFuction) {
				hideFuction.kill();
				hideFuction = null;
			}
			clickEffect.position.set(evt.data.global.x, evt.data.global.y);
			clickEffect.visible = true;
			clickEffect.state.setAnimation(0, 'animation', false);

			hideFuction = gsap.delayedCall(1, () => {
				clickEffect.visible = false;
			});
		});

		// if (window['Android']) {
		// 	window['Android'].hideLoading();
		// } else {
		await PhonicsApp.Handle.loddingFlag(false);
		// }
		// gsap.to(this.mVideoSprite, { alpha: 1, duration: 1 });

		await PhonicsApp.Handle.controller.startGuide();
		await this.mVideoControll.onInit();

		this.prevNextBtn.disableBtn('prev');
		this.prevNextBtn.blintNextBtn(true);

		if (Config.isFreeStudy) {
			this.prevNextBtn.onClickNext = async () => {
				await this.goScene('sound');
			};
		} else {
			this.prevNextBtn.onClickNext = async () => {
				const data = this.controller.checkAbleLabel()[1];
				console.log(data);
				if (data.played) {
					await this.goScene('sound');
				}
			};
		}
	}

	settingVideo(): Promise<void> {
		return new Promise<void>(resolve => {
			const video = document.createElement('video');
			video.setAttribute('playsinline', '');
			video.setAttribute('autoplay', '');
			video.setAttribute('crossorigin', '');

			// const url = `https://imestudy.smartdoodle.net/ic_phonics/rsc/common/videos/song.mp4`;
			let day = `ps_phonics_01`;
			if (Config.subjectNum < 10) {
				day = `ps_phonics_0${Config.subjectNum}`;
			} else {
				day = `ps_phonics_${Config.subjectNum}`;
			}
			const url = `${Config.restAPIProd}ps_phonics/${day}/chant/videos/song.mp4`;
			video.src = url;
			window['video'] = video;

			video.onended = async () => {
				await this.endVideo();
			};

			video.oncanplay = async () => {
				this.mVideoSprite = new PIXI.Sprite();
				this.mVideoSprite.texture = PIXI.Texture.from(video);
				this.mVideoSprite.width = config.width;
				this.mVideoSprite.height = config.width / 1.777;
				this.mVideoSprite.y = 64;
				video.currentTime = 0;
				video.pause();
				video.oncanplay = () => null;

				this.mVideoControll = new VideoControll();
				this.addChild(this.mVideoSprite, this.mVideoControll);
				resolve();
			};
		});
	}

	async endVideo() {
		this.mVideoSprite = null;
		await this.controller.outro();
		const eop = new Eop();
		this.addChild(eop);
		eop.y = 64;
		await eop.onInit();
		await eop.start();

		await this.controller.completedLabel('sound');
		this.prevNextBtn.blintNextBtn(true);
	}
}
