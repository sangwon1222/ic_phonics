import gsap, { Expo, Power0, Power1, Power3, Power4 } from 'gsap/all';
import { SceneBase } from '../../core/sceneBase';
import config from '../../../com/util/Config';
import { VideoControll } from '../../widget/videoControll';
import Config from '../../../com/util/Config';
import { Eop } from '@/phonic/widget/eop';
import { PhonicsApp } from '@/phonic/core/app';
import { ResourceManager } from '@/phonic/core/resourceManager';
import { gameData } from '@/phonic/core/resource/product/gameData';

export class Chant extends SceneBase {
	private mVideoSprite: PIXI.Sprite;
	private mVideoControll: VideoControll;

	private mGuideCharacter: PIXI.Sprite;

	constructor() {
		super('chant');
	}
	async onInit() {
		// 로딩 화면 켜주기
		await PhonicsApp.Handle.loddingFlag(true);

		/**
		 * 로딩시에 씬이동을 하면 버그에러가
		 * 생길 수 있어서 로딩 중에는 씬이동을 막아둔다.
		 */
		this.prevNextBtn.onClickNext = async () => null;
		this.prevNextBtn.onClickPrev = async () => null;

		// 액티비티 인덱스
		Config.currentMode = 0;
		// 액티비티 모듈 인덱스
		Config.currentIdx = 0;

		// 왼, 오른쪽 버튼 초기화
		await this.resetBtn();
		// chant가 0번째 액티비티이므로 이전버튼 비활성화
		this.prevNextBtn.disableBtn('prev');
		// 학습모드일때
		// chant를 완료하지 못했으면 다음버튼 비활성화
		if (!Config.isFreeStudy) {
			const completedData = this.controller.studyed[0].completed.module1;
			if (!completedData) {
				this.prevNextBtn.disableBtn('next');
			}
		}

		// game2 _ module2의 ticker가 살아 있을 수 있으니, 있으면 제거//
		if (window['ticker']) gsap.ticker.remove(window['ticker']);

		// stage 초기화
		this.removeChildren();

		// scenebase 공통 함수 => 액티비티 테두리 부분 둥글게
		await this.createDimmed();

		// 자유모드 , 학습모드 분기
		if (Config.isFreeStudy) {
			this.prevNextBtn.onClickNext = async () => {
				await this.goScene('sound');
			};
		} else {
			this.prevNextBtn.onClickNext = async () => {
				const data = this.controller.studyed[0];
				console.groupCollapsed(data.label);
				console.log(data.completed);
				console.groupEnd();
				if (data.completed.module1) {
					await this.goScene('sound');
				}
			};
		}
	}

	async onStart() {
		await this.settingVideo();
		await this.loadGuideSnd();

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

		await PhonicsApp.Handle.loddingFlag(false);
		await this.startGuide();
		await this.mVideoControll.onInit();
	}

	private loadGuideSnd(): Promise<void> {
		return new Promise<void>(resolve => {
			const title = gameData[`day${config.subjectNum}`].title.toLowerCase();
			window['chant_guide_snd'] = new Audio(
				// `${Config.restAPI}viewer/sounds/title/chant_${title}_${config.subjectNum}.mp3`,
				`${Config.restAPIProd}ps_phonics/viewer/sounds/title/chant_${title}_${config.subjectNum}.mp3`,
			);
			window['chant_guide_snd'].onloadedmetadata = () => {
				resolve();
			};
		});
	}
	// 가이드 디렉션 모션
	private async startGuide() {
		// 캐릭터 생성
		this.mGuideCharacter = new PIXI.Sprite(
			ResourceManager.Handle.getCommon('animation_cha.png').texture,
		);
		this.mGuideCharacter.anchor.set(0.5);
		this.mGuideCharacter.position.set(Config.width / 2 + 400, -100);
		this.addChild(this.mGuideCharacter);

		// chant가 시작되면 캐릭터가 내려와서 디렉션을 읽어준다.
		await this.downCharacter();
		// 디렉션사운드가 끝나면 다시 올라간다.
		await this.upCharacter();
	}

	// chant가 시작되면 캐릭터가 내려와서 디렉션을 읽어준다.
	private downCharacter(): Promise<void> {
		return new Promise<void>(resolve => {
			// y축
			gsap.to(this.mGuideCharacter, {
				y: 300,
				duration: 0.6,
				ease: Expo.easeOut,
			});
			// x축
			gsap
				.to(this.mGuideCharacter, {
					x: Config.width / 2,
					duration: 1.4,
					ease: Expo.easeOut,
				})
				.eventCallback('onComplete', () => {
					gsap.to(this.mGuideCharacter, { angle: 10, duration: 1 });
					gsap
						.to(this.mGuideCharacter, {
							angle: -10,
							duration: 1,
							ease: Power0.easeNone,
						})
						.delay(0.5)
						.yoyo(true)
						.repeat(-1);
				});
			window['chant_guide_snd'].play();
			gsap.delayedCall(window['chant_guide_snd'].duration, () => {
				gsap.killTweensOf(this.mGuideCharacter);
				resolve();
			});
		});
	}

	// 디렉션사운드가 끝나면 다시 올라간다.
	private upCharacter(): Promise<void> {
		return new Promise<void>(resolve => {
			gsap.to(this.mGuideCharacter, {
				y: -100,
				duration: 0.6,
				ease: Expo.easeIn,
			});
			gsap
				.to(this.mGuideCharacter, {
					x: Config.width / 2 - 600,
					duration: 0.6,
					ease: Expo.easeIn,
				})
				.eventCallback('onComplete', () => {
					gsap.delayedCall(0.5, () => {
						this.removeChild(this.mGuideCharacter);
						this.mGuideCharacter = null;
						if (window['chant_guide_snd']) {
							window['chant_guide_snd'].pause();
							window['chant_guide_snd'] = null;
						}
						resolve();
					});
				});
		});
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
				video.oncanplay = () => null;

				this.mVideoSprite = new PIXI.Sprite();
				this.mVideoSprite.texture = PIXI.Texture.from(video);
				this.mVideoSprite.width = config.width;
				this.mVideoSprite.height = config.width / 1.777;
				this.mVideoSprite.y = config.height - config.width / 1.777 + 18;
				video.currentTime = 0;
				video.pause();

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

		await this.controller.completedLabel();
		this.blintBtn(true);
		// this.prevNextBtn.blintNextBtn(true);
	}
}
