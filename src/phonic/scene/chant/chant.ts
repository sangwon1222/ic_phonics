import gsap, { Expo, Power0 } from 'gsap/all';
import { SceneBase } from '../../core/sceneBase';
import config from '../../../com/util/Config';
import { VideoControll } from '../../widget/videoControll';
import Config from '../../../com/util/Config';
import { Eop } from '@/phonic/widget/eop';
import { ResourceManager } from '@/phonic/core/resourceManager';
import { gameData } from '@/phonic/core/resource/product/gameData';
import { isIOS } from '@/phonic/utill/gameUtil';

const startColor = {
	1: 0x45c9fd, // 파랑
	2: 0xffba41, // 주황
	3: 0x00db9f, // 애매랄드
	4: 0x45c9fd,
	5: 0x00db9f,
	6: 0xffba41,
	7: 0x45c9fd,
	8: 0xffba41,
	9: 0x00db9f,
	10: 0x45c9fd,
	11: 0xffba41,
	12: 0xffba41,
	13: 0x45c9fd,
	14: 0xffba41,
	15: 0x00db9f,
	16: 0x45c9fd,
	17: 0xffba41,
	18: 0x00db9f,
	19: 0x45c9fd,
	20: 0xffba41,
	21: 0x00db9f,
	22: 0x45c9fd,
	23: 0xffba41,
	24: 0x00db9f,
	25: 0x45c9fd,
	26: 0xffba41,
	27: 0x00db9f,
	28: 0x45c9fd,
	29: 0xffba41,
	30: 0x00db9f,
	31: 0x45c9fd,
	32: 0xffba41,
	33: 0x00db9f,
	34: 0x45c9fd,
	35: 0xffba41,
	36: 0x00db9f,
	37: 0x45c9fd,
	38: 0xffba41,
	39: 0x00db9f,
	40: 0x45c9fd,
	41: 0xffba41,
	42: 0x00db9f,
	43: 0x45c9fd,
	44: 0xffba41,
	45: 0x00db9f,
	46: 0x45c9fd,
	47: 0xffba41,
	48: 0x00db9f,
	49: 0x45c9fd,
	50: 0xffba41,
	51: 0x00db9f,
	52: 0x45c9fd,
};
export class Chant extends SceneBase {
	private mStartDimmed: PIXI.Graphics;
	private mVideoSprite: PIXI.Sprite;
	private mVideoControll: VideoControll;

	private mGuideCharacter: PIXI.Sprite;

	constructor() {
		super('chant');
	}
	async onInit() {
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
		await this.settingVideo();
		this.mStartDimmed = new PIXI.Graphics();
		this.mStartDimmed.beginFill(startColor[Config.subjectNum], 1);
		this.mStartDimmed.drawRect(0, 0, Config.width, Config.height);
		this.mStartDimmed.endFill();
		this.addChild(this.mStartDimmed);

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
				data.completed.module1 ? await this.goScene('sound') : null;
			};
		}

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
	}

	async onStart() {
		await this.startGuide();
		await this.mVideoControll.onInit();
		gsap
			.to(this.mStartDimmed, { alpha: 0, duration: 0.2 })
			.eventCallback('onComplete', () => {
				this.removeChild(this.mStartDimmed);
				this.mStartDimmed = null;
			});
	}

	private loadGuideSnd(): Promise<void> {
		return new Promise<void>(resolve => {
			const title = gameData[`day${config.subjectNum}`].title.toLowerCase();

			window['guide_snd'] = document.createElement('audio');

			let url = '';
			Config.restAPIProd.slice(-2) == 'g/'
				? (url = `${Config.restAPIProd}ps_phonics/viewer/sounds/title/chant_${title}_${config.subjectNum}.mp3`)
				: (url = `${Config.restAPIProd}viewer/sounds/title/chant_${title}_${config.subjectNum}.mp3`);

			window['guide_snd'].src = url;

			window['guide_snd'].onloadedmetadata = () => {
				window['guide_snd'].onloadedmetadata = () => null;
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

		// chant가 시작되면 캐릭터가 내려온다.
		await this.downCharacter();
		// 캐릭터가 디렉션을 읽어준다.
		await this.readDirection(isIOS());
		// 디렉션사운드가 끝나면 다시 올라간다.
		await this.upCharacter();
	}

	// chant가 시작되면 캐릭터가 내려온다.
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
					resolve();
				});
		});
	}

	// 캐릭터가 디렉션을 읽어준다.
	private readDirection(ios: boolean): Promise<void> {
		return new Promise<void>(resolve => {
			if (ios) {
				let dimmed = new PIXI.Graphics();
				dimmed.beginFill(0x000000, 0.2);
				dimmed.drawRect(0, 0, Config.width, Config.height);
				dimmed.endFill();
				this.addChild(dimmed);
				dimmed.zIndex = 3;

				let hand = new PIXI.Sprite(
					ResourceManager.Handle.getCommon(`click.png`).texture,
				);
				hand.anchor.set(0.5);
				hand.position.set(Config.width / 2, Config.height / 2);
				hand.scale.set(1.6);
				let hanMotion = gsap.timeline({ repeat: -1, repeatDelay: 1 });
				hanMotion
					.to(hand, { alpha: 1, duration: 0.25 })
					.to(hand.scale, { x: 1, y: 1, duration: 0.5 })
					.to(hand, { alpha: 0, duration: 0.25 });

				dimmed.addChild(hand);
				dimmed.interactive = true;
				dimmed.buttonMode = true;

				dimmed.on('pointertap', () => {
					hanMotion.kill();
					hanMotion = null;
					gsap.killTweensOf(hand);
					dimmed.removeChild(hand);
					this.removeChild(dimmed);

					dimmed = null;
					hand = null;
					window['guide_snd'].play();
					gsap.delayedCall(window['guide_snd'].duration, () => {
						gsap.killTweensOf(this.mGuideCharacter);
						resolve();
					});
				});
			} else {
				window['guide_snd'].play();
				gsap.delayedCall(window['guide_snd'].duration, () => {
					gsap.killTweensOf(this.mGuideCharacter);
					resolve();
				});
			}
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
						if (window['guide_snd']) {
							window['guide_snd'].pause();
							window['guide_snd'] = null;
						}
						resolve();
					});
				});
		});
	}

	settingVideo(): Promise<void> {
		return new Promise<void>(resolve => {
			window['video'] = document.createElement('video');
			window['video'].setAttribute('playsinline', '');
			window['video'].setAttribute('autoplay', '');
			window['video'].setAttribute('crossorigin', '');

			let day = Config.subjectNum;
			let url = '';
			Config.restAPIProd.slice(-2) == 'g/'
				? (url = `${Config.restAPIProd}ps_phonics/viewer/videos/ph_ch_${day}.mp4`)
				: (url = `${Config.restAPIProd}viewer/videos/ph_ch_${day}.mp4`);

			window['video'].src = url;

			window['video'].onended = async () => {
				await this.endVideo();
			};

			this.mVideoSprite = new PIXI.Sprite();
			this.mVideoSprite.texture = PIXI.Texture.from(window['video']);
			this.mVideoSprite.width = config.width;
			this.mVideoSprite.height = config.width / 1.777;
			this.mVideoSprite.y = config.height - config.width / 1.777 + 18;
			this.mVideoControll = new VideoControll();
			this.addChild(this.mVideoSprite, this.mVideoControll);

			window['video'].oncanplay = async () => {
				window['video'].oncanplay = () => null;
				if (window['video']) {
					window['video'].currentTime = 0;
					window['video'].pause();
				}
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
		if (window['video'] && !window['video'].paused) {
			window['video'].pause();
		}
		window['video'] = null;
		await this.controller.completedLabel();
		this.blintBtn(true);
		// this.prevNextBtn.blintNextBtn(true);
	}
}
