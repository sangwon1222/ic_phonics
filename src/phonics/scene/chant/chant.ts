import gsap from 'gsap/all';
import { SceneBase } from '../../core/sceneBase';
import config from '../../../com/util/Config';
import { VideoControll } from '../../widget/videoControll';
import Config from '../../../com/util/Config';
import { Eop } from '@/phonics/widget/eop';
import { PhonicsApp } from '@/phonics/core/app';

export class Chant extends SceneBase {
	private mVideoSprite: PIXI.Sprite;
	constructor() {
		super('chant');
	}
	async onInit() {
		this.prevNextBtn.onClickNext = async () => null;
		await this.controller.reset();

		Config.currentMode = 0;
		Config.currentIdx = 0;

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
		if (window['Android']) {
			window['Android'].hideLoading();
		} else {
			await PhonicsApp.Handle.loddingFlag(false);
		}
		// gsap.to(this.mVideoSprite, { alpha: 1, duration: 1 });

		this.prevNextBtn.disableBtn('prev');

		if (Config.isFreeStudy) {
			this.prevNextBtn.blintNextBtn(true);
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
			const url = `${Config.resource}${day}/chant/videos/song.mp4`;
			video.src = url;
			window['video'] = video;

			video.onended = async () => {
				await this.endVideo();
			};

			video.oncanplay = async () => {
				this.mVideoSprite = new PIXI.Sprite();
				this.mVideoSprite.texture = PIXI.Texture.from(video);
				this.mVideoSprite.width = config.width;
				this.mVideoSprite.height = config.height;
				this.mVideoSprite.y = 64;
				video.currentTime = 1;
				video.pause();
				video.oncanplay = () => null;

				const controll = new VideoControll();
				await controll.onInit();
				this.addChild(this.mVideoSprite, controll);
				resolve();
			};
		});
	}

	async endVideo() {
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
