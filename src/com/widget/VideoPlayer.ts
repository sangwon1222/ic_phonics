//Base Module
import { App } from '../core/App';
import { ObjectBase } from '../core/ObjectBase';
import { EventType } from '../core/EventType';
import { CustomEvent } from '../core/CustomEvent';
//Pixi Module
import gsap from 'gsap';
//Manager Module
import { ViewerRscManager } from '../manager/ViewerRscManager';
//Scene Module
import { Button } from './Button';
import { Video } from './Video';
import * as Util from '../util/Util';

class ProgressBar extends ObjectBase {
	private mMask: PIXI.Graphics;
	private mBar: PIXI.Sprite;
	private mValue: number;
	private mMaxWidth: number;

	constructor(w: number, h: number, tBar: PIXI.Texture) {
		super();

		this.mBar = new PIXI.Sprite(tBar);
		this.mBar.anchor.set(0);
		this.mBar.position.set(-2, -2);

		this.addChild(this.mBar);

		this.mMaxWidth = w;
		this.mMask = new PIXI.Graphics();

		this.mMask.beginFill(0xff0000);
		this.mMask.drawRect(0, 0, 1, h);
		this.mMask.endFill();

		this.addChild(this.mMask);

		this.mBar.mask = this.mMask;
	}

	set value(v: number) {
		this.mValue = v;
		this.mMask.width = this.mMaxWidth * (this.mValue * 0.01);
	}
	get value(): number {
		return this.mValue;
	}
}

class Slider extends ObjectBase {
	private mBar: PIXI.Graphics;
	private mThumb: Button;
	private mDrag: boolean;

	constructor(w: number, h: number) {
		super();

		this.mDrag = false;

		const tViewSheet = ViewerRscManager.Handle.getResource(
			'common',
			`ap_view.json`,
		).spritesheet;

		this.mBar = new PIXI.Graphics();
		this.mBar.beginFill(0xffffff);
		this.mBar.drawRect(0, 0, w, h);
		this.mBar.endFill();
		this.mBar.alpha = 0.1;

		this.mBar.interactive = true;
		this.mBar.on('pointerdown', (evt: PIXI.InteractionEvent) => {
			this.barDown(evt);
		});
		this.mBar.on('pointerup', () => this.dragStop());
		this.mBar.on('pointerupoutside', () => this.dragStop());

		this.addChild(this.mBar);

		this.mThumb = new Button(tViewSheet.textures['thumb.png']);
		this.mThumb.setAnchor(0.5, 0.5);
		this.mThumb.y = this.mBar.height / 2;
		this.mThumb.setDrag();
		this.mThumb.addCustomEventListener(EventType.ButtonDown, evt =>
			this.thumbDown(evt),
		);
		this.mThumb.addCustomEventListener(EventType.ButtonMove, evt =>
			this.thumbMove(evt),
		);
		this.mThumb.addCustomEventListener(EventType.ButtonUp, () =>
			this.dragStop(),
		);
		this.mThumb.addCustomEventListener(EventType.ButtonOutSide, () =>
			this.dragStop(),
		);
		this.addChild(this.mThumb);
	}

	get isDraging(): boolean {
		return this.mDrag;
	}

	setThumPostion(v: number) {
		this.mThumb.x = this.mBar.width * v * 0.01;
	}

	private dragStop() {
		this.mDrag = false;
		this.dispatchEvent(EventType.SliderThumbUp);
	}

	private barDown(evt: PIXI.InteractionEvent) {
		const point = evt.data.getLocalPosition(this) as PIXI.Point;
		this.mThumb.x = point.x;
		const per = Math.round((point.x / this.mBar.width) * 100);

		this.mDrag = true;
		this.dispatchEvent(EventType.SliderThumbDown);
		this.dispatchEvent(EventType.SliderChange, per);
	}

	private thumbDown(evt: CustomEvent) {
		this.dispatchEvent(EventType.SliderThumbDown);
		this.mDrag = true;
	}

	private thumbMove(evt: CustomEvent) {
		if (this.mDrag) {
			const info = evt.data as PIXI.InteractionEvent;
			const point = info.data.getLocalPosition(this) as PIXI.Point;
			this.mThumb.x = point.x;

			let per = Math.round((point.x / this.mBar.width) * 100);

			if (this.mThumb.x < 0) {
				this.mThumb.x = 0;
				per = 0;
			}

			if (this.mThumb.x > this.mBar.width) {
				this.mThumb.x = this.mBar.width;
				per = 100;
			}
			this.dispatchEvent(EventType.SliderChange, per);
		}
	}
}

export class VideoPlayer extends ObjectBase {
	private mVideo: Video;

	// //-----------------------------------
	// // singleton
	// private static mVideo: Video;
	// static get video(): Video {
	// 	return this.mVideo;
	// }
	// //-----------------------------------

	private mValue: number;

	private mSlider: Slider;
	private mProgressBar: ProgressBar;
	private mSubProgressBar: ProgressBar;
	private mUnderProgressBarCt: PIXI.Container;

	private mPlayPauseBtn: Button;
	private mReplayBtn: Button;
	private mSpeakerBtn: Button;

	private mWhiteBackBtn: Button;
	private mPlayCenterBtn: Button;
	private mPlayCenterBtnContainer: PIXI.Container;

	private mController: PIXI.Container;

	private mTimeTxt: PIXI.Text;
	private mViewSheet: PIXI.Spritesheet;

	private mTime: number;
	private mStartFlag: boolean;

	constructor(video: HTMLVideoElement, posX: number, posY: number) {
		super();

		this.mStartFlag = false;
		this.mVideo = new Video(video);
		window['video'] = this;
		this.mVideo.addCustomEventListener(EventType.VideoTimeUpdata, evt =>
			this.onVideoTimeUpdata(evt),
		);
		this.mVideo.addCustomEventListener(EventType.VideoEnded, evt =>
			this.onVideoEnd(evt),
		);

		this.mVideo.position.set(posX, posY);
		App.Handle.addChilds(this, this.mVideo);

		this.mViewSheet = ViewerRscManager.Handle.getResource(
			'common',
			`ap_view.json`,
		).spritesheet;

		// 비디오 컨트롤러 컨테이너 생성
		this.mController = new PIXI.Container();
		// 하단 검정 반투명 배경 생성
		const controllerBg = new PIXI.Graphics();
		controllerBg.beginFill(0x000000);
		controllerBg.drawRect(0, 671, 1280, 81);
		controllerBg.endFill();
		controllerBg.alpha = 0.7;
		App.Handle.addChilds(this.mController, controllerBg);

		const progressBg = new PIXI.Sprite(
			this.mViewSheet.textures['progressBg.png'],
		);
		progressBg.anchor.set(0.5);
		progressBg.position.set(571, 711);
		App.Handle.addChilds(this.mController, progressBg);

		this.mProgressBar = new ProgressBar(
			731,
			14,
			this.mViewSheet.textures['progressBar.png'],
		);
		this.mProgressBar.position.set(206, 704);
		App.Handle.addChilds(this.mController, this.mProgressBar);

		this.mUnderProgressBarCt = new PIXI.Container();
		const tSubProgressBg = new PIXI.Sprite(
			this.mViewSheet.textures['under_playerbar_bg.png'],
		);
		tSubProgressBg.anchor.set(0);
		tSubProgressBg.position.set(0, 748);
		App.Handle.addChilds(this.mUnderProgressBarCt, tSubProgressBg);
		this.mSubProgressBar = new ProgressBar(
			1150,
			4,
			this.mViewSheet.textures['under_playerbar.png'],
		);
		this.mSubProgressBar.position.set(0, 748);
		this.mSubProgressBar.visible = true;
		App.Handle.addChilds(this.mUnderProgressBarCt, this.mSubProgressBar);
		this.mUnderProgressBarCt.position.set(70, 0);
		this.mUnderProgressBarCt.visible = false;
		App.Handle.addChilds(this, this.mUnderProgressBarCt);

		this.mSlider = new Slider(731, 14);
		this.mSlider.addCustomEventListener(EventType.SliderChange, evt =>
			this.onSliderChange(evt),
		);
		this.mSlider.addCustomEventListener(EventType.SliderThumbDown, evt => {
			this.mVideo.video.pause();
			App.Handle.xCaliper.MediaJumpedTo(this.mVideo, video.currentTime);
		});
		this.mSlider.addCustomEventListener(EventType.SliderThumbUp, evt => {
			if (this.mPlayPauseBtn.selected) {
				//play
				this.mVideo.video.pause();
			} else {
				//pause
				this.mVideo.video.play();
			}
		});
		this.mSlider.position.set(206, 704);
		App.Handle.addChilds(this.mController, this.mSlider);

		// Play & Pause 버튼
		this.mPlayPauseBtn = new Button(
			this.mViewSheet.textures['videoPauseBtn.png'],
			this.mViewSheet.textures['videoPlayBtn.png'],
		);

		this.mPlayPauseBtn.addCustomEventListener(EventType.ButtonUp, () =>
			this.onPlayAndPauseBtnUp(),
		);
		this.mPlayPauseBtn.setAnchor(0.5, 0.5);
		this.mPlayPauseBtn.position.set(116.5, 712);
		// this.mController.addChild(this.mPlayPauseBtn);
		App.Handle.addChilds(this.mController, this.mPlayPauseBtn);

		// Replay 버튼
		this.mReplayBtn = new Button(
			this.mViewSheet.textures['videoReplayBtn.png'],
		);
		this.mReplayBtn.addCustomEventListener(EventType.ButtonUp, () =>
			this.onReplayBtnUp(),
		);
		this.mReplayBtn.setAnchor(0.5, 0.5);
		this.mReplayBtn.position.set(167, 712);
		App.Handle.addChilds(this.mController, this.mReplayBtn);

		// Speaker 버튼
		this.mSpeakerBtn = new Button(
			this.mViewSheet.textures['videoSoundBtn.png'],
			this.mViewSheet.textures['videoSoundBtn_sel.png'],
		);
		this.mSpeakerBtn.addCustomEventListener(EventType.ButtonUp, () =>
			this.onSpeakerBtnUp(),
		);
		this.mSpeakerBtn.setAnchor(0.5, 0.5);
		this.mSpeakerBtn.position.set(1158, 712.5);
		App.Handle.addChilds(this.mController, this.mSpeakerBtn);

		this.mPlayCenterBtnContainer = new PIXI.Container();
		App.Handle.addChilds(this.mController, this.mPlayCenterBtnContainer);

		// 반투명 백색 배경 (컨트롤러가 보일때만 보임)
		this.mWhiteBackBtn = new Button(this.mViewSheet.textures['whiteBack.png']);
		this.mWhiteBackBtn.width = 1280;
		this.mWhiteBackBtn.height = 608;
		this.mWhiteBackBtn.alpha = 0.4;
		this.mWhiteBackBtn.position.set(0, 64);
		App.Handle.addChilds(this.mPlayCenterBtnContainer, this.mWhiteBackBtn);
		this.mWhiteBackBtn.addCustomEventListener(EventType.ButtonUp, () =>
			this.onPlayAndPauseBtnUp(),
		);

		// CenterPlay 버튼
		this.mPlayCenterBtn = new Button(
			this.mViewSheet.textures['videoPlayCenterBtn.png'],
		);
		this.mPlayCenterBtn.addCustomEventListener(EventType.ButtonUp, () =>
			this.onPlayAndPauseBtnUp(),
		);
		this.mPlayCenterBtn.setAnchor(0.5, 0.5);
		this.mPlayCenterBtn.position.set(640.5, 365.5);
		App.Handle.addChilds(this.mPlayCenterBtnContainer, this.mPlayCenterBtn);

		// 시간 Text
		const style = new PIXI.TextStyle({
			align: 'left',
			fill: '#dcdccc',
			fontFamily: 'NanumSquareRound',
			fontSize: 20,
		});
		this.mTimeTxt = new PIXI.Text('');
		this.mTimeTxt.style = style;
		this.mTimeTxt.anchor.set(0.5);
		this.mTimeTxt.position.set(1033, 711.5);
		App.Handle.addChilds(this.mController, this.mTimeTxt);

		this.interactive = true;
		this.mController.visible = false;
		this.mPlayCenterBtnContainer.visible = false;

		this.on('pointerup', () => {
			this.onController();
		});

		// 컨트롤러
		this.addChild(this.mController);
	}

	set value(v: number) {
		this.mValue = v;
		this.mSlider.setThumPostion(v);
		this.mProgressBar.value = this.mValue;
		this.mSubProgressBar.value = this.mValue;
	}
	get value(): number {
		return this.mValue;
	}

	videoPlay() {
		this.mVideo.video.play();
		App.Handle.xCaliper.MediaStarted(this.mVideo);
	}

	videoPause() {
		this.mVideo.video.pause();
		App.Handle.xCaliper.MediaPaused(this.mVideo);
	}

	videoStateCheck() {
		if (App.Handle.pauseApp) {
			//play
			this.mVideo.video.pause();
			// 비활성화 -> 활성화시 영상 일시정지 상태로 바꾸기 위한 처리를 나타낸다. 0413 QA팀
			gsap.killTweensOf(this.mController);
			this.mController.visible = true;
			this.mUnderProgressBarCt.visible = false;
			App.Handle.xCaliper.MediaPaused(this.mVideo);
		} else {
			App.Handle.pauseApp = false;
			this.mVideo.video.play();
			App.Handle.xCaliper.MediaStarted(this.mVideo);
		}
		this.mPlayPauseBtn.selected = App.Handle.pauseApp;
		this.mPlayCenterBtnContainer.visible = App.Handle.pauseApp;
	}

	private onSliderChange(evt: CustomEvent) {
		if (this.mSlider.isDraging) {
			const per: number = evt.data;
			this.value = per;
			this.mVideo.video.currentTime = this.mVideo.video.duration * per * 0.01;

			// 슬라이더 변화시 화면을 갱신을 위한 코드
			// 실시간으로 적용하면 화면이 씹히는 현상이 있어서 더 이상 이벤트가 없을 때 0.5초 후 갱신.
			clearTimeout(this.mTime);
			this.mTime = setTimeout(() => {
				this.videoUpDate();
				this.mVideo.videoTexture.update();
			}, 400);

			this.onController();
		}
	}

	private videoUpDate() {
		const video = this.mVideo.video;

		const min = Util.addZero(Math.floor(video.currentTime / 60), 2);
		const sec = Util.addZero(Math.floor(video.currentTime % 60), 2);

		const totalMin = Util.addZero(Math.floor(video.duration / 60), 2);
		const totalSec = Util.addZero(Math.floor(video.duration % 60), 2);

		this.mTimeTxt.text = `${min}:${sec} / ${totalMin}:${totalSec}`;
	}

	private onVideoTimeUpdata(evt: CustomEvent) {
		if (!this.mSlider.isDraging) {
			const per: number = evt.data;
			this.value = per;
			this.videoUpDate();
		}
	}

	private async onVideoEnd(evt: CustomEvent) {
		const tVolume = this.mVideo.video.volume;
		await App.Handle.xCaliper.MediaCompleted(this.mVideo);
		this.mVideo.video.volume = 0;
		this.mVideo.video.play();
		await App.Handle.tweenMotion('delay', 0.3);
		this.mPlayPauseBtn.selected = true;
		this.mVideo.video.currentTime = 0;
		this.mVideo.video.pause();
		tVolume > 0
			? (this.mVideo.video.volume = 1)
			: (this.mVideo.video.volume = 0);
		this.mPlayCenterBtnContainer.visible = true;
		this.onController();

		this.dispatchEvent(EventType.ReceiveData, 'ClearMode');
	}

	private onPlayAndPauseBtnUp() {
		this.mPlayPauseBtn.selected = !this.mPlayPauseBtn.selected;

		if (this.mPlayPauseBtn.selected) {
			//play
			this.mVideo.video.pause();
			this.mPlayCenterBtnContainer.visible = true;

			App.Handle.xCaliper.MediaPaused(this.mVideo);
		} else {
			//pause
			this.mVideo.video.play();
			this.mPlayCenterBtnContainer.visible = false;

			App.Handle.xCaliper.MediaResumed(this.mVideo);
		}
	}

	private onReplayBtnUp() {
		//
		this.mVideo.video.currentTime = 0;
		this.mPlayPauseBtn.selected = false;
		this.mVideo.video.play();
		this.mPlayCenterBtnContainer.visible = false;

		App.Handle.xCaliper.MediaRestarted(this.mVideo);
	}

	private onSpeakerBtnUp() {
		//
		this.mSpeakerBtn.selected = !this.mSpeakerBtn.selected;

		if (this.mSpeakerBtn.selected) {
			this.mVideo.video.volume = 0;

			App.Handle.xCaliper.MediaMuted(this.mVideo);
		} else {
			this.mVideo.video.volume = 1;

			App.Handle.xCaliper.MediaUnmuted(this.mVideo);
		}
	}

	private onController() {
		if (this.mStartFlag) {
			gsap.killTweensOf(this.mController);
			this.mController.visible = true;
			this.mUnderProgressBarCt.visible = false;
			if (!this.mPlayPauseBtn.selected) {
				gsap
					.to(this.mController, { visible: false, delay: 3, duration: 0 })
					.eventCallback('onComplete', () => {
						this.mUnderProgressBarCt.visible = true;
					});
			}
		}
	}

	checkStart(tflag: boolean) {
		this.mUnderProgressBarCt.visible = true;
		this.mStartFlag = tflag;
		this.videoStateCheck();
	}

	onResume() {
		this.mVideo.video.currentTime = 0;
		this.mPlayPauseBtn.selected = false;
		this.mVideo.video.play();
		this.mPlayCenterBtnContainer.visible = false;
		App.Handle.xCaliper.MediaResumed(this.mVideo);
	}

	async onDestroy() {
		await App.Handle.xCaliper.MediaEnded(this.mVideo);
		this.mVideo?.removeCustomEventListener(EventType.VideoTimeUpdata);
		this.mVideo?.removeCustomEventListener(EventType.VideoEnded);
		this.mSlider?.removeCustomEventListener(EventType.SliderChange);
		this.mSlider?.removeCustomEventListener(EventType.SliderThumbDown);
		this.mSlider?.removeCustomEventListener(EventType.SliderThumbUp);
		this.mPlayPauseBtn?.removeCustomEventListener(EventType.ButtonUp);
		this.mSpeakerBtn?.removeCustomEventListener(EventType.ButtonUp);
		this.mWhiteBackBtn?.removeCustomEventListener(EventType.ButtonUp);
		this.mPlayCenterBtn?.removeCustomEventListener(EventType.ButtonUp);
		window['video'] = null;
		this.mVideo?.onDestroy();
		this.mController = null;
	}
}
